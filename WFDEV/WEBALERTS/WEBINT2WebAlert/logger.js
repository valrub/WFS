// External modules import
const winston = require('winston');
//const winlog = require('winston-winlog2');
const path = require('path');
const fs = require('fs');

try {
    const logsDirectory = path.resolve(__dirname, 'logs');

    if (!fs.existsSync(logsDirectory)) {
        fs.mkdirSync(logsDirectory);
    }

    const timestamp = () => {
        return new Date(Date.now()).toISOString();
    }

    const logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                level: 'debug',
                timestamp,
                formatter: (options) => {
                    return `${options.timestamp()} - [${winston.config.colorize(options.level, options.level.toUpperCase())}] ${(options.message ? options.message : '')}`;
                }
            }),
            new (winston.transports.File)({
                level: 'info',
                json: false,
                timestamp,
                formatter: (options) => {
                    return `${options.timestamp()} - [${options.level.toUpperCase()}] ${(options.message ? options.message : '')}`;
                },
                filename: path.resolve(logsDirectory, 'WEBINT2WebAlert.log'),
                handleExceptions: true,
                humanReadableUnhandledException: true
            })
			
        ],
        exitOnError: false
    });

    module.exports = logger;
} catch (error) {
    throw error;
}