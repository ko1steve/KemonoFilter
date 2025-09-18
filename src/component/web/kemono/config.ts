import { TSMap } from 'typescript-map';
import { ComponentConfig } from '../../../core/component/component-config';
import { KemonoArtistConfig } from './config/artist';
import { KemonoWorkConfig } from './config/work';
import { WebObserverConfig } from '../../../core/web-observer/web-observer-config';

export enum ControllerType {
  ARTIST = 'ARTIST',
  WORK = 'WORK'
}

export class GgdealsWebObserverConfig extends WebObserverConfig {
  public urlTypeMap = new TSMap<RegExp, ControllerType>([
    [
      /^https:\/\/kemono\..+\/.+\/user\/.+\/recommended$/, ControllerType.ARTIST
    ],
    [
      /^https:\/\/kemono\..+\/artists.*$/, ControllerType.ARTIST
    ],
    [
      /^https:\/\/kemono\..+\/posts.*$/, ControllerType.WORK
    ],
    [
      /^https:\/\/kemono\..+\/.+\/user\/[A-Za-z0-9]+[^/]+$/, ControllerType.WORK
    ]
  ]);

  public configClassMap = new TSMap<string, new()=> ComponentConfig>([
    [
      ControllerType.ARTIST, KemonoArtistConfig
    ],
    [
      ControllerType.WORK, KemonoWorkConfig
    ]
  ]);
}
