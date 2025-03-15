import { createLogger } from 'bunyan';
import bunyanFormat from 'bunyan-format';

import config from './config';

const formatOut = bunyanFormat({ outputMode: 'short', color: !config.production });

const logger = createLogger({ name: 'PFL Care Arrangement Plan', stream: formatOut, level: 'debug' });

export default logger;
