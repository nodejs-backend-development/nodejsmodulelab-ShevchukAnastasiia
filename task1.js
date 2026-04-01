const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Формуємо базовий URL з використанням хоста із заголовків запиту
    const baseURL = `http://${req.headers.host}`;
    
    // Парсимо URL запиту за допомогою сучасного API URL
    const parsedUrl = new URL(req.url, baseURL);
    
    // Дістаємо значення параметра "name" (наприклад, ?name=Ivan)
    const nameValue = parsedUrl.searchParams.get('name');

    // Встановлюємо заголовки відповіді (звичайний текст)
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });

    // Перевіряємо наявність параметра та повертаємо відповідний результат
    if (nameValue) {
        res.end(`Hello ${nameValue}`);
    } else {
        res.end('You should provide name parameter');
    }
});

// Запускаємо сервер
server.listen(PORT, () => {
    console.log(`Сервер успішно запущено на порту ${PORT}`);
    console.log(`Для перевірки відкрити у браузері:`);
    console.log(`1. Без параметра: http://localhost:${PORT}/`);
    console.log(`2. З параметром:  http://localhost:${PORT}/?name=Anastasiia`);
});