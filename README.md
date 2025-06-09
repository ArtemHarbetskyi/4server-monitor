![Example](https://github.com/ArtemHarbetskyi/4server-monitor/blob/main/example.png)

# 4server-monitor
Simple web-based server status monitoring.

> Простий веб-моніторинг стану сервера: CPU, памʼять, температура, накопичувачі та I/O.
Побудований на FastAPI, з Docker підтримкою. Дані оновлюються через REST API.

🚀 Функціонал:

	- 📊 Моніторинг CPU, RAM, дисків та температури
	- 🧊 Підтримка psutil для доступу до системної інформації
	- 🌐 Веб-інтерфейс у браузері
	- 📦 Запуск у Docker
	- 🔌 API: GET /api/stats
