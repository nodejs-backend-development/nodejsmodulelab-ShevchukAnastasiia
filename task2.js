//Завдання 5.

const http = require('http');
const fs = require('fs');
const split2 = require('split2');
const through2 = require('through2');

const PORT = 3000;
const CSV_FILE_PATH = './data.csv';

const server = http.createServer((req, res) => {
    // Обробляємо лише GET запити
    if (req.method === 'GET') {
        // Встановлюємо заголовок, що відповідь буде у форматі JSON
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });

        let headers = [];
        let isFirstDataRow = true;

        // 1. Створюємо потік читання з файлу
        const readStream = fs.createReadStream(CSV_FILE_PATH);

        // 2. Створюємо трансформаційний потік за допомогою through2
        const csvToJson = through2(
            // Функція обробки кожного рядка (chunk)
            function (chunk, enc, callback) {
                const line = chunk.toString().trim();
                
                if (!line) return callback(); // Пропускаємо пусті рядки

                const columns = line.split(',');

                // Якщо це самий перший рядок файлу — це наші ключі (заголовки)
                if (headers.length === 0) {
                    headers = columns;
                    this.push('['); // Починаємо формувати масив JSON у відповіді
                    callback();
                } else {
                    // Формуємо JavaScript об'єкт з поточного рядка
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header.trim()] = columns[index] ? columns[index].trim() : '';
                    });

                    // Якщо це не перший об'єкт, ставимо кому перед ним
                    const prefix = isFirstDataRow ? '' : ',';
                    isFirstDataRow = false;

                    // Відправляємо перетворений об'єкт далі по потоку у вигляді рядка
                    this.push(prefix + JSON.stringify(obj));
                    callback();
                }
            },
            // Функція завершення (викликається, коли файл повністю прочитано)
            function (callback) {
                if (headers.length === 0) {
                    this.push('['); // Захист на випадок пустого файлу
                }
                this.push(']'); // Закриваємо масив JSON
                callback();
            }
        );

        // 3. Збираємо всі потоки в один ланцюжок (Pipeline)
        readStream
            .pipe(split2())     // Читає потік і розбиває його рівно по рядках
            .pipe(csvToJson)    // Бере кожен рядок і робить з нього JSON
            .pipe(res)          // Відправляє готовий шматок JSON прямо в браузер
            .on('error', (err) => {
                console.error('Помилка потоку:', err);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                }
            });

    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed. Please use GET.');
    }
});

server.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
    console.log('Відкрий браузер та перейди за посиланням, щоб побачити JSON');
});