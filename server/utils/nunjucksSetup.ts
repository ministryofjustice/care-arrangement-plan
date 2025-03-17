import fs from 'fs';
import path from 'path';

import express from 'express';
import { FieldValidationError } from 'express-validator';
import i18n from 'i18n';
import { configure as configureNunjucks } from 'nunjucks';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import formFields from '../constants/formFields';
import paths from '../constants/paths';
import logger from '../logger';

import getAssetPath from './getAssetPath';

const nunjucksSetup = (app: express.Express): void => {
  app.set('view engine', 'njk');

  let assetManifest: Record<string, string> = {};

  try {
    const assetMetadataPath = getAssetPath('manifest.json');
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'));
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file');
    }
  }

  const njkEnv = configureNunjucks([path.join(__dirname, '../views'), 'node_modules/govuk-frontend/dist/'], {
    autoescape: true,
    express: app,
  });

  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url);
  // TODO - add correct URL
  njkEnv.addGlobal('feedbackUrl', config.feedbackUrl);
  // TODO - add correct email
  njkEnv.addGlobal('contactEmail', config.contactEmail);
  njkEnv.addGlobal(
    'previewEnd',
    config.previewEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  );
  njkEnv.addGlobal('paths', paths);
  njkEnv.addGlobal('formFields', formFields);
  njkEnv.addGlobal('cookieNames', cookieNames);
  njkEnv.addGlobal('__', i18n.__);
  njkEnv.addGlobal('getLocale', () => i18n.getLocale);
  // find specific error and return errorMessage for field validation
  njkEnv.addFilter('findError', (errors: FieldValidationError[], formFieldId: string) => {
    if (!errors) return null;
    const errorForMessage = errors.find((error) => error.path === formFieldId);

    if (errorForMessage === undefined) return null;

    return {
      text: errorForMessage?.msg,
    };
  });
  // convert errors to format for GOV.UK error summary component
  njkEnv.addFilter('errorSummaryList', (errors = []) => {
    return Object.keys(errors).map((error) => {
      return {
        text: errors[error].msg,
        href: errors[error].path ? `#${errors[error].path}-error` : undefined,
      };
    });
  });
};

export default nunjucksSetup;
