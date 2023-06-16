import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/init_app.js', 'src/redirect_app.js'],
  outdir: 'build',
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
