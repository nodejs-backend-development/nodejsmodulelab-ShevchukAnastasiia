const { Transform } = require('stream');

class UppercaseStream extends Transform {
    _transform(chunk, encoding, callback) {
        // Перетворюємо chunk (Buffer) на рядок
        const text = chunk.toString();
        
        // Метод .toUpperCase() автоматично ігнорує числа та символи
        const upperText = text.toUpperCase();
        
        // Виводимо в лог (видаляємо зайвий переніс рядка з консолі через trim)
        console.log(`\n[UppercaseStream Лог]: ${upperText.trim()}`);
        
        // Передаємо змінені дані далі по потоку
        this.push(upperText);
        
        // Сигналізуємо, що обробку цього шматка завершено
        callback();
    }
}

class StatsStream extends Transform {
    _transform(chunk, encoding, callback) {
        const text = chunk.toString().trim(); // Прибираємо пробіли/enter по краях
        
        if (text) {
            // Рахуємо символи (довжина рядка)
            const charCount = text.length;
            
            // Рахуємо слова (розбиваємо по пробілах)
            const wordCount = text.split(/\s+/).length;
            
            console.log(`\n[StatsStream Лог]:`);
            console.log(`Текст: "${text}"`);
            console.log(`Статистика -> Слів: ${wordCount}, Символів: ${charCount}`);
        }

        this.push(chunk); // Віддаємо оригінальний текст далі
        callback();
    }
}

class HighlightStream extends Transform {
    constructor(options) {
        super(options);
        // Отримуємо словник кольорів з конфігурації
        this.keywordColors = options.keywordColors || {};
        // Колір для чисел (за замовчуванням жовтий \x1b[33m)
        this.numberColor = options.numberColor || '\x1b[33m';
        // Код для скидання кольору назад у стандартний
        this.resetColor = '\x1b[0m';
    }

    _transform(chunk, encoding, callback) {
        let text = chunk.toString();

        // 1. Підсвічуємо ключові слова (використовуємо регулярки для пошуку цілих слів)
        for (const [word, colorCode] of Object.entries(this.keywordColors)) {
            // \b означає границю слова (щоб не підсвітити частину іншого слова)
            const regex = new RegExp(`\\b(${word})\\b`, 'gi');
            text = text.replace(regex, `${colorCode}$1${this.resetColor}`);
        }

        // 2. Підсвічуємо всі числа окремо
        text = text.replace(/\b(\d+)\b/g, `${this.numberColor}$1${this.resetColor}`);

        console.log(`\n[HighlightStream Лог]: ${text.trim()}`);
        
        this.push(text);
        callback();
    }
}


console.log('--- Лабораторна: Custom Streams ---');
console.log('Введіть текст у консоль (натисніть Ctrl+C для виходу).');

// ANSI кольори для третього потоку
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m'
};

// Створюємо екземпляри наших потоків
const uppercaseStream = new UppercaseStream();
const statsStream = new StatsStream();
const highlightStream = new HighlightStream({
    keywordColors: {
        'error': colors.red,
        'success': colors.green,
        'node': colors.blue
    },
    numberColor: colors.yellow // Всі числа будуть жовтими
});

// Направляємо ввід з консолі (process.stdin) по ланцюжку через усі наші потоки.
// process.stdin -> Uppercase -> Stats -> Highlight -> (і просто ігноруємо фінальний вивід, щоб не дублювати консоль)
process.stdin
    .pipe(uppercaseStream)
    .pipe(statsStream)
    .pipe(highlightStream);