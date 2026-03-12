import { createLogger, LogLevelString } from 'bunyan';


const logger = createLogger({
  name: 'PFL Care Arrangement Plan',
  level: (process.env.LOG_LEVEL || 'info') as LogLevelString,
});

export default logger;
