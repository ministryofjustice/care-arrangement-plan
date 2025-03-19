import path from 'node:path';

import { glob } from 'glob';

import buildApp from './app.config.mjs';
import buildAssets from './assets.config.mjs';

const cwd = process.cwd();

/**
 * Configuration for build steps
 * @type {BuildConfig}
 */
const buildConfig = {
  isProduction: process.env.NODE_ENV === 'production',

  app: {
    outDir: path.join(cwd, 'dist'),
    entryPoints: glob
      .sync([path.join(cwd, '*.ts'), path.join(cwd, 'server/**/*.ts')])
      .filter((file) => !file.endsWith('.test.ts'))
      .filter((file) => !file.endsWith('.config.ts')),
    copy: [
      {
        from: path.join(cwd, 'server/views/**/*'),
        to: path.join(cwd, 'dist/views'),
      },
      {
        from: path.join(cwd, 'server/locales/**/*'),
        to: path.join(cwd, 'dist/locales'),
      },
    ],
    clear: path.join(cwd, 'dist/**/*'),
  },

  assets: {
    outDir: path.join(cwd, 'dist/assets'),
    entryPoints: glob.sync([path.join(cwd, 'assets/js/index.js'), path.join(cwd, 'assets/scss/application.scss')]),
    copy: [
      {
        from: path.join(cwd, 'assets/**/!(*.js|*.scss)'),
        to: path.join(cwd, 'dist/assets'),
      },
    ],
  },
};

const main = () => {
  Promise.all([buildApp(buildConfig), buildAssets(buildConfig)]).catch((e) => {
    process.stderr.write(`${e}\n`);
    process.exit(1);
  });
};

main();
