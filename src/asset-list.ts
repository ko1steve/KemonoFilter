import { Pattern } from 'copy-webpack-plugin';

export const AssetList: Pattern[] = [
  { from: './manifest.json', to: './manifest.json' },
  { from: './image/checkbox_across_disabled.png', to: './image/checkbox_across_disabled.png' },
  { from: './image/checkbox_across_enabled.png', to: './image/checkbox_across_enabled.png' },
  { from: './image/checkbox_tick_disabled.png', to: './image/checkbox_tick_disabled.png' },
  { from: './image/checkbox_tick_enabled.png', to: './image/checkbox_tick_enabled.png' },
  { from: './image/icon.png', to: './image/icon.png' }
];
