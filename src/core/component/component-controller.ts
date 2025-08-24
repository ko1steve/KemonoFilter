import { Container, Inject } from 'typescript-ioc';
import { MainConfig } from './../../main-config';
import { ComponentConfig } from './component-config';
import { CommonUtil } from '../../util/common-util';
import { DataModel } from './../../model/data-model';
import { MessageDispatcher } from '../../util/message-dispatcher';
import { IShowBlacklistGammeMessage, IUpdateBlacklistDataFromPopupMessage, MessageType } from '../../data/message-data';
import { IReqeustBlacklistDataResponse, IReqeustPopupInitDataResponse } from './../../component/popup/data/message-data';
import { GlobalEventDispatcher, GlobalEventType } from '../../util/global-event-dispatcher';
import { StorageType } from '../../util/data-storage';
import { TaskHandler } from '../task/task-handler';

export class ComponentController {
  @Inject
  protected dataModel: DataModel;

  protected componentId: string;
  protected mainConfig: MainConfig;
  protected componentConfig: ComponentConfig;
  protected taskQueue: TaskHandler[];

  protected _running;
  public get running(): boolean {
    return this._running;
  }

  public set running(running: boolean) {
    if (this._running === running) {
      return;
    }
    this._running = running;
    if (running) {
      this.initailzie();
    }
    CommonUtil.showLog('extension controller ' + this.componentConfig.componentId + ' is ' + (running ? 'running' : 'stopped'));
  }

  constructor(componentConfig: ComponentConfig) {
    this.componentConfig = componentConfig;
    this._running = false;
    this.taskQueue = [];
    this.componentId = componentConfig.componentId;
    this.mainConfig = Container.get(MainConfig);
    this.dataModel = Container.get(DataModel);
    this.addSignalListener();
    this.addMessageListener();
    this.addGlobalEventListener();
  }

  protected addSignalListener(): void {
    this.dataModel.onInitializeBlacklistCompleteSignal.add(this.onInitializeBlacklist.bind(this));
  }

  protected onInitializeBlacklist(): void {
    if (this.running) {
      this.initailzie();
    }
  }

  protected addMessageListener(): void {
    MessageDispatcher.addListener(MessageType.REQUEST_POPUP_INIT_DATA, (message, sender, sendResponse) => {
      if (!this._running) {
        sendResponse(undefined);
      }
      sendResponse({
        numberOfTargets: this.dataModel.numberOfTargets,
        showBlacklistTargets: this.dataModel.showBlacklistTargets,
        debug: this.dataModel.debug
      } as IReqeustPopupInitDataResponse);
    });
    MessageDispatcher.addListener(MessageType.SHOW_BLACKLIST_TARGETS, (message, sender, sendResponse) => {
      message = message as IShowBlacklistGammeMessage;
      this.dataModel.updateShowBlacklistTargets(message.data.show).then(() => {
        this.reloadPage();
        sendResponse();
      });
      return true;
    });
    MessageDispatcher.addListener(MessageType.REQUEST_BLACKLIST_DATA, (message, sender, sendResponse) => {
      const jsonContent = this.dataModel.getBlacklistData();
      sendResponse({ jsonContent } as IReqeustBlacklistDataResponse);
    });
    MessageDispatcher.addListener(MessageType.UPDATE_BLACKLIST_DATA_FROM_POPUP, (message, sender, sendResponse) => {
      message = message as IUpdateBlacklistDataFromPopupMessage;
      this.dataModel.updateBlacklistDataFromPopup(message.data.content).then(() => {
        this.reloadPage();
        sendResponse();
      });
      return true;
    });
    MessageDispatcher.addListener(MessageType.FIX_DATA_CASE_SENSITIVE, (message, sender, sendResponse) => {
      this.dataModel.fixDataCaseSensitive().then(() => {
        CommonUtil.showLog('The issue of Case Sensitive is clear.');
        sendResponse();
      });
      return true;
    });
    MessageDispatcher.addListener(MessageType.CLEAR_LOCAL_STORAGE_DATA, (message, sender, sendResponse) => {
      const confirmed = window.confirm('Are you sure to clear local storage data ?');
      if (confirmed) {
        this.dataModel.clearData(StorageType.LOCAL).then(() => {
          CommonUtil.showLog('Local Data is clear.');
          sendResponse();
        });
        return true;
      } else {
        sendResponse();
      }
    });
    MessageDispatcher.addListener(MessageType.CLEAR_SYNC_STORAGE_DATA, (message, sender, sendResponse) => {
      const confirmed = window.confirm('Are you sure to clear sync storage data ?');
      if (confirmed) {
        this.dataModel.clearData(StorageType.SYNC).then(() => {
          CommonUtil.showLog('Sync Data is clear.');
          sendResponse();
          this.reloadPage();
        });
        return true;
      } else {
        sendResponse();
      }
    });
  }

  protected reloadPage(): void {
    location.reload();
  }

  protected addGlobalEventListener(): void {
    GlobalEventDispatcher.addListener(GlobalEventType.DEBUG_MODE_ON, this.turnOnDebugMode.bind(this));
    GlobalEventDispatcher.addListener(GlobalEventType.DEBUG_MODE_OFF, this.turnOffDebugMode.bind(this));
    GlobalEventDispatcher.addListener(GlobalEventType.SHOW_ALL_BLACKIST_DATA, this.showAllStorageData.bind(this));
  }

  protected turnOnDebugMode(): void {
    this.dataModel.updateDebugMode(true).then(() => {
      CommonUtil.showLog('Debug Mode turns on.');
    });
  }

  protected turnOffDebugMode(): void {
    this.dataModel.updateDebugMode(false).then(() => {
      CommonUtil.showLog('Debug Mode turns off.');
    });
  }

  protected showAllStorageData(): void {
    this.dataModel.showAllBlaclistData().then(() => {
      //
    });
  }

  protected initailzie(): void {
    if (!this.dataModel.initialized) {
      return;
    }
    this.setupTaskQueue();
    const promiseList: Promise<void>[] = [];
    this.taskQueue.forEach(e => promiseList.push(e.start()));
    Promise.all(promiseList).then(() => {
      this.clearTaskQueue();
      setTimeout(() => {
        if (this._running) {
          this.initailzie();
        }
      }, this.mainConfig.refreshInterval);
    });
  }

  protected setupTaskQueue(): void {
    this.componentConfig.taskClasses.forEach(Task => {
      this.taskQueue.push(new Task(this.componentConfig, this.dataModel));
    });
  }

  protected clearTaskQueue(): void {
    this.taskQueue = [];
  }
}
