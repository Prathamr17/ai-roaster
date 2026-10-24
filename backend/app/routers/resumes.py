import re
import uuid
from typing import List, Optional

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, Form, Query, UploadFile
from pydantic import BaseModel, Field

from app.core.deps import require_auth
from app.core.errors import ApiError
from app.core.rate_limit import analyze_limiter
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.sections import BulletRewrite, ParsedSections
from app.models.user import User
from app.services.diff_service import diff_text, summarize
from app.services.gemini_service import analyze_resume
from app.services.pdf_service import extract_text
from app.services.structured_parser import (
    clean_bullet,
    fallback_parse_resume,
    looks_empty,
    merge_parsed_sections,
    parse_resume as parse_structured,
    render_parsed_sections_to_text,
)

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

MAX_PDF_BYTES = 5 * 1024 * 1024


def _validate_object_id(value: str, label: str = "id") -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except Exception:  # noqa: BLE001
        raise ApiError.bad_request(f"Invalid {label}")


async def _load_owned_resume(resume_id: str, user: User) -> Resume:
    oid = _validate_object_id(resume_id, "resume id")
    resume = await Resume.find_one(Resume.id == oid, Resume.user_id == user.id)
    if not resume:
        raise ApiError.not_found("Resume not found")
    return resume


async def _load_version(resume_id: PydanticObjectId, version_id: str) -> ResumeVersion:
    v_oid = _validate_object_id(version_id, "version id")
    version = await ResumeVersion.find_one(
        ResumeVersion.id == v_oid, ResumeVersion.resume_id == resume_id
    )
    if not version:
        raise ApiError.not_found("Resume version not found")
    return version


# --------------------------------------------------------------------------
# Upload / list / get / delete
# --------------------------------------------------------------------------

@router.post("", status_code=201)
@router.post("/", status_code=201)
async def upload_resume(
    file: UploadFile,
    title: Optional[str] = Form(None),
    user: User = Depends(require_auth),
):
    if file.content_type != "application/pdf":
        raise ApiError.bad_request("Only PDF files are supported")

    content = await file.read()
    if len(content) > MAX_PDF_BYTES:
        raise ApiError.bad_request("File too large (max 5MB)")

    raw_text, meta = await extract_text(content)
    if not raw_text or len(raw_text.strip()) < 20:
        raise ApiError.bad_request("Could not extract readable text from PDF")

    parsed_sections = await parse_structured(raw_text)

    filename = file.filename or "resume.pdf"
    clean_title = (title.strip() if title and title.strip() else None) or filename.rsplit(".", 1)[0]

    resume = Resume(
        user_id=user.id,
        title=clean_title,
        latest_version_number=1,
    )
    await resume.insert()

    version = ResumeVersion(
        resume_id=resume.id,
        version_number=1,
        label="V1 (Original)",
        raw_text=raw_text,
        parsed_sections=parsed_sections,
        source_type="upload",
    )
    await version.insert()

    resume.current_version_id = version.id
    await resume.save()

    return {"resume": resume.to_public(), "version": version.to_public(), "meta": meta}


@router.get("", status_code=200)
@router.get("/", status_code=200)
async def list_resumes(user: User = Depends(require_auth)):
    resumes = await Resume.find(Resume.user_id == user.id).sort("-created_at").to_list()
    out = []
    for r in resumes:
        latest = await ResumeVersion.find_one(
            ResumeVersion.resume_id == r.id,
            ResumeVersion.version_number == r.latest_version_number,
        )
        pub = r.to_public()
        pub["latestVersion"] = latest.to_public() if latest else None
        out.append(pub)
    return {"resumes": out}


@router.get("/{id}")
async def get_resume(id: str, user: User = Depends(require_auth)):
    resume = await _load_owned_resume(id, user)
    versions = await ResumeVersion.find(ResumeVersion.resume_id == resume.id).sort("+version_number").to_list()
    return {
        "resume": resume.to_public(),
        "versions": [v.to_public() for v in versions],
    }


@router.get("/{id}/versions/{version_id}")
async def get_version(id: str, version_id: str, user: User = Depends(require_auth)):
    resume = await _load_owned_resume(id, user)
    version = await _load_version(resume.id, version_id)
    return {"version": version.to_public()}


@router.delete("/{id}")
async def delete_resume(id: str, user: User = Depends(require_auth)):
    resume = await _load_owned_resume(id, user)
    await ResumeVersion.find(ResumeVersion.resume_id == resume.id).delete()
    await Analysis.find(Analysis.resume_id == resume.id).delete()
    await resume.delete()
    return {"ok": True}


# --------------------------------------------------------------------------
# Analyze
# --------------------------------------------------------------------------

class AnalyzeBody(BaseModel):
    version_id: Optional[str] = Field(default=None, alias="versionId")
    target_role: Optional[str] = Field(default=None, max_length=10000, alias="targetRole")

    class Config:
        populate_by_name = True


@router.post("/{id}/analyze", status_code=201)
async def analyze(
    id: str,
    body: AnalyzeBody,
    user: User = Depends(require_auth),
    _limiter: None = Depends(analyze_limiter),
):
    resume = await _load_owned_resume(id, user)

    version_id = body.version_id or (str(resume.current_version_id) if resume.current_version_id else None)
    if not version_id:
        raise ApiError.bad_request("No version to analyze")
    version = await _load_version(resume.id, version_id)

    result = await analyze_resume(version.raw_text, body.target_role)
    analysis_model = result.analysis

    bullet_rewrites = [
        BulletRewrite(
            id=str(uuid.uuid4()),
            section=r.section,
            original=r.original,
            rewritten=r.rewritten,
            rationale=r.rationale,
        )
        for r in analysis_model.bullet_rewrites
    ]

    saved = Analysis(
        user_id=user.id,
        resume_id=resume.id,
        version_id=version.id,
        ats_score=analysis_model.ats_score,
        score_breakdown=analysis_model.score_breakdown.model_dump(),
        issues=[i.model_dump() for i in analysis_model.issues],
        strengths=[s.model_dump() for s in analysis_model.strengths],
        bullet_rewrites=bullet_rewrites,
        keywords_present=analysis_model.keywords_present,
        keywords_missing=analysis_model.keywords_missing,
        summary=analysis_model.summary,
        model=result.model,
        prompt_tokens=result.prompt_tokens,
        response_tokens=result.response_tokens,
    )
    await saved.insert()

    version.latest_analysis_id = saved.id
    await version.save()

    return {"analysis": saved.to_public()}


@router.get("/{id}/analyses")
async def list_analyses(id: str, user: User = Depends(require_auth)):
    resume = await _load_owned_resume(id, user)
    analyses = await Analysis.find(Analysis.resume_id == resume.id).sort("-created_at").to_list()
    return {"analyses": [a.to_public() for a in analyses]}


@router.get("/{id}/versions/{version_id}/analysis")
async def get_version_analysis(id: str, version_id: str, user: User = Depends(require_auth)):
    resume = await _load_owned_resume(id, user)
    version = await _load_version(resume.id, version_id)
    analysis = (
        await Analysis.find(Analysis.resume_id == resume.id, Analysis.version_id == version.id)
        .sort("-created_at")
        .first_or_none()
    )
    return {"analysis": analysis.to_public() if analysis else None}


# --------------------------------------------------------------------------
# Rewrite
# --------------------------------------------------------------------------

class RewriteBody(BaseModel):
    analysis_id: str = Field(alias="analysisId")
    rewrite_ids: Optional[List[str]] = Field(default=None, alias="rewriteIds")
    label: Optional[str] = Field(default=None, max_length=40)

    class Config:
        populate_by_name = True


_NORMALIZE_PREFIX_RE = re.compile(r"^[\u2022\u2023\u25B6\u25C0\u25E6\u25A0\u25A1\u2219\u25AA\u25AB\u2013\u2014\-*\s]+")
_REWRITTEN_PREFIX_RE = re.compile(r"^[\u2022\u2023\u25B6\u25C0\u25E6\u25A0\u25A1\u2219\u25AA\u25AB\u2013\u2014\-*]\s*")
_BULLET_PREFIX_CAPTURE_RE = re.compile(r"^([\u2022\u2023\u25B6\u25C0\u25E6\u25A0\u25A1\u2219\u25AA\u25AB\u2013\u2014\-*]\s*)")


def _normalize_text(s: Optional[str]) -> str:
    s = _NORMALIZE_PREFIX_RE.sub("", (s or "").lower())
    return re.sub(r"\s+", " ", s).strip()


def _apply_rewrites_to_text(raw_text: str, rewrites: List[BulletRewrite]) -> str:
    result_lines = raw_text.split("\n")
    for r in rewrites:
        if not r.original or not r.rewritten:
            continue
        clean_orig = _normalize_text(r.original)
        clean_rewritten = clean_bullet(r.rewritten)
        if not clean_orig or not clean_rewritten:
            continue

        matched_idx = -1
        for i, line in enumerate(result_lines):
            line_norm = _normalize_text(line)
            if not line_norm:
                continue
            if line_norm == clean_orig or (len(clean_orig) >= 15 and (clean_orig in line_norm or line_norm in clean_orig)):
                matched_idx = i
                break

        if matched_idx >= 0:
            orig_line = result_lines[matched_idx]
            prefix_match = _BULLET_PREFIX_CAPTURE_RE.match(orig_line)
            prefix = prefix_match.group(1) if prefix_match else "\u2022 "
            result_lines[matched_idx] = f"{prefix}{clean_rewritten}"
        else:
            inserted = False
            section_name = (r.section or "EXPERIENCE").upper()
            for i, line in enumerate(result_lines):
                if section_name in line.upper():
                    result_lines.insert(i + 1, f"\u2022 {clean_rewritten}")
                    inserted = True
                    break
            if not inserted:
                result_lines.append(f"\u2022 {clean_rewritten}")

    return "\n".join(result_lines)


def _patch_bullets_in_sections(sections: Optional[ParsedSections], rewrites: List[BulletRewrite]) -> ParsedSections:
    if not sections or looks_empty(sections):
        return ParsedSections()

    base = sections.model_copy(deep=True)

    for r in rewrites:
        if not r.original or not r.rewritten:
            continue
        clean_orig = _normalize_text(r.original)
        clean_rewritten = clean_bullet(r.rewritten)
        if not clean_orig or not clean_rewritten:
            continue

        matched = False

        # 1. Search Experience
        for exp in base.experience:
            new_bullets = []
            for b in exp.bullets:
                norm_b = _normalize_text(b)
                if not matched and (
                    b == r.original
                    or norm_b == clean_orig
                    or (len(clean_orig) >= 15 and (clean_orig in norm_b or norm_b in clean_orig))
                ):
                    matched = True
                    new_bullets.append(clean_rewritten)
                else:
                    new_bullets.append(b)
            exp.bullets = new_bullets
            if matched:
                break

        if matched:
            continue

        # 2. Search Projects
        for proj in base.projects:
            new_bullets = []
            for b in proj.bullets:
                norm_b = _normalize_text(b)
                if not matched and (
                    b == r.original
                    or norm_b == clean_orig
                    or (len(clean_orig) >= 15 and (clean_orig in norm_b or norm_b in clean_orig))
                ):
                    matched = True
                    new_bullets.append(clean_rewritten)
                else:
                    new_bullets.append(b)
            proj.bullets = new_bullets

            if not matched and proj.description:
                norm_d = _normalize_text(proj.description)
                if (
                    proj.description == r.original
                    or norm_d == clean_orig
                    or (len(clean_orig) >= 15 and (clean_orig in norm_d or norm_d in clean_orig))
                ):
                    proj.description = clean_rewritten
                    matched = True

            if matched:
                break

        if matched:
            continue

        # 3. Search Summary
        if base.summary:
            norm_s = _normalize_text(base.summary)
            if (
                base.summary == r.original
                or norm_s == clean_orig
                or (len(clean_orig) >= 15 and (clean_orig in norm_s or norm_s in clean_orig))
            ):
                base.summary = clean_rewritten
                matched = True
                continue

        # 4. Fallback: append ONCE to relevant section
        sec_str = (r.section or "").lower()
        if ("proj" in sec_str or "project" in sec_str) and base.projects:
            base.projects[0].bullets.append(clean_rewritten)
        elif base.experience:
            base.experience[0].bullets.append(clean_rewritten)

    return base


@router.post("/{id}/rewrite", status_code=201)
async def rewrite(id: str, body: RewriteBody, user: User = Depends(require_auth)):
    resume = await _load_owned_resume(id, user)

    analysis_oid = _validate_object_id(body.analysis_id, "analysis id")
    analysis = await Analysis.find_one(Analysis.id == analysis_oid, Analysis.resume_id == resume.id)
    if not analysis:
        raise ApiError.not_found("Analysis not found")

    base_version = await _load_version(resume.id, str(analysis.version_id))

    if body.rewrite_ids:
        selected = [r for r in analysis.bullet_rewrites if r.id in body.rewrite_ids]
    else:
        selected = analysis.bullet_rewrites

    if not selected:
        raise ApiError.bad_request("No rewrites selected to apply")

    patched_sections = _patch_bullets_in_sections(base_version.parsed_sections, selected)

    if not looks_empty(patched_sections):
        new_raw = render_parsed_sections_to_text(patched_sections)
    else:
        new_raw = _apply_rewrites_to_text(base_version.raw_text, selected)

    next_number = resume.latest_version_number + 1

    new_version = ResumeVersion(
        resume_id=resume.id,
        version_number=next_number,
        label=(body.label or "").strip() or f"V{next_number}",
        raw_text=new_raw,
        parsed_sections=patched_sections,
        source_type="rewrite",
        parent_version_id=base_version.id,
    )
    await new_version.insert()

    resume.latest_version_number = next_number
    resume.current_version_id = new_version.id
    await resume.save()

    return {"version": new_version.to_public(), "appliedCount": len(selected)}


# --------------------------------------------------------------------------
# Diff
# --------------------------------------------------------------------------

@router.get("/{id}/diff")
async def diff(
    id: str,
    from_: str = Query(alias="from"),
    to: str = Query(...),
    mode: Optional[str] = Query(default="words"),
    user: User = Depends(require_auth),
):
    if mode not in ("words", "lines"):
        raise ApiError.bad_request("Validation failed")

    resume = await _load_owned_resume(id, user)
    from_v = await _load_version(resume.id, from_)
    to_v = await _load_version(resume.id, to)

    parts = diff_text(from_v.raw_text, to_v.raw_text, mode)
    return {
        "from": {"id": str(from_v.id), "label": from_v.label, "versionNumber": from_v.version_number},
        "to": {"id": str(to_v.id), "label": to_v.label, "versionNumber": to_v.version_number},
        "parts": parts,
        "stats": summarize(parts),
    }
