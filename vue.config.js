const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@assets', resolve('src/assets'))
      .set('@config', resolve('src/config'))
      .set('@util', resolve('src/util'))
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/assets/css/var.scss";`
      }
    }
  },
  configureWebpack: {},
}
