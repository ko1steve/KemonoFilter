import { MainConfig } from 'src/main-config';
import { IShowLogMessage, IShowObjectMessage, MessageType } from './../../data/message-data';
import { MessageDispatcher } from './../../util/message-dispatcher';
import { Container } from 'typescript-ioc';

const mainConfig: MainConfig = Container.get(MainConfig);

MessageDispatcher.addListener(MessageType.SHOW_LOG, (message, sender, sendResponse) => {
  message = message as IShowLogMessage;
  if (message.data.optionalParams && message.data.optionalParams.length > 0) {
    console.log(message.data.param, ...message.data.optionalParams);
  } else {
    console.log(message.data.param);
  }
  sendResponse();
});

MessageDispatcher.addListener(MessageType.SHOW_OBJECT, (message, sender, sendResponse) => {
  message = message as IShowObjectMessage;
  console.log('%c[%s] Show_Object', 'color: red; font-weight: bold', mainConfig.name);
  console.log(message.data.object);
  sendResponse();
});
