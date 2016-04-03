module.exports = {
  entry: "./scripts/src/main.js",
  output: {
    path: "./out",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        loaders: ["style", "css"]
      }
    ]
  }
};