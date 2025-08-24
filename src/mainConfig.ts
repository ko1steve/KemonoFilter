import { Singleton } from 'typescript-ioc';

export interface IMainConfig {
  localStorage: {
    blacklist: ILocalStorage,
    showblacklistUser: ILocalStorage
  }
}

export interface ILocalStorage {
  name: string
}

@Singleton
export class MainConfig implements IMainConfig {
  public localStorage = {
    blacklist: {
      name: 'Blacklist'
    },
    showblacklistUser: {
      name: 'ShowBlacklistdUser'
    }
  };
}
