import { TSMap } from 'typescript-map';
import { ComponentConfig } from '../component/component-config';
import { ComponentController } from '../component/component-controller';
import { TaskHandler } from '../task/task-handler';
import { DataModel } from '../../model/data-model';

export enum ControllerType {
  PRODUCT = 'PRODUCT',
  SEARCH = 'SEARCH'
}

export interface IWebObserverConfig {
  urlTypeMap: TSMap<RegExp, string>;
  configClassMap: TSMap<string, new ()=> ComponentConfig>
}

export class WebObserverConfig implements IWebObserverConfig {
  public urlTypeMap = new TSMap<RegExp, string>([
    // [
    //   'https://*/', ControllerType.PRODUCT
    // ],
    // [
    //   'https://*/', ControllerType.SEARCH
    // ]
  ]);

  public configClassMap = new TSMap<string, new()=> ComponentConfig>([
    // [
    //   ControllerType.PRODUCT, ProductConfig
    // ],
    // [
    //   ControllerType.SEARCH, SearchConfig
    // ]
  ]);
}
