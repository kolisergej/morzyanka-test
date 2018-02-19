const webpack            = require('webpack');
const path               = require('path');

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      BROWSER:  JSON.stringify(true),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }
  })
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.OccurrenceOrderPlugin()),
  plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
  entry: [
    'babel-polyfill',
    __dirname + '/client/app/client.js'
  ],
  resolve: {
    modules: [__dirname + '/client/app', 'node_modules'],
    extensions:         ['*', '.js', '.jsx']
  },
  plugins,
  output: {
    path: __dirname + '/client/public',
    filename: 'js/app.js'
  },
  module: {
    rules: [{
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: [
          'babel-loader',
          {
            loader: 'eslint-loader',
            options: {
              emitWarning: true,
              failOnError: false,
              failOnWarning: false
            }
          }
        ]
      }
    ]
  },
  devtool: process.env.NODE_ENV !== 'production' ? 'source-map' : false
};
