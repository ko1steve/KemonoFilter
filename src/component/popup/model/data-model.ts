import { Container, Singleton } from 'typescript-ioc';
import { MiniSignal } from 'mini-signals';
import { MainConfig } from './../../../main-config';
import { PopupMessageDispatcher } from './../util/message-dispatcher';
import { MessageType } from './../../../data/message-data';
import { IPopupInitData } from './../data/common-data';

@Singleton
export class PopupDataModel {
  protected mainConfig: MainConfig;

  protected numberOfTargets: number;

  private _showBlacklistTargets: boolean = true;
  public get showBlacklistTargets(): boolean {
    return this._showBlacklistTargets;
  }

  public set showBlacklistTargets(value: boolean) {
    this._showBlacklistTargets = value;
  }

  protected debug: boolean;

  public onInitializeBlacklistCompleteSignal: MiniSignal;

  constructor() {
    this.mainConfig = Container.get(MainConfig);
    this.onInitializeBlacklistCompleteSignal = new MiniSignal();
    this.numberOfTargets = 0;
    this.debug = false;
    this.initialize();
  }

  protected async initialize(): Promise<void> {
    const initData = await this.getPopupInitData();
    if (!initData) {
      return;
    }
    this.showBlacklistTargets = initData.showBlacklistTargets;
    this.numberOfTargets = initData.numberOfTargets;
    this.debug = initData.debug;
    this.onInitializeBlacklistCompleteSignal.dispatch(initData);
  }

  protected getPopupInitData(): Promise<IPopupInitData> {
    return new Promise<IPopupInitData>(resolve => {
      PopupMessageDispatcher.sendTabMessage({ name: MessageType.REQUEST_POPUP_INIT_DATA }, (response: IPopupInitData) => {
        resolve(response);
      });
    });
  }

  public fixDataCaseSensitive(): void {
    PopupMessageDispatcher.sendTabMessage({
      name: MessageType.FIX_DATA_CASE_SENSITIVE
    });
  }

  public clearLocalStorageData(): void {
    PopupMessageDispatcher.sendTabMessage({
      name: MessageType.CLEAR_LOCAL_STORAGE_DATA
    });
  }

  public clearSyncStorageData(): void {
    PopupMessageDispatcher.sendTabMessage({
      name: MessageType.CLEAR_SYNC_STORAGE_DATA
    });
  }
}
