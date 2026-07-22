from fastapi import FastAPI
from api.core.config import settings
from api.core.cors import setup_cors
from api.core.exceptions import setup_exception_handlers
from api.routes.v1 import health, dashboard, charts, domain, predict

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Analytics API for SocietySphere providing data and charts.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup CORS
setup_cors(app)

# Setup Exception Handlers
setup_exception_handlers(app)

# Register Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["health"])
app.include_router(dashboard.router, prefix=settings.API_V1_STR, tags=["dashboard"])
app.include_router(charts.router, prefix=settings.API_V1_STR, tags=["charts"])
app.include_router(domain.router, prefix=settings.API_V1_STR, tags=["domain"])
app.include_router(predict.router, prefix=settings.API_V1_STR + "/predict", tags=["predict"])
