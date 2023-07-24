import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/init.ts', 'src/launch.ts'],
  outdir: 'lti',
  bundle: true,
  assetNames: '[name]-[hash].digested',
  logLevel: 'info',
  publicPath: 'assets',
  sourcemap: 'external',
  minify: true,
  loader: {
    '.js': 'jsx'
  }
})
