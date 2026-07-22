from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

class ResourceNotFoundException(Exception):
    def __init__(self, resource_name: str, message: str = None):
        self.resource_name = resource_name
        self.message = message or f"{resource_name} not found"

class DataProcessingException(Exception):
    def __init__(self, message: str):
        self.message = message

def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(ResourceNotFoundException)
    async def resource_not_found_handler(request: Request, exc: ResourceNotFoundException):
        return JSONResponse(
            status_code=404,
            content={"error": "Not Found", "message": exc.message, "resource": exc.resource_name},
        )

    @app.exception_handler(DataProcessingException)
    async def data_processing_handler(request: Request, exc: DataProcessingException):
        return JSONResponse(
            status_code=500,
            content={"error": "Internal Server Error", "message": exc.message},
        )
