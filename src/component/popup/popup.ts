import './popup.css';
import { MainConfig } from 'src/main-config';
import { Container, Inject } from 'typescript-ioc';
import { IPopupConfig, PopupConfig } from './config';
import { PopupDataModel } from './model/data-model';
import { IPopupInitData } from './data/common-data';
import { PopupMessageDispatcher } from './util/message-dispatcher';
import { MessageType } from './../../data/message-data';
import { IReqeustBlacklistDataResponse } from './../../component/popup/data/message-data';

export class PopupController {
  @Inject
  protected popupDataModel: PopupDataModel;

  protected mainConfig: MainConfig;

  protected componentConfig: IPopupConfig;

  /**
   * Creates an instance of PopupController. Invoked when popup is opened.
   * @param {IPopupConfig} componentConfig
   * @memberof PopupController
   */
  constructor(componentConfig: IPopupConfig) {
    this.popupDataModel = Container.get(PopupDataModel);
    this.mainConfig = Container.get(MainConfig);
    this.componentConfig = componentConfig;
    this.addSignalListener();
  }

  protected addSignalListener(): void {
    this.popupDataModel.onInitializeBlacklistCompleteSignal.add(this.initailzie.bind(this));
  }

  protected initailzie(initData: IPopupInitData): void {
    const container = document.createElement('div');
    container.id = 'mainContainer';
    container.className = 'flexbox-column';
    document.body.appendChild(container);

    this.createShowBlacklistTargetsCheckbox(container, initData);
    this.createClearSyncStorageButton(container);

    if (initData.debug) {
      this.createDownloadButton(container);
      this.createUploadButton(container);
    }
  }

  protected createShowBlacklistTargetsCheckbox(parent: HTMLElement, initData: IPopupInitData): void {
    const containerConfig = this.componentConfig.showBlacklistTargetContainer;
    const container = document.createElement('div');
    container.id = containerConfig.id!;
    container.className = containerConfig.className!;
    parent.appendChild(container);

    const chexkboxConfig = containerConfig.checkbox;
    const checkbox = document.createElement('input');
    checkbox.id = chexkboxConfig.id!;
    checkbox.type = 'checkbox';
    checkbox.checked = initData.showBlacklistTargets;
    checkbox.onchange = (): void => {
      PopupMessageDispatcher.sendTabMessage({ name: MessageType.SHOW_BLACKLIST_TARGETS, data: { show: checkbox.checked } });
    };
    container.appendChild(checkbox);

    const text = document.createElement('text');
    text.id = chexkboxConfig.text!.id!;
    text.innerText = chexkboxConfig.text!.innerText.replace('{numberOfTargets}', initData.numberOfTargets.toString());
    container.appendChild(text);
  }

  protected createDownloadButton(parent: HTMLElement): void {
    const button = document.createElement('button');
    button.id = this.componentConfig.downloadButton.id!;
    button.className = this.componentConfig.downloadButton.className!;
    button.textContent = this.componentConfig.downloadButton.textContent!;
    button.onclick = (): void => {
      this.downloadBlacklistData();
    };
    parent.appendChild(button);
  }

  protected async downloadBlacklistData(): Promise<void> {
    PopupMessageDispatcher.sendTabMessage({ name: MessageType.REQUEST_BLACKLIST_DATA }, (response: IReqeustBlacklistDataResponse) => {
      if (response.jsonContent) {
        const blob = new Blob([response.jsonContent], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'blacklist.json';
        a.click();
      }
    });
  }

  protected createUploadButton(parent: HTMLElement): void {
    const label = document.createElement('label');
    label.htmlFor = this.componentConfig.uploadButton.input.id!;
    label.id = this.componentConfig.uploadButton.label.id!;
    label.className = this.componentConfig.uploadButton.label.className!;
    label.textContent = this.componentConfig.uploadButton.label.textContent;
    parent.appendChild(label);

    const input = document.createElement('input');
    input.type = 'file';
    input.id = this.componentConfig.uploadButton.input.id!;
    input.accept = '.json';
    input.onchange = (): void => {
      this.uploadBlacklistData();
    };
    parent.appendChild(input);
  }

  protected uploadBlacklistData(): void {
    const fileInput: HTMLInputElement = document.getElementById(this.componentConfig.uploadButton.input.id!) as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = async (event): Promise<void> => {
        if (event.target) {
          const content = event.target.result as string;
          PopupMessageDispatcher.sendTabMessage({ name: MessageType.UPDATE_BLACKLIST_DATA_FROM_POPUP, data: { content } });
        }
      };
      reader.readAsText(file);
    }
  }

  protected createFixDataButton(parent: HTMLElement): void {
    const button = document.createElement('button');
    button.id = this.componentConfig.fixDataCaseSensitiveButton.id!;
    button.className = this.componentConfig.fixDataCaseSensitiveButton.className!;
    button.textContent = this.componentConfig.fixDataCaseSensitiveButton.textContent!;
    button.onclick = (): void => {
      this.popupDataModel.fixDataCaseSensitive();
    };
    parent.appendChild(button);
  }

  protected createClearLocalStorageButton(parent: HTMLElement): void {
    const button = document.createElement('button');
    button.id = this.componentConfig.clearLocalStorageButton.id!;
    button.className = this.componentConfig.clearLocalStorageButton.className!;
    button.textContent = this.componentConfig.clearLocalStorageButton.textContent!;
    button.onclick = (): void => {
      this.popupDataModel.clearLocalStorageData();
    };
    parent.appendChild(button);
  }

  protected createClearSyncStorageButton(parent: HTMLElement): void {
    const button = document.createElement('button');
    button.id = this.componentConfig.clearSyncStorageButton.id!;
    button.className = this.componentConfig.clearSyncStorageButton.className!;
    button.textContent = this.componentConfig.clearSyncStorageButton.textContent!;
    button.onclick = (): void => {
      this.popupDataModel.clearSyncStorageData();
    };
    parent.appendChild(button);
  }
}

const componentConfig = Container.get(PopupConfig);
const popupController = new PopupController(componentConfig);
