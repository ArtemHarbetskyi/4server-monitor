from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .routes import router
from app.data_storage import start_data_collection

app = FastAPI()
app.include_router(router)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Додайте після створення app
start_data_collection()