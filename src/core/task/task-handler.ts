import { DataModel } from './../../model/data-model';
import { ComponentConfig } from '../component/component-config';

export class TaskHandler {
  protected componentConfig: ComponentConfig;
  protected dataModel: DataModel;

  constructor(componentConfig: ComponentConfig, dataModel: DataModel) {
    this.componentConfig = componentConfig;
    this.dataModel = dataModel;
  }

  public start(): Promise<void> {
    return Promise.resolve();
  }
}
