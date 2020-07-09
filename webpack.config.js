const path = require("path");

module.exports = {
  entry: "./src/my-phoenix-config.ts",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    Phoenix: "Phoenix",
    Key: "Key",
    _: "_",
  },
  resolve: {
    modules: [
      path.resolve("./node_modules"),
      path.resolve("./decs/global.d.ts"),
    ],
    extensions: [".ts", ".tsx", ".js"],
  },
  output: {
    filename: "phoenix-i3.js",
    path: path.resolve(__dirname, "build"),
  },
  mode: "development",
};
