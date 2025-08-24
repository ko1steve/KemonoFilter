import { IButtonElement, ICheckboxImageElement, IHTMLElement, ILabelEleemnt } from '../data/commonData';

export interface IComponentConfig {
  componentId: string
  checkboxContainer: ICheckBoxContainer
  headerBottomContainer: IHeaderContainer
  downloadButton: IButtonElement
  uploadButton: IUploadButton
}

export interface ICheckBoxContainer extends IHTMLElement {
  checkbox: ICheckboxImageElement
}

export interface IHeaderContainer extends IHTMLElement {
  showBlacklistUserContainer: IShowBlacklistUserCheckbox
}

export interface IShowBlacklistUserCheckbox extends IHTMLElement {
  checkbox: ICheckboxImageElement
}

export interface IUploadButton extends IHTMLElement {
  label: ILabelEleemnt
  input: IHTMLElement
}

export class ComponentConfig implements IComponentConfig {
  public componentId = 'component';

  public checkboxContainer: ICheckBoxContainer = {
    className: 'checkboxContainer',
    checkbox: {
      className: 'checkboxImg',
      sourceName: 'image/checkbox_across_enabled.png',
      disabledSourceName: 'image/checkbox_across_disabled.png',
      action: 'actionCheckboxEnabled',
      disabledAction: 'actionCheckboxDisabled'
    }
  };

  public headerBottomContainer: IHeaderContainer = {
    id: 'headerBottom',
    className: 'flexbox',
    showBlacklistUserContainer: {
      id: 'showBlacklistUserCheckboxContainer',
      className: 'flexbox flexboxItem',
      checkbox: {
        id: 'showBlacklistUserCheckboxImg',
        sourceName: 'image/checkbox_tick_enabled.png',
        disabledSourceName: 'image/checkbox_tick_disabled.png',
        action: 'actionShowBlacklistUserCheckboxEnabled',
        disabledAction: 'actionShowBlacklistUserCheckboxDisabled',
        text: {
          id: 'showBlaclistUserCheckboxText',
          innerText: 'Also show in-blacklist users ({numberOfUser} users)'
        }
      }
    }
  };

  public downloadButton: IButtonElement = {
    id: 'downloadLocalStorageAsJsonButton',
    className: 'flexboxItem',
    textContent: 'Download local stoage data as JSON'
  };

  public uploadButton: IUploadButton = {
    label: {
      id: 'uploadLocalStorageFromJsonLabel',
      className: 'flexboxItem',
      textContent: 'Upload JSON to overwrite local storage data'
    },
    input: {
      id: 'uploadLocalStorageFromJsonInput'
    }
  };
}
