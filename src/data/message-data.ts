export enum MessageType {
  REQUEST_POPUP_INIT_DATA = 'REQUEST_POPUP_INIT_DATA',
  FIX_DATA_CASE_SENSITIVE = 'FIX_DATA_CASE_SENSITIVE',
  SHOW_BLACKLIST_TARGETS = 'SHOW_BLACKLIST_TARGETS',
  UPDATE_BLACKLIST_DATA_FROM_POPUP = 'UPDATE_BLACKLIST_DATA_FROM_POPUP',
  REQUEST_BLACKLIST_DATA = 'REQUEST_BLACKLIST_DATA',
  CLEAR_LOCAL_STORAGE_DATA = 'CLEAR_LOCAL_STORAGE_DATA',
  CLEAR_SYNC_STORAGE_DATA = 'CLEAR_SYNC_STORAGE_DATA',
  SHOW_LOG = 'SHOW_LOG',
  SHOW_OBJECT = 'SHOW_OBJECT'
}

export type Message = IRequestPopupInitDataMessage | IShowBlacklistGammeMessage | IUpdateBlacklistDataFromPopupMessage | IFixDataCaseSensitiveMessage | IRequestBlacklistDataMessage | IShowLogMessage | IShowObjectMessage | IClearLocalStorageDataMessage | IClearSyncStorageDataMessage;

export interface IRequestPopupInitDataMessage {
  name: MessageType.REQUEST_POPUP_INIT_DATA;
}

export interface IShowBlacklistGammeMessage {
  name: MessageType.SHOW_BLACKLIST_TARGETS,
  data: {
    show: boolean
  };
}

export interface IUpdateBlacklistDataFromPopupMessage {
  name: MessageType.UPDATE_BLACKLIST_DATA_FROM_POPUP,
  data: {
    content: string
  };
}

export interface IFixDataCaseSensitiveMessage {
  name: MessageType.FIX_DATA_CASE_SENSITIVE;
}

export interface IRequestBlacklistDataMessage {
  name: MessageType.REQUEST_BLACKLIST_DATA;
}

export interface IClearLocalStorageDataMessage {
  name: MessageType.CLEAR_LOCAL_STORAGE_DATA;
}

export interface IClearSyncStorageDataMessage {
  name: MessageType.CLEAR_SYNC_STORAGE_DATA;
}

export interface IShowLogMessage {
  name: MessageType.SHOW_LOG;
  data: {
    param: any,
    optionalParams?: any[]
  }
}

export interface IShowObjectMessage {
  name: MessageType.SHOW_OBJECT;
  data: {
    object: any
  }
}
