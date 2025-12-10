    // Кастомный middleware для логирования с деталями
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Логируем завершение запроса
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMessage = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;
    
    // Цветное логирование в консоль
    if (res.statusCode >= 400) {
      console.error('\x1b[31m%s\x1b[0m', logMessage); // Красный для ошибок
    } else {
      console.log('\x1b[32m%s\x1b[0m', logMessage); // Зеленый для успеха
    }
  });
  
  next();
};

module.exports = requestLogger;