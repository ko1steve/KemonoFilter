import { CommonUtil } from 'src/util/common-util';
import { ListTaskHandler } from '../../../../core/task/list-task-handler';

export class KemonoWorkTaskHandler extends ListTaskHandler {
  public start(): Promise<void> {
    return new Promise<void>(resolve => {
      const listContainer = this.getListContainer();
      if (!listContainer) {
        CommonUtil.showLog('[' + this.constructor.name + '] Can\'t find the information list.');
        return resolve();
      }
      const listChildren = this.getListChildren(listContainer);
      if (!listChildren || listChildren.length === 0) {
        return resolve();
      }
      listChildren.forEach(infoElement => {
        this.addCheckBoxToListEachChild(infoElement, listContainer);
      });
      if (this.countListElementInit === listChildren.length) {
        this.setAlreadyRunTask(listContainer);
      }
      this.countListElementInit = 0;
      resolve();
    });
  }

  protected getListContainer(): HTMLElement | undefined {
    return document.getElementsByClassName('card-list__items')[0] as HTMLElement;
  }

  protected getRawTargetString(infoElement: HTMLElement): string | undefined {
    const userId = infoElement.getAttribute('data-user');
    if (!userId) {
      return undefined;
    }
    return userId;
  }
}
