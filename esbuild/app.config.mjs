import { copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';
import { build } from 'esbuild';
import { globSync, sync } from 'glob';

/**
 * Copy glob matches into `to`, keeping the path under the last `/**` segment.
 * @param {Array<{ from: string | string[], to: string | string[] }>} assets
 */
export function copyFiles(assets) {
  for (const asset of assets) {
    const froms = Array.isArray(asset.from) ? asset.from : [asset.from];
    const tos = Array.isArray(asset.to) ? asset.to : [asset.to];

    for (const rawFrom of froms) {
      const files = globSync(rawFrom, { nodir: true });
      const { dir } = path.parse(rawFrom);
      const startFragment = dir.endsWith('/**') ? dir.slice(0, -3) : dir;

      for (const file of files) {
        const preserved = file.split(startFragment)[1] ?? '';
        for (const baseToPath of tos) {
          const dest =
            path.extname(baseToPath) === ''
              ? path.resolve(process.cwd(), baseToPath, preserved.replace(/^[/\\]/, ''))
              : path.resolve(process.cwd(), baseToPath);
          mkdirSync(path.dirname(dest), { recursive: true });
          copyFileSync(file, dest);
        }
      }
    }
  }
}

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
      typecheckPlugin(),
      {
        name: 'copy-files',
        setup(esbuildBuild) {
          esbuildBuild.onEnd(() => {
            copyFiles(buildConfig.app.copy);
          });
        },
      },
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
