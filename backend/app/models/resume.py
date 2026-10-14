from datetime import datetime, timezone
from typing import Optional

import pymongo
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field


class Resume(Document):
    user_id: PydanticObjectId = Field(alias="userId")
    title: str = Field(max_length=120)
    current_version_id: Optional[PydanticObjectId] = Field(default=None, alias="currentVersionId")
    latest_version_number: int = Field(default=0, alias="latestVersionNumber")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="createdAt")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="updatedAt")

    class Settings:
        name = "resumes"
        indexes = [
            pymongo.IndexModel([("userId", pymongo.ASCENDING), ("updatedAt", pymongo.DESCENDING)]),
        ]

    class Config:
        populate_by_name = True

    def to_public(self) -> dict:
        return {
            "_id": str(self.id),
            "userId": str(self.user_id),
            "title": self.title,
            "currentVersionId": str(self.current_version_id) if self.current_version_id else None,
            "latestVersionNumber": self.latest_version_number,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
