const webpack = require('webpack')
const chalk = require('chalk')
const config = require('./webpack.config')

console.log(`NODE_ENV      ${chalk.green(process.env.NODE_ENV)}`)
console.log(`BUILD_ENV     ${chalk.green(process.env.BUILD_ENV)}`)
console.log(`start building......`)

webpack(config(), (err, stats) => {
  if (err) throw err
  process.stdout.write(
    stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n'
  )

  if (stats.hasErrors()) {
    console.log(chalk.red('  Build failed with errors.\n'))
    process.exit(1)
  }

  console.log(chalk.cyan('  Build complete.\n'))
  console.log(
    chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
        "  Opening index.html over file:// won't work.\n"
    )
  )
})
