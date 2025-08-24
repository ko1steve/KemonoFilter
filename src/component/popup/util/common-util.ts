import { Message, MessageType } from './../../../data/message-data';
import { CommonUtil } from './../../../util/common-util';

export class PopupCommonUtil extends CommonUtil {
  public static async showLog(param: any, ...optionalParams: any[]): Promise<void> {
    if (!chrome.runtime.onMessage.hasListeners()) {
      return;
    }
    const message: Message = { name: MessageType.SHOW_LOG, data: { param } };
    if (optionalParams && optionalParams.length > 0) {
      message.data.optionalParams = optionalParams;
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.id === undefined) {
      return Promise.reject(new Error('Can\'t get the tab id'));
    }
    return chrome.runtime.sendMessage(message);
  }

  public static async showObject(object: any): Promise<void> {
    if (!chrome.runtime.onMessage.hasListeners()) {
      return;
    }
    const message: Message = { name: MessageType.SHOW_OBJECT, data: { object } };
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.id === undefined) {
      return Promise.reject(new Error('Can\'t get the tab id'));
    }
    return chrome.runtime.sendMessage(message);
  }
}
