import { TaskHandler } from '../../../../core/task/task-handler';
import { DataModel } from '../../../../model/data-model';
import { KemonoWorkTaskHandler } from '../task/work';
import { ComponentConfig, ITextHandleConfig } from '../../../../core/component/component-config';

export class KemonoWorkConfig extends ComponentConfig {
  public componentId: string = 'work';
  public taskClasses: (new (componentConfig: ComponentConfig, dataModel: DataModel)=> TaskHandler)[] = [
    KemonoWorkTaskHandler
  ];
}
