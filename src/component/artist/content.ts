import { Container } from 'typescript-ioc';
import { ComponentController } from '../../core/componentController';
import { ArtistConfig } from './config';
import './style.css';

class ArtistController extends ComponentController {
  protected componentConfig!: ArtistConfig;

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
    return infoElement.getAttribute('data-id');
  }

  protected reloadPage () {
    // No need to reload
  }
}

const hrefRegex = /^https:\/\/kemono\..+\/.+\/user\/.+\/recommended$/gmi;
if (hrefRegex.test(window.location.href)) {
  const componentConfig = Container.get(ArtistConfig);
  const controller = new ArtistController(componentConfig);
}
