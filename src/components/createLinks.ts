export interface ILinkItem {
  text: string
  link: string
}

export function createLinks(): ILinkItem[] {
  return [
    {
      text: 'ResizableContainer',
      link: '/components/ResizableContainer/Readme',
    },
    //-------------------- EXPORT LINK LINE  --------------------
  ]
}
