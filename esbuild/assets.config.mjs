import path from 'node:path';

import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import manifestPlugin from 'esbuild-plugin-manifest';
import { sassPlugin } from 'esbuild-sass-plugin';

/**
 * Copy additional assets into distribution
 * @type {BuildStep}
 */
const buildAdditionalAssets = (buildConfig) => {
  return build({
    outdir: buildConfig.assets.outDir,
    plugins: [
      copy({
        resolveFrom: 'cwd',
        assets: buildConfig.assets.copy,
      }),
    ],
  });
};

/**
 * Build scss and javascript assets
 * @type {BuildStep}
 */
const buildAssets = (buildConfig) => {
  return build({
    entryPoints: buildConfig.assets.entryPoints,
    outdir: buildConfig.assets.outDir,
    entryNames: '[ext]/app.[hash]',
    minify: buildConfig.isProduction,
    sourcemap: !buildConfig.isProduction,
    platform: 'browser',
    target: 'es2018',
    external: ['/assets/*'],
    bundle: true,
    plugins: [
      manifestPlugin({
        generate: (entries) =>
          Object.fromEntries(Object.entries(entries).map((paths) => paths.map((p) => p.replace(/^dist\//, '/')))),
      }),
      sassPlugin({
        quietDeps: true,
        loadPaths: [process.cwd(), path.join(process.cwd(), 'node_modules')],
      }),
    ],
  });
};

/**
 * @param {BuildConfig} buildConfig
 * @returns {Promise}
 */
export default (buildConfig) => {
  process.stderr.write('\u{1b}[1m\u{2728} Building assets...\u{1b}[0m\n');

  return Promise.all([buildAssets(buildConfig), buildAdditionalAssets(buildConfig)]);
};
