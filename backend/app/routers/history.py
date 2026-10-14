from fastapi import APIRouter, Depends

from app.core.deps import require_auth
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.user import User

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
@router.get("/", include_in_schema=False)
async def get_history(user: User = Depends(require_auth)):
    resumes = await Resume.find(Resume.user_id == user.id).to_list()
    resume_ids = [r.id for r in resumes]
    resume_map = {str(r.id): r for r in resumes}

    versions = await ResumeVersion.find({"resumeId": {"$in": resume_ids}}).to_list()
    analyses = await Analysis.find(Analysis.user_id == user.id).to_list()

    events = []

    for r in resumes:
        events.append(
            {
                "id": f"r-{r.id}",
                "type": "upload",
                "title": f"{r.title} uploaded",
                "subtitle": "Parsed and version V1 created",
                "label": "V1",
                "at": r.created_at,
                "resumeId": str(r.id),
                "resumeTitle": r.title,
            }
        )

    for v in versions:
        if v.source_type != "rewrite":
            continue
        resume = resume_map.get(str(v.resume_id))
        events.append(
            {
                "id": f"v-{v.id}",
                "type": "rewrite",
                "title": f"{v.label} created for {resume.title if resume else 'resume'}",
                "subtitle": "Rewrites applied to previous version",
                "label": f"{v.label} created",
                "at": v.created_at,
                "resumeId": str(v.resume_id),
                "resumeTitle": resume.title if resume else "Resume",
            }
        )

    for a in analyses:
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
                "resumeTitle": resume.title if resume else "Resume",
            }
        )

    events.sort(key=lambda e: e["at"], reverse=True)

    totals = {
        "all": len(events),
        "upload": len([e for e in events if e["type"] == "upload"]),
        "analyze": len([e for e in events if e["type"] == "analyze"]),
        "rewrite": len([e for e in events if e["type"] == "rewrite"]),
    }

    return {"events": events, "totals": totals}
