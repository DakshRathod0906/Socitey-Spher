from fastapi import FastAPI

app = FastAPI(title="SocietySphere ML Service", version="1.0.0")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SocietySphere ML Service"}

@app.get("/version")
def version():
    return {"version": "1.0.0"}
