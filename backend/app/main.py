from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import farms


app = FastAPI(
    title="AgriShift API",
    description="NASA-powered Climate Smart Agriculture Platform",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(farms.router)


@app.get("/")
def root():
    return {
        "message": "AgriShift API is running",
        "version": "0.1.0",
        "status": "ok",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }