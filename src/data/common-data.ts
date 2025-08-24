export interface IHTMLElement {
  id?: string
  className?: string
}

export interface ITextElement extends IHTMLElement {
  innerText: string
}

export interface ILabelEleemnt extends IHTMLElement {
  textContent: string
}

export interface IButtonElement extends IHTMLElement {
  sourceName?: string
  disabledSourceName?: string
  action?: string
  disabledAction?: string
  textContent?: string
}

export interface ICheckboxImageElement extends IButtonElement {
  text?: ITextElement
}

export interface ITargetInfoOption {
  hideTarget?: {
    infoElement: HTMLElement
    parentList: HTMLElement
  }
}
