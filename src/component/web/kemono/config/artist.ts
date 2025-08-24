import { ComponentConfig } from '../../../../core/component/component-config';
import { TaskHandler } from '../../../../core/task/task-handler';
import { DataModel } from '../../../../model/data-model';
import { KemonoArtistTaskHandler } from '../task/artist';

export class KemonoArtistConfig extends ComponentConfig {
  public componentId: string = 'artist';
  public taskClasses: (new (componentConfig: ComponentConfig, dataModel: DataModel)=> TaskHandler)[] = [
    KemonoArtistTaskHandler
  ];
}
