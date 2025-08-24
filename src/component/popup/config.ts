import { IShowBlacklistTargetCheckbox } from './../../core/component/component-config';
import { IButtonElement, IHTMLElement, ILabelEleemnt } from './../../data/common-data';

export interface IPopupConfig {
  componentId: string;
  showBlacklistTargetContainer: IShowBlacklistTargetCheckbox;
  downloadButton: IButtonElement;
  uploadButton: IUploadButton;
  fixDataCaseSensitiveButton: IButtonElement;
  clearLocalStorageButton: IButtonElement;
  clearSyncStorageButton: IButtonElement;
}

export interface IUploadButton extends IHTMLElement {
  label: ILabelEleemnt
  input: IHTMLElement
}

export class PopupConfig implements IPopupConfig {
  public componentId: string = 'popup';

  public showBlacklistTargetContainer: IShowBlacklistTargetCheckbox = {
    id: 'showBlacklistTargetCheckboxContainer',
    className: 'flexbox-left settings',
    checkbox: {
      id: 'showBlacklistTargetCheckbox',
      text: {
        id: 'showBlaclistTargetCheckboxText',
        innerText: 'Show in-blacklist targets ({numberOfTargets})'
      }
    }
  };

  public downloadButton: IButtonElement = {
    id: 'downloadButton',
    className: 'settings',
    textContent: 'Download blacklist data'
  };

  public uploadButton: IUploadButton = {
    label: {
      id: 'uploadButtonLabel',
      className: 'settings',
      textContent: 'Upload blacklist data'
    },
    input: {
      id: 'uploadButtonInput'
    }
  };

  public fixDataCaseSensitiveButton: IButtonElement = {
    id: 'fixDataCaseSensitiveButton',
    className: 'settings settings-button',
    textContent: 'Fix case sensitive of blacklist data'
  };

  public clearLocalStorageButton: IButtonElement = {
    id: 'clearLocalStorageButton',
    className: 'settings settings-button',
    textContent: 'Clear Local Storage Data'
  };

  public clearSyncStorageButton: IButtonElement = {
    id: 'clearSyncStorageButton',
    className: 'settings',
    textContent: 'Clear Sync Storage Data'
  };
}
