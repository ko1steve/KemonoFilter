import Pako from 'pako';
import { TSMap } from 'typescript-map';
import { MiniSignal } from 'mini-signals';
import { Container, Singleton } from 'typescript-ioc';
import { MainConfig } from './../main-config';
import { CommonUtil } from './../util/common-util';
import { StringFormatter } from './../util/string-formatter';
import { DataStorage, StorageType, StorageDataType } from './../util/data-storage';

@Singleton
export class DataModel {
  protected mainConfig: MainConfig;

  protected blacklistMap: TSMap<string, string[]>;

  private _numberOfTargets: number;
  public get numberOfTargets(): number {
    return this._numberOfTargets;
  }

  private _showBlacklistTargets: boolean = true;
  public get showBlacklistTargets(): boolean {
    return this._showBlacklistTargets;
  }

  private _debug: boolean;
  public get debug(): boolean {
    return this._debug;
  }

  private _initialized: boolean;
  public get initialized(): boolean {
    return this._initialized;
  }

  protected tempLegacyBlacklistData: string;

  public onInitializeBlacklistCompleteSignal: MiniSignal;

  constructor() {
    this.mainConfig = Container.get(MainConfig);
    this.blacklistMap = new TSMap<string, string[]>();
    this.onInitializeBlacklistCompleteSignal = new MiniSignal();
    this.tempLegacyBlacklistData = StringFormatter.EMPTY_STRING;
    this._numberOfTargets = 0;
    this._debug = false;
    this._initialized = false;
  }

  public async initialize(): Promise<void> {
    await this.initBlacklist();
    await this.initShowBlacklistTargets();
    await this.initDebugMode();
    this.initNumberOfTargets();
    this._initialized = true;
    this.onInitializeBlacklistCompleteSignal.dispatch();
  }

  protected async initBlacklist(): Promise<void> {
    const blacklistData: Array<string> = await this.getBlacklistDataFromStorage() as Array<string>;
    const jsonContent: string | undefined = Pako.inflate(Uint8Array.from(blacklistData), { to: 'string' });
    if (!jsonContent) {
      this.blacklistMap = new TSMap<string, string[]>();
    } else {
      this.blacklistMap = new TSMap<string, string[]>(Object.entries(JSON.parse(jsonContent)));
    }
  }

  protected async initShowBlacklistTargets(): Promise<void> {
    const showBlacklistTargets = await DataStorage.getItem(this.mainConfig.storageNames.showblacklistTargets);
    if (showBlacklistTargets === undefined) {
      await DataStorage.setItem(this.mainConfig.storageNames.showblacklistTargets, true);
      this._showBlacklistTargets = true;
    } else {
      this._showBlacklistTargets = showBlacklistTargets as boolean;
    }
  }

  protected async initDebugMode(): Promise<void> {
    const debug = await DataStorage.getItem(this.mainConfig.storageNames.debug);
    if (debug === undefined) {
      await DataStorage.setItem(this.mainConfig.storageNames.debug, false);
      this._debug = false;
    } else {
      this._debug = debug as boolean;
    }
  }

  protected initNumberOfTargets(): void {
    this._numberOfTargets = 0;
    this.blacklistMap.forEach(list => {
      this._numberOfTargets += list.length;
    });
  }

  public async addTargetStringToBlacklist(targetString: string): Promise<void> {
    await this.initBlacklist();
    return new Promise<void>(resolve => {
      const lowerCaseTitle = targetString.toLowerCase();
      const key = lowerCaseTitle[0];
      if (!this.blacklistMap.has(key)) {
        this.blacklistMap.set(key, [lowerCaseTitle]);
      } else {
        const list = this.blacklistMap.get(key)!;
        if (list.includes(lowerCaseTitle)) {
          CommonUtil.showLog('"' + targetString + '" is already in blacklist. ');
          return resolve();
        }
        list.push(lowerCaseTitle);
        this.blacklistMap.set(key, list);
      }
      this.updateBlacklistDataToStorage().then(() => {
        CommonUtil.showLog('Add "' + targetString + '" to blacklist. ');
        this._numberOfTargets++;
        resolve();
      });
    });
  }

  public async removeTargetStringFromBlacklist(targetString: string): Promise<void> {
    await this.initBlacklist();
    return new Promise<void>(resolve => {
      const lowerCaseTitle = targetString.toLowerCase();
      const key = lowerCaseTitle[0];
      if (!this.blacklistMap.has(key)) {
        return resolve();
      }
      const list = this.blacklistMap.get(key)!;
      const index = list.findIndex(e => e === lowerCaseTitle);
      if (index < 0) {
        CommonUtil.showLog('"' + targetString + '" was already removed from blacklist. ');
        return resolve();
      }
      list.splice(index, 1);
      this.blacklistMap.set(key, list);

      this.updateBlacklistDataToStorage().then(() => {
        CommonUtil.showLog('Remove "' + targetString + '" to blacklist. ');
        this._numberOfTargets--;
        resolve();
      });
    });
  }

  public getTargetStatus(targetString: string): boolean {
    targetString = targetString.toLowerCase();
    const key = targetString[0];
    if (!this.blacklistMap.has(key)) {
      return false;
    }
    return this.blacklistMap.get(key)!.includes(targetString);
  }

  protected async updateBlacklistDataToStorage(jsonContent?: string): Promise<void> {
    let saveChunks: number = 0;
    const base64Chunks = this.getBlacklistJsonChunk(jsonContent);
    if (base64Chunks.length === 0) {
      return await this.recoverLegacyBlacklistData();
    }
    for (let i = 0; i < base64Chunks.length; i++) {
      try {
        await DataStorage.setItem(this.mainConfig.storageNames.blacklist + '_' + i.toString(), base64Chunks[i]);
        saveChunks++;
      } catch (ex) {
        console.error(ex);
        CommonUtil.showLog('DataStorage.setItem "Blacklist_' + i.toString() + '" failed.');
        break;
      }
    }
    if (saveChunks === base64Chunks.length) {
      await DataStorage.setItem(this.mainConfig.storageNames.blacklistChunks, saveChunks);
    } else {
      for (let i = 0; i < saveChunks; i++) {
        await DataStorage.remove(this.mainConfig.storageNames.blacklist + '_' + i.toString(), StorageType.SYNC);
        await DataStorage.remove(this.mainConfig.storageNames.blacklistChunks);
      }
      await this.recoverLegacyBlacklistData();
    }
  }

  protected async clearLegacyStorageData(): Promise<void> {
    const numberOfChunkData: StorageDataType | undefined = await DataStorage.getItem(this.mainConfig.storageNames.blacklistChunks);
    if (numberOfChunkData !== undefined) {
      const numberOfChunk: number = numberOfChunkData as number;
      for (let i = 0; i < numberOfChunk; i++) {
        await DataStorage.remove(this.mainConfig.storageNames.blacklist + '_' + i.toString(), StorageType.SYNC);
      }
      await DataStorage.remove(this.mainConfig.storageNames.blacklistChunks, StorageType.SYNC);
    }
  }

  protected async getBlacklistDataFromStorage(): Promise<StorageDataType | undefined> {
    const numberOfChunkData: StorageDataType | undefined = await DataStorage.getItem(this.mainConfig.storageNames.blacklistChunks);
    if (!numberOfChunkData) {
      return [];
    }
    const numberOfChunk: number = numberOfChunkData as number;
    let base64FullData: string = '';
    for (let i = 0; i < numberOfChunk; i++) {
      const base64Chunk = await DataStorage.getItem(this.mainConfig.storageNames.blacklist + '_' + i.toString());
      if (!base64Chunk) {
        return [];
      }
      base64FullData += base64Chunk as string;
    }
    const uint8ArrayData = StringFormatter.stringToUint8Array(atob(base64FullData as string));
    return Array.from(uint8ArrayData);
  }

  protected getBlacklistJsonChunk(jsonContent?: string): string[] {
    if (!jsonContent) {
      jsonContent = JSON.stringify(Object.fromEntries(this.blacklistMap.entries()));
    }
    const compressedDataUint8Arr = Pako.deflate(jsonContent);
    const base64Data = btoa(StringFormatter.uint8ArrayToString(compressedDataUint8Arr));
    const chunkSize = DataStorage.MAX_STORAGE_BYTE_PER_KEY;
    const base64DataChunks: string[] = this.chunkStringToArray(base64Data, chunkSize);
    for (let i = 0; i < base64DataChunks.length; i++) {
      const blob = new Blob([base64DataChunks[i]], { type: 'text/plain' });
      CommonUtil.showLog('Blob [' + i + '] size : ' + blob.size);
      if (blob.size > DataStorage.MAX_STORAGE_BYTE_PER_KEY) {
        CommonUtil.showLog('Data size too big. Failed to update blacklist.');
        return [];
      }
    }
    return base64DataChunks;
  }

  protected async recoverLegacyBlacklistData(): Promise<void> {
    if (this.tempLegacyBlacklistData !== StringFormatter.EMPTY_STRING) {
      await DataStorage.setItem(this.mainConfig.storageNames.blacklist, this.tempLegacyBlacklistData);
      this.tempLegacyBlacklistData = StringFormatter.EMPTY_STRING;
    }
  }

  protected chunkStringToArray(base64Data: string, chunkSize: number, start: number = 0, chunks: string[] = []): string[] {
    if (start === base64Data.length) {
      return chunks;
    }
    const end: number = (start + chunkSize < base64Data.length) ? start + chunkSize : base64Data.length;
    chunks.push(base64Data.slice(start, end));
    return this.chunkStringToArray(base64Data, chunkSize, end, chunks);
  }

  public getBlacklistData(): string {
    return JSON.stringify(Object.fromEntries(this.blacklistMap.entries()));
  }

  public async updateBlacklistDataFromPopup(content: string): Promise<void> {
    await this.clearLegacyStorageData();
    await this.updateBlacklistDataToStorage(content);
  }

  public updateShowBlacklistTargets(show: boolean): Promise<void> {
    return DataStorage.setItem(this.mainConfig.storageNames.showblacklistTargets, show);
  }

  public updateDebugMode(debug: boolean): Promise<void> {
    return new Promise<void>(resolve => {
      this._debug = debug;
      DataStorage.setItem(this.mainConfig.storageNames.debug, debug).then(() => {
        resolve();
      });
    });
  }

  public clearData(type: StorageType): Promise<void> {
    return DataStorage.clear(type);
  }

  public async showAllBlaclistData(): Promise<void> {
    await DataStorage.getItem(this.mainConfig.storageNames.blacklist, StorageType.LOCAL).then((storageData) => {
      CommonUtil.showLog('Local blacklist data : ' + storageData);
    });
    await DataStorage.getItem(this.mainConfig.storageNames.blacklist, StorageType.SYNC).then((storageData) => {
      CommonUtil.showLog('Sync blacklist data : ' + storageData);
    });
  }

  public async fixDataCaseSensitive(): Promise<void> {
    const entries = this.blacklistMap.entries();
    for (let i = 0; i < entries.length; i++) {
      const capital = entries[i][0] as string;
      const targetList = entries[i][1] as string[];
      for (const j in targetList) {
        targetList[j] = targetList[j].toLowerCase();
      }
      const lowerCapital = capital.toLowerCase();
      if (capital !== lowerCapital) {
        const lowerCaseEntry = entries.find(entry => entry[0] === lowerCapital);
        if (lowerCaseEntry) {
          (lowerCaseEntry[1] as string[]).push(...targetList);
        } else {
          entries.push([lowerCapital, [...targetList]]);
        }
        entries.splice(+i, 1);
        i--;
      }
    }
    const newJsonContent = JSON.stringify(Object.fromEntries(entries));
    await DataStorage.setItem(this.mainConfig.storageNames.blacklist, Array.from(Pako.deflate(newJsonContent)));
  }
}
