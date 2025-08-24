import { Container } from 'typescript-ioc';
import { ComponentController } from '../../core/componentController';
import { SearchConfig } from './config';
import './style.css';

class SearchController extends ComponentController {
  protected componentConfig!: SearchConfig;

  protected getPageHeader (): HTMLElement | null {
    const header = document.getElementsByClassName('global-sidebar expanded')[0] as HTMLElement;
    if (!header) {
      return null;
    }
    return header;
  }

  protected getThreadListContainer (): HTMLElement | null {
    const container = document.getElementsByClassName('card-list__items')[0] as HTMLElement;
    return container;
  }

  protected getCheckboxParent (infoElement?: HTMLElement): HTMLElement | null {
    if (!infoElement) {
      return null;
    }
    return infoElement;
  }

  protected getUserName (infoElement?: HTMLElement): string | null {
    if (!infoElement) {
      return null;
    }
    return infoElement.getAttribute('data-user');
  }
}

const hrefRegexArr = [
  /^https:\/\/kemono\..+\/posts.*$/gmi,
  /^https:\/\/kemono\..+\/.+\/user\/[A-Za-z0-9]+[^/]+$/gmi
];
if (hrefRegexArr.some(regExp => regExp.test(window.location.href))) {
  const componentConfig = Container.get(SearchConfig);
  const controller = new SearchController(componentConfig);
}
