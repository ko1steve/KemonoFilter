import { DataModel } from '../../model/data-model';
import { TaskHandler } from '../task/task-handler';
import { ICheckboxImageElement, IHTMLElement } from '../../data/common-data';

export interface IComponentConfig {
  componentId: string
  checkboxContainer: ICheckBoxContainer
  texthandle: ITextHandleConfig
  taskClasses: (new (componentConfig: ComponentConfig, dataModel: DataModel)=> TaskHandler)[];
}

export interface ITextHandleConfig {
  startWords: string[]
  endWords: string[]
  cutToEndWords: string[]
  excludeTitleWords: string[]
  excludeClassNames?: string[]
}

export interface ICheckBoxContainer extends IHTMLElement {
  checkbox: ICheckboxImageElement
}

export interface IShowBlacklistTargetCheckbox extends IHTMLElement {
  checkbox: ICheckboxImageElement
}

export class ComponentConfig implements IComponentConfig {
  public componentId = 'component';

  public checkboxContainer: ICheckBoxContainer = {
    className: 'checkboxContainer',
    checkbox: {
      className: 'checkboxImg',
      sourceName: 'image/checkbox_across_enabled.png',
      disabledSourceName: 'image/checkbox_across_disabled.png',
      action: 'actionCheckboxEnabled',
      disabledAction: 'actionCheckboxDisabled'
    }
  };

  public texthandle: ITextHandleConfig = {
    startWords: [],
    endWords: [],
    cutToEndWords: [],
    excludeTitleWords: []
  };

  public taskClasses: (new (componentConfig: ComponentConfig, dataModel: DataModel)=> TaskHandler)[] = [
    // ProductTaskHandler,
    // ListTaskHandler,
    // MultiListTaskHandler
  ];
}
