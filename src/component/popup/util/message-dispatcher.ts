import { Singleton } from 'typescript-ioc';
import { Message } from './../../../data/message-data';
import { MessageDispatcher } from './../../../util/message-dispatcher';
import { PopupCommonUtil } from './common-util';

@Singleton
export class PopupMessageDispatcher extends MessageDispatcher {
  public static async sendTabMessage(message: Message, responseCallback?: (response: any)=> void): Promise<any> {
    if (!await PopupCommonUtil.testUrl()) {
      return;
    }
    if (!chrome.runtime.onMessage.hasListeners()) {
      return;
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.id === undefined) {
      return Promise.reject(new Error('Can\'t get the tab id'));
    }
    if (responseCallback) {
      return new Promise<void>(resolve => {
        chrome.tabs.sendMessage(tab.id!, message, responseCallback);
        resolve();
      });
    }
    return chrome.tabs.sendMessage(tab.id!, message);
  }
}

chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any)=> void) => {
  if (!PopupMessageDispatcher.messageMap.has(message.name)) {
    return;
  }
  PopupMessageDispatcher.messageMap.get(message.name).forEach(callback => callback(message, sender, sendResponse));
});
