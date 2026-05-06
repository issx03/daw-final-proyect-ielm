from typing import Optional, Any

class TrellixException(Exception):
    """Base exception for Trellix API."""
    def __init__(
        self, 
        message: str, 
        status_code: int = 400, 
        error_code: Optional[str] = None,
        details: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details
        super().__init__(message)

class NotFoundException(TrellixException):
    """Resource not found."""
    def __init__(self, message: str = "Resource not found", error_code: str = "NOT_FOUND"):
        super().__init__(message, status_code=404, error_code=error_code)

class ForbiddenException(TrellixException):
    """Permission denied."""
    def __init__(self, message: str = "Permission denied", error_code: str = "FORBIDDEN"):
        super().__init__(message, status_code=403, error_code=error_code)

class BadRequestException(TrellixException):
    """Invalid request."""
    def __init__(self, message: str = "Bad request", error_code: str = "BAD_REQUEST", details: Optional[Any] = None):
        super().__init__(message, status_code=400, error_code=error_code, details=details)

class UnauthorizedException(TrellixException):
    """Authentication required."""
    def __init__(self, message: str = "Not authenticated", error_code: str = "UNAUTHORIZED"):
        super().__init__(message, status_code=401, error_code=error_code)
