from fastapi import APIRouter, Depends

from app.core.deps import require_auth
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
@router.get("/", include_in_schema=False)
async def get_dashboard(user: User = Depends(require_auth)):
    resumes = await Resume.find(Resume.user_id == user.id).sort("-updated_at").to_list()
    resume_ids = [r.id for r in resumes]
    resume_map = {str(r.id): r for r in resumes}

    rewrite_count = await ResumeVersion.find(
        {"resumeId": {"$in": resume_ids}, "sourceType": "rewrite"}
    ).count()
    analysis_count = await Analysis.find(Analysis.user_id == user.id).count()

    latest_resume_meta = resumes[0] if resumes else None

    latest_resume = None
    score_series = []
    version_stack = []

    if latest_resume_meta:
        versions = (
            await ResumeVersion.find(ResumeVersion.resume_id == latest_resume_meta.id)
            .sort("+version_number")
            .to_list()
        )

        analysis_ids = [v.latest_analysis_id for v in versions if v.latest_analysis_id]
        analyses = (
            await Analysis.find({"_id": {"$in": analysis_ids}}).to_list() if analysis_ids else []
        )
        score_by_version = {str(a.version_id): a.ats_score for a in analyses}

        versions_with_scores = [
            {
                "id": v.id,
                "label": v.label,
                "versionNumber": v.version_number,
                "sourceType": v.source_type,
                "createdAt": v.created_at,
                "score": score_by_version.get(str(v.id)),
            }
            for v in versions
        ]

        latest_resume = {
            "_id": str(latest_resume_meta.id),
            "title": latest_resume_meta.title,
            "latestVersionNumber": latest_resume_meta.latest_version_number,
            "updatedAt": latest_resume_meta.updated_at,
            "currentVersionId": str(latest_resume_meta.current_version_id)
            if latest_resume_meta.current_version_id
            else None,
        }

        score_series = [
            {"label": v["label"], "score": v["score"], "versionId": str(v["id"]), "at": v["createdAt"]}
            for v in versions_with_scores
            if v["score"] is not None
        ]

        last3 = versions_with_scores[-3:]
        for i, v in enumerate(last3):
            prev = last3[i - 1] if i > 0 else None
            delta = (
                v["score"] - prev["score"] if v["score"] is not None and prev and prev["score"] is not None else 0
            )
            title = (
                "Upload"
                if v["sourceType"] == "upload"
                else "Rewrite pass"
                if v["sourceType"] == "rewrite"
                else v["label"]
            )
            version_stack.append(
                {
                    "id": str(v["id"]),
                    "label": v["label"],
                    "title": title,
                    "score": v["score"] or 0,
                    "delta": delta,
                }
            )

    all_analyses = await Analysis.find(Analysis.user_id == user.id).sort("+created_at").to_list()

    latest_analysis = all_analyses[-1] if all_analyses else None
    prev_analysis = all_analyses[-2] if len(all_analyses) > 1 else None

    score_spark = [{"v": a.ats_score} for a in all_analyses[-10:]]
    versions_spark = [{"v": r.latest_version_number or 1} for r in list(reversed(resumes[:10]))]
    keywords_spark = [{"v": len(a.keywords_present)} for a in all_analyses[-10:]]
    issues_spark = [{"v": len(a.issues)} for a in all_analyses[-10:]]

    kpi = {
        "atsScore": {
            "value": latest_analysis.ats_score if latest_analysis else None,
            "delta": (latest_analysis.ats_score - prev_analysis.ats_score)
            if latest_analysis and prev_analysis
            else None,
            "spark": score_spark,
        },
        "versions": {
            "value": sum(r.latest_version_number or 1 for r in resumes),
            "delta": None,
            "spark": versions_spark,
        },
        "issuesIdentified": {
            "value": len(latest_analysis.issues) if latest_analysis else None,
            "delta": (len(latest_analysis.issues) - len(prev_analysis.issues))
            if latest_analysis and prev_analysis
            else None,
            "spark": issues_spark,
        },
        "keywordsMatched": {
            "value": len(latest_analysis.keywords_present) if latest_analysis else None,
            "total": (len(latest_analysis.keywords_present) + len(latest_analysis.keywords_missing))
            if latest_analysis
            else None,
            "delta": (len(latest_analysis.keywords_present) - len(prev_analysis.keywords_present))
            if latest_analysis and prev_analysis
            else None,
            "spark": keywords_spark,
        },
    }

    recent_versions = (
        await ResumeVersion.find({"resumeId": {"$in": resume_ids}})
        .sort("-created_at")
        .limit(10)
        .to_list()
    )
    recent_analyses = (
        await Analysis.find(Analysis.user_id == user.id).sort("-created_at").limit(10).to_list()
    )

    events = []

    for r in resumes[:10]:
        events.append(
            {
                "id": f"r-{r.id}",
                "type": "upload",
                "title": f"{r.title} uploaded",
                "subtitle": "Parsed and version V1 created",
                "label": "V1",
                "at": r.created_at,
                "resumeId": str(r.id),
            }
        )

    for v in recent_versions:
        if v.source_type != "rewrite":
            continue
        resume = resume_map.get(str(v.resume_id))
        events.append(
            {
                "id": f"v-{v.id}",
                "type": "rewrite",
                "title": f"{v.label} created for {resume.title if resume else 'resume'}",
                "subtitle": "Rewrites applied",
                "label": f"{v.label} created",
                "at": v.created_at,
                "resumeId": str(v.resume_id),
            }
        )

    for a in recent_analyses:
        resume = resume_map.get(str(a.resume_id))
        events.append(
            {
                "id": f"a-{a.id}",
                "type": "analyze",
                "title": f"Analysis complete on {resume.title if resume else 'resume'}",
                "subtitle": f"ATS score {a.ats_score} / 100",
                "label": f"{a.ats_score}",
                "at": a.created_at,
                "resumeId": str(a.resume_id),
            }
        )

    activity = sorted(events, key=lambda e: e["at"], reverse=True)[:8]

    return {
        "totals": {
            "resumes": len(resumes),
            "rewrites": rewrite_count,
            "analyses": analysis_count,
            "exports": 0,
        },
        "latestResume": latest_resume,
        "scoreSeries": score_series,
        "versionStack": version_stack,
        "kpi": kpi,
        "activity": activity,
    }
