import * as WebpackMerge from 'webpack-merge';
import * as Common from './webpack.common';

module.exports = WebpackMerge.merge(Common, {
  devtool: 'inline-source-map',
  mode: 'development'
});
