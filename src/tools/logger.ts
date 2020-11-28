import winston from 'winston';

export default winston.createLogger({
  level: 'info',
  exitOnError: false,
  handleExceptions: true,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.printf((obj) =>
      winston.format
        .colorize()
        .colorize(
          obj.level,
          `[${obj.timestamp} ${obj.level.toUpperCase()}]: ${obj.message}`
        )
    )
  ),
  transports: [new winston.transports.Console()],
});
