import { Singleton } from 'typescript-ioc';

export interface IMainConfig {
  name: string;
  storageNames: IStorageNames;
  storageDefault: IStorageDefault;
  refreshInterval: number;
}

export interface IStorageNames {
  blacklist: string;
  blacklistChunks: string;
  showblacklistTargets: string;
  debug: string;
}

export interface IStorageDefault {
  showblacklistTargets: boolean;
  debug: boolean;
}

@Singleton
export class MainConfig implements IMainConfig {
  public name: string = 'Kemono Filter';
  public storageNames: IStorageNames = {
    blacklist: 'Blacklist',
    blacklistChunks: 'BlacklistChunks',
    showblacklistTargets: 'ShowBlacklistdTargets',
    debug: 'Debug'
  };

  public storageDefault: IStorageDefault = {
    showblacklistTargets: true,
    debug: false
  };

  public refreshInterval: number = 1000;
}
