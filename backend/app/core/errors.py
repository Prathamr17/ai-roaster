from typing import Any, Optional


class ApiError(Exception):
    def __init__(self, status_code: int, message: str, details: Optional[Any] = None):
        self.status_code = status_code
        self.message = message
        self.details = details
        super().__init__(message)

    @staticmethod
    def bad_request(message: str, details: Optional[Any] = None) -> "ApiError":
        return ApiError(400, message, details)

    @staticmethod
    def unauthorized(message: str = "Unauthorized") -> "ApiError":
        return ApiError(401, message)

    @staticmethod
    def forbidden(message: str = "Forbidden") -> "ApiError":
        return ApiError(403, message)

    @staticmethod
    def not_found(message: str = "Not Found") -> "ApiError":
        return ApiError(404, message)

    @staticmethod
    def conflict(message: str, details: Optional[Any] = None) -> "ApiError":
        return ApiError(409, message, details)

    @staticmethod
    def too_many(message: str = "Too Many Requests") -> "ApiError":
        return ApiError(429, message)

    @staticmethod
    def unavailable(message: str = "Service Unavailable", details: Optional[Any] = None) -> "ApiError":
        return ApiError(503, message, details)

    @staticmethod
    def internal(message: str = "Internal Server Error", details: Optional[Any] = None) -> "ApiError":
        return ApiError(500, message, details)
