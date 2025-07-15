async function loadStats() {
    const res = await fetch('/api/stats');
    const data = await res.json();
    
    // Оновлення інформації про процесор
    const cpuCount = data.cpu_count;
    document.getElementById('cpu_count').textContent = cpuCount;


    // Оновлення інформації про платформу
    const platformName = data.platform_name;
    document.getElementById('platform-name').textContent = platformName;

    // Оновленя часу роботи
    const uptime = data.uptime;
    document.getElementById('uptime').textContent = uptime;
    
    // Оновлення CPU
    const cpuValue = data.cpu_percent;
    document.getElementById('cpu').textContent = cpuValue.toFixed(1);
    updateProgressBar('cpu-bar', cpuValue);
    
    
    // Оновлення RAM
    const ramValue = data.memory.percent;
    document.getElementById('ram').textContent = ramValue.toFixed(1);
    updateProgressBar('ram-bar', ramValue);
    
    // Додаткова інформація про RAM
    const ramTotal = formatBytes(data.memory.total);
    const ramUsed = formatBytes(data.memory.used);
    const ramFree = formatBytes(data.memory.free);
    
    document.getElementById('ram-total').textContent = ramTotal;
    document.getElementById('ram-used').textContent = ramUsed;
    document.getElementById('ram-free').textContent = ramFree;
     
    // Оновлення температури
    const tempValue = data.temperature.temp;
    document.getElementById('temp').textContent = tempValue ? tempValue.toFixed(1) : 'N/A';
    if (tempValue) {
        updateProgressBar('temp-bar', (tempValue / 100) * 100); // Припускаємо, що 100°C - це максимум
    } else {
        document.getElementById('temp-bar').style.width = '0%';
    }
     
}

// Форматування байтів у більш читабельний формат
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Байт';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function updateProgressBar(id, value) {
    const bar = document.getElementById(id);
    bar.style.width = `${value}%`;
    bar.setAttribute('aria-valuenow', value);
    
    // Зміна кольору в залежності від значення
    if (value < 50) {
        bar.className = 'progress-bar bg-success';
    } else if (value < 80) {
        bar.className = 'progress-bar bg-warning';
    } else {
        bar.className = 'progress-bar bg-danger';
    }
}

setInterval(loadStats, 3000);
loadStats();