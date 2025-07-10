from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from .stats import get_system_stats, get_historical_data

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/")
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/activity")
def activity(request: Request):
    return templates.TemplateResponse("activity.html", {"request": request})

@router.get("/api/stats")
def stats():
    return JSONResponse(get_system_stats())

@router.get("/api/history")
def history(metric: str = Query(...), range: str = Query("24h")):
    return JSONResponse(get_historical_data(metric, range))