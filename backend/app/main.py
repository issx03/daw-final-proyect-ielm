"""
Trellix API - Main Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


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
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    from app.api.v1.endpoints import auth, boards, lists, cards
    
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(boards.router, prefix="/api/v1/boards", tags=["boards"])
    app.include_router(lists.router, prefix="/api/v1/lists", tags=["lists"])
    app.include_router(cards.router, prefix="/api/v1/cards", tags=["cards"])

    @app.get("/")
    def read_root():
        return {"message": "Welcome to Trellix API"}

    @app.get("/health")
    def health_check():
        return {"status": "healthy"}

    # Initialize database tables on startup
    from app.db.session import init_db
    init_db()

    return app


app = create_app()