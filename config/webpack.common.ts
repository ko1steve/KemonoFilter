import * as Path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import { ProvidePlugin } from 'webpack';
import { AssetList } from './../src/asset-list';

const appDir = Path.dirname(__dirname);

module.exports = {
  mode: 'none',
  entry: {
    'src/component/popup/popup': './src/component/popup/popup.ts',
    'src/component/background/background': './src/component/background/background.ts',
    'src/component/web/kemono/content': './src/component/web/kemono/content.ts'
  },
  output: {
    path: Path.join(appDir, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'image/[name].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              disable: process.env.NODE_ENV !== 'production'
            }
          }
        ]
      },
      {
        test: /\.json$/,
        loader: 'json5-loader',
        options: {
          esModule: false
        },
        type: 'javascript/auto'
      },
      {
        test: /\.html$/,
        use: ['html-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css', '.scss', 'json'],
    modules: [
      Path.resolve(appDir, 'src'),
      Path.resolve(appDir, 'node_modules')
    ],
    alias: {
      src: Path.resolve(appDir, 'src/')
    },
    fallback: {
      chrome: false
    }
  },
  target: 'web',
  plugins: [
    new ProvidePlugin({
      process: 'process/browser'
    }),
    new ESLintPlugin({
      extensions: ['ts', 'tsx']
    }),
    new MiniCssExtractPlugin({
      filename: ({ chunk }): string => {
        console.log('[webpack-debug] css.chunk.name=' + chunk!.name);
        const regexp = /content$/;
        const replace = 'style.css';
        if (chunk!.name!.match(regexp)) {
          return chunk!.name!.replace(regexp, replace);
        }
        return '[name].css';
      }
    }),
    new CopyWebpackPlugin({
      patterns: AssetList
    }),
    new HTMLWebpackPlugin({
      template: './src/component/popup/popup.html',
      filename: './src/component/popup/popup.html',
      chunks: ['src/component/popup/popup'],
      inject: 'head'
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserWebpackPlugin({
      terserOptions: {
        keep_fnames: true,
        format: {
          comments: false
        },
        compress: {
          keep_fargs: true,
          keep_classnames: true,
          keep_fnames: true
        },
        mangle: {
          reserved: ['chrome', 'document', 'window']
        }
      },
      extractComments: false
    })]
  }
};
