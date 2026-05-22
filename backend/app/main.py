import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.exceptions import TrellixException
from app.schemas.error import ErrorResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(
        title="Trellix API",
        description="API for Trellix task management system",
        version="0.1.0"
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(TrellixException)
    async def trellix_exception_handler(request: Request, exc: TrellixException):
        """Handle custom Trellix exceptions."""
        logger.warning(f"Custom error: {exc.message} (Code: {exc.error_code})")
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(
                message=exc.message,
                error_code=exc.error_code,
                details=exc.details
            ).model_dump()
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        """Handle standard FastAPI/Starlette HTTP exceptions."""
        logger.warning(f"HTTP error: {exc.detail} (Status: {exc.status_code})")
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(
                message=str(exc.detail),
                error_code="HTTP_ERROR"
            ).model_dump()
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle Pydantic validation errors."""
        logger.warning(f"Validation error: {exc.errors()}")
        return JSONResponse(
            status_code=422,
            content=ErrorResponse(
                message="Validation error",
                error_code="VALIDATION_ERROR",
                details=exc.errors()
            ).model_dump()
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        """Handle all unhandled exceptions."""
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                message="Internal server error",
                error_code="INTERNAL_SERVER_ERROR"
            ).model_dump()
        )

    # Include routers
    from app.api.v1.endpoints import auth, users, boards, lists, cards
    
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
    app.include_router(boards.router, prefix="/api/v1/boards", tags=["boards"])
    app.include_router(lists.router, prefix="/api/v1/lists", tags=["lists"])
    app.include_router(cards.router, prefix="/api/v1/cards", tags=["cards"])

    @app.get("/")
    def read_root():
        return {"message": "Welcome to Trellix API"}

    @app.get("/health")
    def health_check():
        return {"status": "healthy"}

    return app



app = create_app()