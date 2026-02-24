import path from "path";

import type { Configuration } from "@rspack/cli";
import { RunScriptWebpackPlugin } from "run-script-webpack-plugin";
import nodeExternals from "webpack-node-externals";

const monorepoRoot = path.resolve(import.meta.dirname, "../..");

const config: Configuration = {
  context: import.meta.dirname,
  target: "node",
  entry: {
    main: ["@rspack/core/hot/poll?100", "./src/main.ts"]
  },
  devtool: "source-map",
  externals: [
    nodeExternals({
      allowlist: ["@rspack/core/hot/poll?100"],
      additionalModuleDirs: [path.join(monorepoRoot, "node_modules")]
    })
  ],
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                decorators: true,
                dynamicImport: true
              },
              transform: {
                legacyDecorator: true,
                decoratorMetadata: true
              }
            }
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  output: {
    path: import.meta.dirname + "/dist",
    filename: "main.js"
  },
  plugins: [
    !process.env.BUILD &&
      new RunScriptWebpackPlugin({
        name: "main.js",
        autoRestart: true,
        args: ["start:dev"]
      })
  ].filter(Boolean),
  devServer: {
    devMiddleware: {
      writeToDisk: true
    },
    hot: true,
    client: {
      webSocketTransport: "ws",
      webSocketURL: "ws://localhost:3000/ws"
    },
    webSocketServer: "ws",
    allowedHosts: "all",
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  optimization: {
    minimize: false
  },
  externalsPresets: { node: true },
  externalsType: "commonjs",
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  node: {
    __dirname: true,
    __filename: true
  },
  stats: {
    errorDetails: true
  },
  cache: true,
  ignoreWarnings: [
    {
      module: /node_modules\/express\/lib\/view\.js/,
      message: /the request of a dependency is an expression/
    }
  ]
};

export default config;
