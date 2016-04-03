module.exports = {
  entry: {
    main: "./scripts/src/main.js",
    test: "./scripts/test/test_draw_flights.js"
  },
  output: {
    path: __dirname+"/out",
    filename: "[name].bundle.js"
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