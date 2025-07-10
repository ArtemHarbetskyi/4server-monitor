import platform
import psutil
import os
from app.utils import format_uptime
import time
from datetime import datetime, timedelta
import random

def get_system_stats():
    return {
        "uptime": get_uptime(),
        "platform_name": get_platform_name(),
        "cpu_count": psutil.cpu_count(),
        "cpu_percent": psutil.cpu_percent(),
        "memory": psutil.virtual_memory()._asdict(),
        "temperature": get_temperature(),
    }



def get_uptime():
    uptime_seconds = time.monotonic()
    return format_uptime(uptime_seconds)
    
def get_platform_name():
    uname = platform.uname()
    return f"{uname.system} {uname.release} ({uname.version}) {uname.machine}"

 
def get_temperature():
    try:
        temps = psutil.sensors_temperatures()
        if not temps:
            return None

        for name, entries in temps.items():
            for entry in entries:
                if hasattr(entry, "current"):
                    return {
                        "sensor": name,
                        "label": entry.label,
                        "temp": entry.current
                    }
        return None
    except Exception:
        return None


def get_historical_data(metric: str, time_range: str):
    """
    Повертає історичні дані для вказаного показника.
    Тепер використовує реальні збережені дані.
    """
    from app.data_storage import storage
    return storage.get_historical_data(metric, time_range)