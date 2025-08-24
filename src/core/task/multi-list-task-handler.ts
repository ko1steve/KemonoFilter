import { CommonUtil } from '../../util/common-util';
import { ITargetInfoOption } from '../../data/common-data';
import { StringFormatter } from '../../util/string-formatter';
import { TaskHandler } from './task-handler';

export class MultiListTaskHandler extends TaskHandler {
  protected countListElementInit: number = 0;

  public start(): Promise<void> {
    return new Promise<void>(resolve => {
      const listContainerArr = this.getMultiListContainer();
      if (!listContainerArr || listContainerArr.length === 0) {
        CommonUtil.showLog('[' + this.constructor.name + '] Can\'t find the information list.');
        return resolve();
      }
      for (const listContainer of listContainerArr) {
        if (!listContainer) {
          CommonUtil.showLog('[' + this.constructor.name + '] Information list is undefined.');
          continue;
        }
        const listChildren = this.getListChildren(listContainer);
        if (!listChildren || listChildren.length === 0 || !this.isListFirstChildExist(listChildren)) {
          continue;
        }
        listChildren.forEach((infoElement, i) => {
          this.addCheckBoxToListEachChild(infoElement, listContainer);
        });
        if (this.countListElementInit === listChildren.length) {
          this.setAlreadyRunTask(listContainer);
        }
        this.countListElementInit = 0;
      }
      resolve();
    });
  }

  protected getMultiListContainer(): HTMLElement[] | undefined {
    const containers = Array.from(document.getElementsByClassName('ListName')) as HTMLElement[];
    if (!containers || containers.length === 0) {
      return undefined;
    }
    return containers;
  }

  protected getListChildren(listContainer: HTMLElement): HTMLElement[] | undefined {
    if (!listContainer.children) {
      return undefined;
    }
    return Array.from(listContainer.children) as HTMLElement[];
  }

  protected isListFirstChildExist(children: HTMLElement[]): boolean {
    const firstInfo = children[0];
    return firstInfo !== undefined;
  }

  protected addCheckBoxToListEachChild(infoElement: HTMLElement, listContainer: HTMLElement): void {
    if (infoElement.dataset && this.getAlreadyRunTask(infoElement)) {
      this.countListElementInit++;
      return;
    }
    const modifiedInfoElement = this.modifyTargetInfoElement(infoElement, listContainer);
    if (!modifiedInfoElement) {
      return;
    }
    infoElement = modifiedInfoElement;
    const rawTargetString = this.getRawTargetString(infoElement);
    if (!rawTargetString) {
      CommonUtil.showLog('Can\'t get target string.');
      return;
    }
    const targetString = this.getModifiedTargetString(rawTargetString);

    const checkboxParent = this.getCheckboxParent(infoElement);
    if (!checkboxParent) {
      CommonUtil.showLog('Can\'t get checkbox parent.');
      return;
    }
    const inBlacklist = this.dataModel.getTargetStatus(targetString);
    this.addCheckbox(checkboxParent, targetString, inBlacklist, {
      hideTarget: {
        infoElement,
        parentList: listContainer
      }
    });
    if (inBlacklist && !this.dataModel.showBlacklistTargets) {
      this.hideTarget(infoElement);
    }
    this.setAlreadyRunTask(infoElement);
    this.countListElementInit++;
  }

  protected modifyTargetInfoElement(infoElement: HTMLElement, parent: HTMLElement): HTMLElement | undefined {
    // ex. add class, remove children
    return infoElement;
  }

  protected getRawTargetString(infoContainer?: HTMLElement): string | undefined {
    return document.getElementById('target')?.innerText;
  }

  protected getModifiedTargetString(targetString: string): string {
    const config = this.componentConfig.texthandle;
    config.startWords.forEach(e => {
      if (targetString.startsWith(e)) {
        const cutIndex = targetString.indexOf(e);
        targetString = targetString.substring(cutIndex + e.length);
      }
    });
    config.cutToEndWords.forEach(e => {
      const cutIndex = targetString.indexOf(e);
      if (cutIndex >= 0) {
        targetString = targetString.substring(0, cutIndex);
      }
    });
    config.excludeTitleWords.forEach(e => { targetString = targetString.replace(e, StringFormatter.EMPTY_STRING); });
    config.endWords.forEach(e => {
      if (targetString.endsWith(e)) {
        const cutIndex = targetString.lastIndexOf(e);
        targetString = targetString.substring(0, cutIndex);
      }
    });
    targetString = targetString.trim();
    return targetString;
  }

  protected getCheckboxParent(infoContainer: HTMLElement): HTMLElement | undefined {
    return infoContainer;
  }

  protected addCheckbox(checkboxParent: HTMLElement, targetString: string, inBlacklist: boolean, option?: ITargetInfoOption): void {
    let checkboxImg = checkboxParent.getElementsByClassName(this.componentConfig.checkboxContainer.checkbox.className!)[0] as HTMLImageElement;
    if (!checkboxImg) {
      checkboxImg = this.createCheckbox(checkboxParent);
      checkboxImg.onclick = (event): void => {
        event.stopPropagation();
        event.preventDefault();
        if (checkboxImg.dataset.action === this.componentConfig.checkboxContainer.checkbox.disabledAction) {
          this.dataModel.addTargetStringToBlacklist(targetString);
          this.setCheckboxEnabled(checkboxImg);
          if (!this.dataModel.showBlacklistTargets && option?.hideTarget) {
            this.hideTarget(option.hideTarget.infoElement);
          }
          this.recheckTargets(targetString, true, this.dataModel.showBlacklistTargets);
        } else {
          this.dataModel.removeTargetStringFromBlacklist(targetString);
          this.setCheckboxDisabled(checkboxImg);
          this.recheckTargets(targetString, false, this.dataModel.showBlacklistTargets);
        }
      };
      this.setAlreadyRunTask(checkboxParent);
      if (inBlacklist) {
        CommonUtil.showLog('[' + this.constructor.name + '] In Blacklist : ' + targetString);
        this.setCheckboxEnabled(checkboxImg);
      }
    }
  }

  protected recheckTargets(currentTargetString: string, isTargetHide: boolean, showHide: boolean = true): void {
    const listContainerArr = this.getMultiListContainer()!;
    for (const listContainer of listContainerArr) {
      const listChildren = this.getListChildren(listContainer)!;
      for (const infoElement of listChildren) {
        const rawTargetString = this.getRawTargetString(infoElement)!;
        const targetString = this.getModifiedTargetString(rawTargetString);
        if (targetString === currentTargetString) {
          const checkboxParent = this.getCheckboxParent(infoElement);
          const checkboxImg = checkboxParent?.getElementsByClassName(this.componentConfig.checkboxContainer.checkbox.className!)[0] as HTMLImageElement;
          if (isTargetHide) {
            this.setCheckboxEnabled(checkboxImg);
            if (!showHide) {
              this.hideTarget(infoElement);
            }
          } else {
            this.setCheckboxDisabled(checkboxImg);
            if (!showHide) {
              return this.reloadPage();
            }
          }
        }
      };
    }
  }

  protected reloadPage(): void {
    location.reload();
  }

  protected createCheckbox(parent: HTMLElement): HTMLImageElement {
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

  protected setCheckboxEnabled(checkboxImg: HTMLImageElement): void {
    const config = this.componentConfig.checkboxContainer.checkbox;
    checkboxImg.dataset.action = config.action;
    checkboxImg.src = chrome.runtime.getURL(config.sourceName!);
  }

  protected setCheckboxDisabled(checkboxImg: HTMLImageElement): void {
    const config = this.componentConfig.checkboxContainer.checkbox;
    checkboxImg.dataset.action = config.disabledAction;
    checkboxImg.src = chrome.runtime.getURL(config.disabledSourceName!);
  }

  protected hideTarget(target: HTMLElement, parent?: HTMLElement): void {
    target.style.display = 'none';
  }

  protected setAlreadyRunTask(element: HTMLElement): void {
    element.dataset.hasInit = 'true';
  }

  protected getAlreadyRunTask(element: HTMLElement): boolean {
    return element.dataset.hasInit === 'true';
  }
}
