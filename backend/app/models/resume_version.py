from datetime import datetime, timezone
from typing import Literal, Optional

import pymongo
from beanie import Document, PydanticObjectId
from pydantic import Field

from app.models.sections import ParsedSections


class ResumeVersion(Document):
    resume_id: PydanticObjectId = Field(alias="resumeId")
    version_number: int = Field(alias="versionNumber")
    label: str
    raw_text: str = Field(alias="rawText")
    parsed_sections: ParsedSections = Field(default_factory=ParsedSections, alias="parsedSections")
    source_type: Literal["upload", "rewrite"] = Field(alias="sourceType")
    parent_version_id: Optional[PydanticObjectId] = Field(default=None, alias="parentVersionId")
    latest_analysis_id: Optional[PydanticObjectId] = Field(default=None, alias="latestAnalysisId")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="createdAt")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="updatedAt")

    class Settings:
        name = "resumeversions"
        indexes = [
            pymongo.IndexModel([("resumeId", pymongo.ASCENDING)]),
            pymongo.IndexModel(
                [("resumeId", pymongo.ASCENDING), ("versionNumber", pymongo.ASCENDING)],
                unique=True,
            ),
        ]

    class Config:
        populate_by_name = True

    def to_public(self, include_raw_text: bool = True) -> dict:
        data = {
            "_id": str(self.id),
            "resumeId": str(self.resume_id),
            "versionNumber": self.version_number,
            "label": self.label,
            "parsedSections": self.parsed_sections.model_dump(),
            "sourceType": self.source_type,
            "parentVersionId": str(self.parent_version_id) if self.parent_version_id else None,
            "latestAnalysisId": str(self.latest_analysis_id) if self.latest_analysis_id else None,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
        if include_raw_text:
            data["rawText"] = self.raw_text
        return data
