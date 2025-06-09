import datetime

def format_uptime(seconds):
    uptime = datetime.timedelta(seconds=int(seconds))
    return str(uptime) 