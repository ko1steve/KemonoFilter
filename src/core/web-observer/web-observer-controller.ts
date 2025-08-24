import { TSMap } from 'typescript-map';
import { Container, Inject } from 'typescript-ioc';
import { ComponentController } from '../../core/component/component-controller';
import { CommonUtil } from '../../util/common-util';
import { StringFormatter } from '../../util/string-formatter';
import { MessageDispatcher } from '../../util/message-dispatcher';
import { MessageType } from '../../data/message-data';
import { ControllerType, WebObserverConfig } from './web-observer-config';

export class WebObserverController {
  protected config: WebObserverConfig;
  protected currentUrl: string;
  protected currentController: ComponentController | undefined;
  protected controllerMap: TSMap<string, ComponentController>;

  constructor(@Inject config: WebObserverConfig) {
    this.config = config;
    this.currentUrl = StringFormatter.EMPTY_STRING;
    this.controllerMap = new TSMap<ControllerType, ComponentController>();
    this.addPopupListener();
    this.createWebObserver();
  }

  protected addPopupListener(): void {
    MessageDispatcher.addListener(MessageType.REQUEST_POPUP_INIT_DATA, (message, sender, sendResponse) => {
      if (!this.currentController || !this.currentController.running) {
        sendResponse(undefined);
      }
    });
  }

  protected createWebObserver(): void {
    const observer = new MutationObserver(() => {
      if (this.currentUrl === location.href) {
        return;
      }
      if (this.currentController) {
        this.currentController.running = false;
      }
      this.currentUrl = location.href;
      const matchUrl = this.mathchStoreUrls(location.href);
      if (matchUrl && this.config.urlTypeMap.has(matchUrl)) {
        CommonUtil.showLog('Url: ' + location.href + ' is mathched');
        const controllerType = this.config.urlTypeMap.get(matchUrl);
        if (this.controllerMap.has(controllerType)) {
          this.currentController = this.controllerMap.get(controllerType);
          if (!this.currentController.running) {
            this.currentController.running = true;
          }
        } else {
          const ConfigClass = this.config.configClassMap.get(controllerType);
          if (!ConfigClass) {
            CommonUtil.showLog('Can\'t find any related controller\'s class');
            return;
          }
          this.currentController = new ComponentController(Container.get(ConfigClass));
          this.currentController.running = true;
          this.controllerMap.set(controllerType, this.currentController);
        }
      } else {
        CommonUtil.showLog('%cUrl: ' + location.href + ' is unmathched', 'color:red;');
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  }

  protected mathchStoreUrls(url: string): RegExp | undefined {
    return this.config.urlTypeMap.keys().find(e => e.test(url));
  }
}
