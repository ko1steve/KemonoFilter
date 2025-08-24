import { Container } from 'typescript-ioc';
import { TSMap } from 'typescript-map';
import { MainConfig } from '../mainConfig';
import { ComponentConfig } from './componentConfig';
import { IUserInfoOption } from 'src/data/commonData';
import { CommonTool } from 'src/util/commonTool';

export class ComponentController {
  protected componentId: string;
  protected mainConfig: MainConfig;
  protected componentConfig: ComponentConfig;
  protected blacklistMap: TSMap<string, string[]>;
  protected showBlacklistUser = true;
  protected hasInit = false;
  protected numberOfUser = 0;

  constructor (componentConfig: ComponentConfig) {
    this.componentId = componentConfig.componentId;
    this.mainConfig = Container.get(MainConfig);
    this.componentConfig = componentConfig;
    this.blacklistMap = new TSMap<string, string[]>();
    this.initailzie();
    this.addEventListeners();
    CommonTool.showLog('Component "' + this.componentConfig.componentId + '" is ready.');
  }

  public initailzie (): void {
    if (!this.hasInit) {
      this.initBlacklist();
    }
    this.createHeaderBottomContainer();
    this.handleListPageContent();
    this.hasInit = true;
    setTimeout(() => this.initailzie(), 500);
  }

  protected addEventListeners () {
    // add event listener
  }

  protected initBlacklist (): void {
    const jsonContent = localStorage.getItem(this.mainConfig.localStorage.blacklist.name);
    if (!jsonContent) {
      this.blacklistMap = new TSMap<string, string[]>();
    } else {
      this.blacklistMap = new TSMap<string, string[]>(Object.entries(JSON.parse(jsonContent)));
    }
    this.initNumberOfUser();
    const showBlacklistUserInStorage = localStorage.getItem(this.mainConfig.localStorage.showblacklistUser.name);
    if (showBlacklistUserInStorage == null) {
      this.showBlacklistUser = true;
      localStorage.setItem(this.mainConfig.localStorage.showblacklistUser.name, 'true');
    } else {
      this.showBlacklistUser = showBlacklistUserInStorage === 'true';
    }
  }

  protected initNumberOfUser (): void {
    this.numberOfUser = 0;
    this.blacklistMap.forEach(list => {
      this.numberOfUser += list.length;
    });
  }

  protected createHeaderBottomContainer (): void {
    const header = this.getPageHeader();
    if (!header || header.dataset?.hasInit === 'true') {
      return;
    }
    this.modifyHeader(header);

    const config = this.componentConfig.headerBottomContainer;
    const container = document.createElement('div');
    container.id = config.id!;
    container.className = config.className!;
    header.appendChild(container);

    this.createShowBlacklistUserCheckbox(container);
    this.createDownloadButton(container);
    this.createUploadButton(container);

    header.dataset.hasInit = 'true';
  }

  protected getPageHeader (): HTMLElement | null {
    const header = document.getElementById('header-id');
    if (!header) {
      return null;
    }
    return header;
  }

  protected modifyHeader (header: HTMLElement): void {
    // modify header (ex. add class, modify style)
  }

  protected createShowBlacklistUserCheckbox (parent: HTMLElement): void {
    const containerConfig = this.componentConfig.headerBottomContainer.showBlacklistUserContainer;
    const container = document.createElement('div');
    container.id = containerConfig.id!;
    container.className = containerConfig.className!;
    parent.appendChild(container);

    const chexkboxConfig = containerConfig.checkbox;
    const checkboxImg = document.createElement('img');
    checkboxImg.id = chexkboxConfig.id!;
    if (this.showBlacklistUser) {
      this.setShowBlacklistUserCheckboxEnabled(checkboxImg);
    } else {
      this.setShowBlacklistUserCheckboxDisabled(checkboxImg);
    }
    checkboxImg.onclick = (event) => {
      if (checkboxImg.dataset.action === chexkboxConfig.disabledAction!) {
        this.setShowBlacklistUserCheckboxEnabled(checkboxImg);
        localStorage.setItem(this.mainConfig.localStorage.showblacklistUser.name, 'true');
      } else {
        this.setShowBlacklistUserCheckboxDisabled(checkboxImg);
        localStorage.setItem(this.mainConfig.localStorage.showblacklistUser.name, 'false');
      }
      this.reloadPage();
    };
    container.appendChild(checkboxImg);

    const text = document.createElement('text');
    text.id = chexkboxConfig.text!.id!;
    text.innerText = chexkboxConfig.text!.innerText.replace('{numberOfUser}', this.numberOfUser.toString());
    container.appendChild(text);
  }

  protected reloadPage () {
    location.reload();
  }

  protected createDownloadButton (parent: HTMLElement): void {
    const button = document.createElement('button');
    button.id = this.componentConfig.downloadButton.id!;
    button.className = this.componentConfig.downloadButton.className!;
    button.textContent = this.componentConfig.downloadButton.textContent!;
    button.onclick = () => {
      this.downloadLocalStorageDataAsJson();
    };
    parent.appendChild(button);
  }

  protected downloadLocalStorageDataAsJson (): void {
    const blacklistContent = localStorage.getItem(this.mainConfig.localStorage.blacklist.name);
    if (blacklistContent) {
      const blob = new Blob([blacklistContent], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'blacklist.json';
      a.click();
    }
  }

  protected createUploadButton (parent: HTMLElement): void {
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
    input.onchange = () => {
      if (confirm('Are you sure to upload the JSON ?')) {
        this.uploadLocalStorageDataFromJson();
      } else {
        input.files = null;
        input.value = '';
      }
    };
    parent.appendChild(input);
  }

  protected uploadLocalStorageDataFromJson (): void {
    const fileInput: HTMLInputElement = document.getElementById(this.componentConfig.uploadButton.input.id!) as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const jsonContent = event.target.result as string;
          localStorage.setItem(this.mainConfig.localStorage.blacklist.name, jsonContent);
          alert('Finished.');
          this.reloadPage();
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a JSON file to upload.');
    }
  }

  protected handleListPageContent (): void {
    const threadListContainer = this.getThreadListContainer() as HTMLDivElement;
    if (!threadListContainer || !threadListContainer.dataset || threadListContainer.dataset.hasInit === 'true') {
      return;
    }
    const threadListChildren = Array.from(threadListContainer.children) as HTMLElement[];
    if (!this.isThreadListFirstChildExist(threadListChildren) || this.isThreadListFirstChildInit(threadListChildren)) {
      return;
    }
    threadListChildren.forEach(threadInfoElement => {
      this.addCheckBoxToThreadListEachChild(threadInfoElement, threadListContainer);
    });
    threadListContainer.dataset.hasInit = 'true';
  }

  protected isThreadListFirstChildExist (children: HTMLElement[]): boolean {
    return children != null && children[0] != null;
  }

  protected isThreadListFirstChildInit (children: HTMLElement[]): boolean {
    return children[0].dataset && children[0].dataset.hasInit === 'true';
  }

  protected addCheckBoxToThreadListEachChild (threadInfoElement: HTMLElement, threadListContainer: HTMLElement): void {
    if (threadInfoElement.dataset && threadInfoElement.dataset.hasInit === 'true') {
      return;
    }
    const modifiedInfoElement = this.modifyThreadInfoElement(threadInfoElement, threadListContainer);
    if (!modifiedInfoElement) {
      return;
    }
    threadInfoElement = modifiedInfoElement;
    const userName = this.getUserName(threadInfoElement);
    if (!userName) {
      return;
    }
    const checkboxParent = this.getCheckboxParent(threadInfoElement);
    if (!checkboxParent) {
      return;
    }
    this.addCheckbox(checkboxParent, userName, {
      hideUser: {
        infoElement: threadInfoElement,
        parentList: threadListContainer
      }
    });
    const inBlacklist = this.getUserStatus(userName);
    if (inBlacklist && !this.showBlacklistUser) {
      this.hideUser(threadListContainer, threadInfoElement);
    }
    threadInfoElement.dataset.hasInit = 'true';
  }

  protected modifyThreadInfoElement (infoElement: HTMLElement, parent: HTMLElement): HTMLElement | null {
    // ex. add class, remove children
    return infoElement;
  }

  protected getThreadListContainer (): HTMLElement | null {
    const container = document.getElementById('threadList');
    return container;
  }

  protected getUserName (infoElement?: HTMLElement): string | null {
    if (!document.getElementById('user')) {
      return null;
    }
    return (document.getElementById('user') as HTMLElement).innerText;
  }

  protected getCheckboxParent (infoElement?: HTMLElement): HTMLElement | null {
    const checkboxParent = document.getElementById('product-info');
    return checkboxParent;
  }

  protected addCheckbox (checkboxParent: HTMLElement, userName: string, option?: IUserInfoOption): void {
    let checkboxImg = checkboxParent.getElementsByClassName(this.componentConfig.checkboxContainer.checkbox.className!)[0] as HTMLImageElement;
    if (!checkboxImg) {
      checkboxImg = this.createCheckbox(checkboxParent);
      checkboxImg.onclick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (checkboxImg.dataset.action === this.componentConfig.checkboxContainer.checkbox.disabledAction) {
          this.initBlacklist();
          this.addUserToBlacklist(userName);
          this.initNumberOfUser();
          this.updateTextOfNumberOfUser();
          this.setCheckboxEnabled(checkboxImg);
          if (option?.hideUser) {
            if (!this.showBlacklistUser) {
              this.hideUser(option.hideUser.parentList, option.hideUser.infoElement);
            }
            this.reloadPage();
          }
        } else {
          this.initBlacklist();
          this.removeUserFromBlacklist(userName);
          this.initNumberOfUser();
          this.updateTextOfNumberOfUser();
          this.setCheckboxDisabled(checkboxImg);
          this.reloadPage();
        }
      };
      checkboxParent.dataset.hasInit = 'true';
      const inBlacklist = this.getUserStatus(userName);
      if (inBlacklist) {
        console.log('[extension] In Blacklist : ' + userName);
        this.setCheckboxEnabled(checkboxImg);
      }
    }
  }

  protected createCheckbox (parent: HTMLElement): HTMLImageElement {
    const conainer = document.createElement('div');
    conainer.className = this.componentConfig.checkboxContainer.className!;
    const checkboxImg = document.createElement('img');
    checkboxImg.className = this.componentConfig.checkboxContainer.checkbox.className!;
    this.setCheckboxDisabled(checkboxImg);
    conainer.appendChild(checkboxImg);
    parent.style.position = 'relative';
    parent.appendChild(conainer);
    return checkboxImg;
  }

  protected setCheckboxEnabled (checkboxImg: HTMLImageElement): void {
    const config = this.componentConfig.checkboxContainer.checkbox;
    checkboxImg.dataset.action = config.action;
    checkboxImg.src = chrome.runtime.getURL(config.sourceName!);
  }

  protected setCheckboxDisabled (checkboxImg: HTMLImageElement): void {
    const config = this.componentConfig.checkboxContainer.checkbox;
    checkboxImg.dataset.action = config.disabledAction;
    checkboxImg.src = chrome.runtime.getURL(config.disabledSourceName!);
  }

  protected setShowBlacklistUserCheckboxEnabled (checkboxImg: HTMLImageElement): void {
    const config = this.componentConfig.headerBottomContainer.showBlacklistUserContainer.checkbox;
    checkboxImg.dataset.action = config.action!;
    checkboxImg.src = chrome.runtime.getURL(config.sourceName!);
  }

  protected setShowBlacklistUserCheckboxDisabled (checkboxImg: HTMLImageElement): void {
    const config = this.componentConfig.headerBottomContainer.showBlacklistUserContainer.checkbox;
    checkboxImg.dataset.action = config.disabledAction!;
    checkboxImg.src = chrome.runtime.getURL(config.disabledSourceName!);
  }

  protected updateTextOfNumberOfUser (): void {
    const text = document.getElementById(this.componentConfig.headerBottomContainer.showBlacklistUserContainer.checkbox.text!.id!) as HTMLTextAreaElement;
    if (!text) {
      return;
    }
    const textContent = this.componentConfig.headerBottomContainer.showBlacklistUserContainer.checkbox.text!.innerText.replace('{numberOfUser}', this.numberOfUser.toString());
    text.innerText = textContent;
  }

  protected hideUser (threadListContainer: HTMLElement, threadInfoElement: HTMLElement): void {
    threadListContainer.removeChild(threadInfoElement);
  }

  protected getUserStatus (userName: string): boolean {
    const key = userName[0];
    if (!this.blacklistMap.has(key)) {
      return false;
    }
    return this.blacklistMap.get(key)!.includes(userName);
  }

  protected addUserToBlacklist (userName: string): void {
    const key = userName[0];
    if (!this.blacklistMap.has(key)) {
      this.blacklistMap.set(key, [userName]);
    } else {
      const list = this.blacklistMap.get(key)!;
      list.push(userName);
      this.blacklistMap.set(key, list);
    }
    localStorage.setItem(this.mainConfig.localStorage.blacklist.name, JSON.stringify(Object.fromEntries(this.blacklistMap.entries())));
    CommonTool.showLog('Add "' + userName + '" to blacklist. ');
  }

  protected removeUserFromBlacklist (userName: string): void {
    const key = userName[0];
    if (!this.blacklistMap.has(key)) {
      return;
    }
    const list = this.blacklistMap.get(key)!;
    const index = list.findIndex(e => e === userName);
    if (index < 0) {
      return;
    }
    list.splice(index, 1);
    this.blacklistMap.set(key, list);
    localStorage.setItem(this.mainConfig.localStorage.blacklist.name, JSON.stringify(Object.fromEntries(this.blacklistMap.entries())));
    CommonTool.showLog('Removed "' + userName + '" from blacklist. ');
  }

  protected trimUserName (): void {
    const jsonContent = localStorage.getItem(this.mainConfig.localStorage.blacklist.name);
    if (!jsonContent) {
      return;
    } else {
      const blacklistMap = new Map<string, string[]>(Object.entries(JSON.parse(jsonContent)));
      blacklistMap.forEach((userNameArr, k) => {
        userNameArr.forEach((userName, i) => {
          userNameArr[i] = userName.trim();
        });
        blacklistMap.set(k, userNameArr);
      });
    }
    localStorage.setItem(this.mainConfig.localStorage.blacklist.name, JSON.stringify(Object.fromEntries(this.blacklistMap.entries())));
  }
}
