import path from 'path';

import { Router } from 'express';
import i18n from 'i18n';

import config from '../config';

const setUpi18n = (): Router => {
  const router = Router();

  const { includeWelshLanguage } = config;

  i18n.configure({
    defaultLocale: 'en',
    locales: includeWelshLanguage ? ['en', 'cy'] : ['en'],
    queryParameter: 'lang',
    cookie: 'lang',
    directory: path.resolve(__dirname, '../locales'),
    updateFiles: false,
    retryInDefaultLocale: true,
    objectNotation: true,
  });

  router.use(i18n.init);

  return router;
};

export const setUpLocaleFromSession = (): Router => {
  const router = Router();

  router.use((req, res, next) => {
    const lang = req.query.lang as string | undefined;
    if (lang && i18n.getLocales().includes(lang)) {
      req.session.lang = lang;
      req.setLocale(lang);
    } else if (req.session?.lang) {
      req.setLocale(req.session.lang);
    } else if (!lang) {
      req.session.lang = req.getLocale();
    }
    next();
  });

  return router;
};

export default setUpi18n;
