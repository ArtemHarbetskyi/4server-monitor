let chart;
let historicalData = [];

// Ініціалізація графіка
function initChart() {
    const ctx = document.getElementById('metricsChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'CPU (%)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                },
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Завантаження історичних даних
async function loadHistoricalData(metric, timeRange) {
    try {
        const response = await fetch(`/api/history?metric=${metric}&range=${timeRange}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
        // Генеруємо тестові дані для демонстрації
        return generateMockData(metric, timeRange);
    }
}

// Генерація тестових даних
function generateMockData(metric, timeRange) {
    const now = new Date();
    const data = [];
    let points;
    let interval;
    
    switch(timeRange) {
        case '1h':
            points = 60;
            interval = 60000; // 1 хвилина
            break;
        case '6h':
            points = 72;
            interval = 300000; // 5 хвилин
            break;
        case '24h':
            points = 144;
            interval = 600000; // 10 хвилин
            break;
        case '7d':
            points = 168;
            interval = 3600000; // 1 година
            break;
        default:
            points = 144;
            interval = 600000;
    }
    
    for (let i = points; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * interval));
        let value;
        
        switch(metric) {
            case 'cpu':
                value = Math.random() * 80 + 10;
                break;
            case 'memory':
                value = Math.random() * 60 + 20;
                break;
            case 'temperature':
                value = Math.random() * 30 + 40;
                break;
            case 'disk':
                value = Math.random() * 40 + 30;
                break;
            default:
                value = Math.random() * 100;
        }
        
        data.push({
            timestamp: timestamp.toISOString(),
            value: parseFloat(value.toFixed(1))
        });
    }
    
    return data;
}

// Оновлення графіка
function updateChart(metric, data) {
    // Перевіряємо чи data є масивом
    if (!Array.isArray(data)) {
        console.error('Дані не є масивом:', data);
        return;
    }
    
    const labels = data.map(item => new Date(item.timestamp));
    const values = data.map(item => item.value);
    
    let label, color, maxValue;
    
    switch(metric) {
        case 'cpu':
            label = 'CPU (%)';
            color = 'rgb(75, 192, 192)';
            maxValue = 100;
            break;
        case 'memory':
            label = 'RAM (%)';
            color = 'rgb(255, 99, 132)';
            maxValue = 100;
            break;
        case 'temperature':
            label = 'Температура (°C)';
            color = 'rgb(255, 205, 86)';
            maxValue = 100;
            break;
        case 'disk':
            label = 'Диск (%)';
            color = 'rgb(54, 162, 235)';
            maxValue = 100;
            break;
    }
    
    chart.data.labels = labels;
    chart.data.datasets[0].label = label;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].borderColor = color;
    chart.data.datasets[0].backgroundColor = color.replace('rgb', 'rgba').replace(')', ', 0.2)');
    chart.options.scales.y.max = maxValue;
    
    chart.update();
    
    // Оновлення статистики
    updateStatistics(values);
}

// Оновлення статистики
function updateStatistics(values) {
    if (!Array.isArray(values) || values.length === 0) return;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = values[values.length - 1];
    
    document.getElementById('avgValue').textContent = avg.toFixed(1);
    document.getElementById('minValue').textContent = min.toFixed(1);
    document.getElementById('maxValue').textContent = max.toFixed(1);
    document.getElementById('currentValue').textContent = current.toFixed(1);
}

// Обробники подій
document.addEventListener('DOMContentLoaded', function() {
    initChart();
    
    const metricSelect = document.getElementById('metricSelect');
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    
    async function updateData() {
        const metric = metricSelect.value;
        const timeRange = timeRangeSelect.value;
        
        try {
            const data = await loadHistoricalData(metric, timeRange);
            updateChart(metric, data);
        } catch (error) {
            console.error('Помилка оновлення даних:', error);
        }
    }
    
    metricSelect.addEventListener('change', updateData);
    timeRangeSelect.addEventListener('change', updateData);
    
    // Початкове завантаження
    updateData();
    
    // Автооновлення кожні 30 секунд
    setInterval(updateData, 30000);
});