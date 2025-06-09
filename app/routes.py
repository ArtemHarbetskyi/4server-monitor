from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from .stats import get_system_stats

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/")
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/api/stats")
def stats():
    return JSONResponse(get_system_stats())