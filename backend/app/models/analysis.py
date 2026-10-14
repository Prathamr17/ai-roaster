from datetime import datetime, timezone
from typing import List, Optional

import pymongo
from beanie import Document, PydanticObjectId
from pydantic import Field

from app.models.sections import BulletRewrite, Issue, ScoreBreakdown, Strength


class Analysis(Document):
    user_id: PydanticObjectId = Field(alias="userId")
    resume_id: PydanticObjectId = Field(alias="resumeId")
    version_id: PydanticObjectId = Field(alias="versionId")
    ats_score: float = Field(alias="atsScore")
    score_breakdown: ScoreBreakdown = Field(default_factory=ScoreBreakdown, alias="scoreBreakdown")
    issues: List[Issue] = Field(default_factory=list)
    strengths: List[Strength] = Field(default_factory=list)
    bullet_rewrites: List[BulletRewrite] = Field(default_factory=list, alias="bulletRewrites")
    keywords_present: List[str] = Field(default_factory=list, alias="keywordsPresent")
    keywords_missing: List[str] = Field(default_factory=list, alias="keywordsMissing")
    summary: str = ""
    model: str
    prompt_tokens: Optional[int] = Field(default=None, alias="promptTokens")
    response_tokens: Optional[int] = Field(default=None, alias="responseTokens")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="createdAt")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="updatedAt")

    class Settings:
        name = "analyses"
        indexes = [
            pymongo.IndexModel([("userId", pymongo.ASCENDING)]),
            pymongo.IndexModel([("resumeId", pymongo.ASCENDING)]),
            pymongo.IndexModel([("versionId", pymongo.ASCENDING)]),
        ]

    class Config:
        populate_by_name = True

    def to_public(self) -> dict:
        return {
            "_id": str(self.id),
            "userId": str(self.user_id),
            "resumeId": str(self.resume_id),
            "versionId": str(self.version_id),
            "atsScore": self.ats_score,
            "scoreBreakdown": self.score_breakdown.model_dump(),
            "issues": [i.model_dump() for i in self.issues],
            "strengths": [s.model_dump() for s in self.strengths],
            "bulletRewrites": [b.model_dump() for b in self.bullet_rewrites],
            "keywordsPresent": self.keywords_present,
            "keywordsMissing": self.keywords_missing,
            "summary": self.summary,
            "model": self.model,
            "promptTokens": self.prompt_tokens,
            "responseTokens": self.response_tokens,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
