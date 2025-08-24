import { Message, MessageType } from '../data/message-data';

export class CommonUtil {
  public static async showLog(param: any, ...optionalParams: any[]): Promise<void> {
    if (!chrome.runtime.onMessage.hasListeners()) {
      return;
    }
    const message: Message = { name: MessageType.SHOW_LOG, data: { param } };
    if (optionalParams && optionalParams.length > 0) {
      message.data.optionalParams = optionalParams;
    }
    await chrome.runtime.sendMessage(message);
  }

  public static matchWildcardPattern(pattern: string, str: string): boolean {
    const source = '^' + pattern.replaceAll('.', '\\.').replaceAll('?', '\\?').replaceAll('*', '.*') + '$';
    const regExp = new RegExp(source);
    return regExp.test(str);
  }

  public static testUrl(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab || tab.id === undefined || tab.url === undefined) {
          return resolve(false);
        }
        const manifest = chrome.runtime.getManifest();
        const findUrl = manifest.content_scripts?.some(e => e.matches?.some(pattern => CommonUtil.matchWildcardPattern(pattern, tab.url!)));
        if (findUrl === undefined) {
          return resolve(false);
        }
        return resolve(findUrl);
      });
    });
  }
}
