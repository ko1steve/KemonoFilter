import { StringFormatter } from 'src/util/string-formatter';
import { ListTaskHandler } from '../../../../core/task/list-task-handler';

export class KemonoArtistTaskHandler extends ListTaskHandler {
  protected getListContainer(): HTMLElement | undefined {
    return document.getElementsByClassName('card-list__items')[0] as HTMLElement;
  }

  protected getRawTargetString(infoElement: HTMLElement): string | undefined {
    const userId = infoElement?.getAttribute('data-id');
    if (!userId) {
      return undefined;
    }
    return userId;
  }

  protected getCheckboxParent(infoContainer: HTMLElement): HTMLElement | undefined {
    const infoChildren = Array.from(infoContainer.children) as HTMLElement[];
    if (!infoChildren || infoChildren.length === 0) {
      return undefined;
    }
    const featureInfo = infoChildren.filter(e => e.className.split(StringFormatter.SPACE).includes('feature-info'))[0];
    return featureInfo || infoContainer;
  }
}
