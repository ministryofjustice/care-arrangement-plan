import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';
import { build } from 'esbuild';
import { clean } from 'esbuild-plugin-clean';
import { copy } from 'esbuild-plugin-copy';
import { sync } from 'glob';

/**
 * Build typescript application into CommonJS
 * @type {BuildStep}
 */
const buildApp = (buildConfig) => {
  return build({
    entryPoints: sync(buildConfig.app.entryPoints),
    outdir: buildConfig.app.outDir,
    bundle: false,
    sourcemap: true,
    platform: 'node',
    format: 'cjs',
    plugins: [
      clean({
        patterns: buildConfig.app.clear,
      }),
      typecheckPlugin(),
      copy({
        resolveFrom: 'cwd',
        assets: buildConfig.app.copy,
      }),
    ],
  });
};

/**
 * @param {BuildConfig} buildConfig
 * @returns {Promise}
 */
export default (buildConfig) => {
  process.stderr.write('\u{1b}[1m\u{2728} Building app...\u{1b}[0m\n');

  return buildApp(buildConfig);
};
