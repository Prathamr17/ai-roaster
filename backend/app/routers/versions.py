from fastapi import APIRouter, Depends

from app.core.deps import require_auth
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.user import User

router = APIRouter(prefix="/api/versions", tags=["versions"])


@router.get("")
@router.get("/", include_in_schema=False)
async def list_versions(user: User = Depends(require_auth)):
    resumes = await Resume.find(Resume.user_id == user.id).to_list()
    resume_ids = [r.id for r in resumes]
    resume_map = {str(r.id): r for r in resumes}

    versions = (
        await ResumeVersion.find({"resumeId": {"$in": resume_ids}})
        .sort("-created_at")
        .to_list()
    )

    analysis_ids = [v.latest_analysis_id for v in versions if v.latest_analysis_id]
    analyses = (
        await Analysis.find({"_id": {"$in": analysis_ids}}).to_list() if analysis_ids else []
    )
    score_by_version = {str(a.version_id): a.ats_score for a in analyses}

    items = []
    for v in versions:
        resume = resume_map.get(str(v.resume_id))
        items.append(
            {
                "id": str(v.id),
                "label": v.label,
                "versionNumber": v.version_number,
                "sourceType": v.source_type,
                "createdAt": v.created_at,
                "score": score_by_version.get(str(v.id)),
                "resumeId": str(v.resume_id),
                "resumeTitle": resume.title if resume else "Resume",
                "parentVersionId": str(v.parent_version_id) if v.parent_version_id else None,
            }
        )

    totals = {
        "all": len(items),
        "uploads": len([i for i in items if i["sourceType"] == "upload"]),
        "rewrites": len([i for i in items if i["sourceType"] == "rewrite"]),
    }

    return {"versions": items, "totals": totals}
