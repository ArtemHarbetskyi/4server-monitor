import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
import threading
import time
from app.stats import get_system_stats
import pytz  # Додайте pytz до requirements.txt

class DataStorage:
    def __init__(self, data_file: str = "historical_data.json"):
        self.data_file = data_file
        
        # Створюємо папку тільки якщо файл містить шлях до директорії
        dir_path = os.path.dirname(data_file)
        if dir_path:
            os.makedirs(dir_path, exist_ok=True)
        
        self.data = self._load_data()
        self.lock = threading.Lock()
        
        # Налаштовуємо часовий пояс
        self.timezone = pytz.timezone('Europe/Kiev')  # Змініть на ваш часовий пояс
        
    def _load_data(self) -> Dict[str, List[Dict]]:
        """Завантажує дані з JSON файлу"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                pass
        
        # Повертаємо порожню структуру
        return {
            "cpu": [],
            "memory": [],
            "temperature": [],
            "disk": []
        }
    
    def _save_data(self):
        """Зберігає дані у JSON файл"""
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
    
    def add_data_point(self, stats: Dict[str, Any]):
        """Додає нову точку даних"""
        with self.lock:
            # Використовуємо локальний час
            now = datetime.now(self.timezone)
            timestamp = now.isoformat()
            
            # Додаємо CPU дані
            if 'cpu_percent' in stats:
                self.data["cpu"].append({
                    "timestamp": timestamp,
                    "value": round(stats['cpu_percent'], 1)
                })
            
            # Додаємо дані пам'яті
            if 'memory' in stats and 'percent' in stats['memory']:
                self.data["memory"].append({
                    "timestamp": timestamp,
                    "value": round(stats['memory']['percent'], 1)
                })
            
            # Додаємо дані температури
            if 'temperature' in stats and stats['temperature'] and 'temp' in stats['temperature']:
                self.data["temperature"].append({
                    "timestamp": timestamp,
                    "value": round(stats['temperature']['temp'], 1)
                })
            
            # Додаємо дані диску (використовуємо psutil для отримання)
            try:
                import psutil
                disk_usage = psutil.disk_usage('/')
                disk_percent = (disk_usage.used / disk_usage.total) * 100
                self.data["disk"].append({
                    "timestamp": timestamp,
                    "value": round(disk_percent, 1)
                })
            except:
                pass
            
            # Очищаємо старі дані (зберігаємо тільки за останні 7 днів)
            self._cleanup_old_data()
            
            # Зберігаємо у файл
            self._save_data()
    
    def _cleanup_old_data(self):
        """Видаляє дані старші за 7 днів"""
        cutoff_time = datetime.now() - timedelta(days=7)
        cutoff_iso = cutoff_time.isoformat()
        
        for metric in self.data:
            self.data[metric] = [
                point for point in self.data[metric]
                if point["timestamp"] >= cutoff_iso
            ]
    
    def get_historical_data(self, metric: str, time_range: str) -> List[Dict]:
        """Повертає історичні дані для вказаного показника та періоду"""
        with self.lock:
            if metric not in self.data:
                return []
            
            now = datetime.now()
            
            # Визначаємо період
            if time_range == "1h":
                start_time = now - timedelta(hours=1)
            elif time_range == "6h":
                start_time = now - timedelta(hours=6)
            elif time_range == "24h":
                start_time = now - timedelta(hours=24)
            elif time_range == "7d":
                start_time = now - timedelta(days=7)
            else:
                start_time = now - timedelta(hours=24)
            
            start_iso = start_time.isoformat()
            
            # Фільтруємо дані за періодом
            filtered_data = [
                point for point in self.data[metric]
                if point["timestamp"] >= start_iso
            ]
            
            return filtered_data

# Глобальний екземпляр для збереження даних
storage = DataStorage()

def start_data_collection():
    """Запускає збір даних у фоновому режимі"""
    def collect_data():
        while True:
            try:
                stats = get_system_stats()
                storage.add_data_point(stats)
                time.sleep(60)  # Збираємо дані кожну хвилину
            except Exception as e:
                print(f"Помилка при зборі даних: {e}")
                time.sleep(60)
    
    # Запускаємо у фоновому потоці
    thread = threading.Thread(target=collect_data, daemon=True)
    thread.start()
    print("Збір даних запущено")