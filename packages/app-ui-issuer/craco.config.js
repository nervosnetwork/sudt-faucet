const CracoLessPlugin = require('craco-less');

function getProductionSetting() {
  if (process.env.NODE_ENV !== 'production') return {};
  return {
    presets: [['@babel/preset-env', { useBuiltIns: 'entry' }]],
  };
}

module.exports = {
  babel: {
    ...getProductionSetting(),
    plugins: ['babel-plugin-styled-components'],
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#00CCC0',
              '@border-radius-base': '8px',
              '@btn-border-radius-base': '8px',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  devServer: {
    proxy: {
        '/sudt-issuer/api/v1': 'http://localhost:1570'
    }
}
};
