from collections import OrderedDict
from typing import Any, Callable, List

from fastapi import APIRouter, Depends

from app.core.deps import require_auth
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.models.user import User

router = APIRouter(prefix="/api/insights", tags=["insights"])


def _top_n(items: List[Any], get_key: Callable[[Any], Any], n: int = 8) -> List[dict]:
    counts: "OrderedDict[Any, int]" = OrderedDict()
    extra: dict = {}
    for item in items:
        key = get_key(item)
        if not key:
            continue
        counts[key] = counts.get(key, 0) + 1
        if key not in extra:
            extra[key] = item
    ranked = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:n]
    return [{"key": k, "count": c, "sample": extra.get(k)} for k, c in ranked]


@router.get("")
@router.get("/", include_in_schema=False)
async def get_insights(user: User = Depends(require_auth)):
    resumes = await Resume.find(Resume.user_id == user.id).sort("-updated_at").to_list()
    resume_map = {str(r.id): r for r in resumes}

    analyses = await Analysis.find(Analysis.user_id == user.id).sort("+created_at").to_list()

    if not analyses:
        return {
            "empty": True,
            "totalAnalyses": 0,
            "resumes": [
                {"_id": str(r.id), "title": r.title, "latestVersionNumber": r.latest_version_number}
                for r in resumes
            ],
        }

    total_score = sum(a.ats_score for a in analyses)
    average_score = round(total_score / len(analyses))

    best_entry = max(analyses, key=lambda a: a.ats_score)
    best_resume = resume_map.get(str(best_entry.resume_id))

    score_trend = [
        {
            "at": a.created_at,
            "score": a.ats_score,
            "resumeId": str(a.resume_id),
            "resumeTitle": resume_map[str(a.resume_id)].title if str(a.resume_id) in resume_map else "Resume",
        }
        for a in analyses
    ]

    all_issues = [i for a in analyses for i in a.issues]
    top_issues_raw = _top_n(all_issues, lambda i: (i.title or "").strip().lower(), 6)
    top_issues = [
        {
            "title": (row["sample"].title if row["sample"] else row["key"]),
            "count": row["count"],
            "severity": (row["sample"].severity if row["sample"] else "medium"),
        }
        for row in top_issues_raw
    ]

    all_missing = [k for a in analyses for k in a.keywords_missing]
    all_present = [k for a in analyses for k in a.keywords_present]
    top_missing = [
        {"keyword": row["sample"], "count": row["count"]}
        for row in _top_n(all_missing, lambda k: k.lower(), 12)
    ]
    top_present = [
        {"keyword": row["sample"], "count": row["count"]}
        for row in _top_n(all_present, lambda k: k.lower(), 12)
    ]

    resume_performance = []
    for r in resumes:
        ras = [a for a in analyses if a.resume_id == r.id]
        if not ras:
            continue
        latest = ras[-1]
        best = max(ras, key=lambda a: a.ats_score)
        first = ras[0]
        resume_performance.append(
            {
                "resumeId": str(r.id),
                "title": r.title,
                "analysesCount": len(ras),
                "latestScore": latest.ats_score,
                "bestScore": best.ats_score,
                "improvement": latest.ats_score - first.ats_score,
            }
        )
    resume_performance.sort(key=lambda x: x["latestScore"], reverse=True)

    return {
        "empty": False,
        "totalAnalyses": len(analyses),
        "averageScore": average_score,
        "bestScore": {
            "value": best_entry.ats_score,
            "resumeId": str(best_entry.resume_id),
            "resumeTitle": best_resume.title if best_resume else "Resume",
            "at": best_entry.created_at,
        },
        "scoreTrend": score_trend,
        "topIssues": top_issues,
        "topMissingKeywords": top_missing,
        "topPresentKeywords": top_present,
        "resumePerformance": resume_performance,
    }
