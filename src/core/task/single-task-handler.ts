import { CommonUtil } from '../../util/common-util';
import { StringFormatter } from '../../util/string-formatter';
import { ITargetInfoOption } from '../../data/common-data';
import { TaskHandler } from './task-handler';

export class SingleTaskHandler extends TaskHandler {
  public start(): Promise<void> {
    return new Promise<void>(resolve => {
      const rawTargetString = this.getRawTargetString();
      if (!rawTargetString) {
        return resolve();
      }
      const targetString = this.getModifiedTargetString(rawTargetString);

      const checkboxParent = this.getCheckboxParent();
      if (!checkboxParent) {
        return resolve();
      }
      const inBlacklist = this.dataModel.getTargetStatus(targetString);
      this.addCheckbox(checkboxParent, targetString, inBlacklist);
      resolve();
    });
  }

  protected getRawTargetString(): string | undefined {
    return document.getElementById('title')?.innerText;
  }

  protected getModifiedTargetString(rawTargetStringh: string): string {
    const config = this.componentConfig.texthandle;
    config.startWords.forEach(e => {
      if (rawTargetStringh.startsWith(e)) {
        const cutIndex = rawTargetStringh.indexOf(e);
        rawTargetStringh = rawTargetStringh.substring(cutIndex + e.length);
      }
    });
    config.cutToEndWords.forEach(e => {
      const cutIndex = rawTargetStringh.indexOf(e);
      if (cutIndex >= 0) {
        rawTargetStringh = rawTargetStringh.substring(0, cutIndex);
      }
    });
    config.excludeTitleWords.forEach(e => { rawTargetStringh = rawTargetStringh.replace(e, StringFormatter.EMPTY_STRING); });
    config.endWords.forEach(e => {
      if (rawTargetStringh.endsWith(e)) {
        const cutIndex = rawTargetStringh.lastIndexOf(e);
        rawTargetStringh = rawTargetStringh.substring(0, cutIndex);
      }
    });
    rawTargetStringh = rawTargetStringh.trim();
    return rawTargetStringh;
  }

  protected getCheckboxParent(): HTMLElement | undefined {
    const checkboxParent = document.getElementById('product-info');
    if (!checkboxParent) {
      return undefined;
    }
    return checkboxParent;
  }

  protected addCheckbox(checkboxParent: HTMLElement, targetString: string, inBlacklist: boolean, option?: ITargetInfoOption): void {
    let checkboxImg = checkboxParent.getElementsByClassName(this.componentConfig.checkboxContainer.checkbox.className!)[0] as HTMLImageElement;
    if (!checkboxImg) {
      checkboxImg = this.createCheckbox(checkboxParent);
      checkboxImg.onclick = (): void => {
        if (checkboxImg.dataset.action === this.componentConfig.checkboxContainer.checkbox.disabledAction) {
          this.dataModel.addTargetStringToBlacklist(targetString);
          this.setCheckboxEnabled(checkboxImg);
          if (!this.dataModel.showBlacklistTargets && option?.hideTarget) {
            this.hideTarget(option.hideTarget.infoElement);
          }
        } else {
          this.dataModel.removeTargetStringFromBlacklist(targetString);
          this.setCheckboxDisabled(checkboxImg);
        }
      };
      checkboxParent.dataset.hasInit = 'true';
      if (inBlacklist) {
        CommonUtil.showLog('[' + this.constructor.name + '] In Blacklist : ' + targetString);
        this.setCheckboxEnabled(checkboxImg);
      }
    }
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
}
