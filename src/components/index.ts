import * as utils from '@/utils'
import * as hooks from '@/hooks'
import editorLoader from './Editor/loader'

const configEditor = editorLoader.config

export { EStorageType, EDevice, ENetworkStatus, ETheme } from '@/constants'

export { utils, hooks }
export { configEditor }

export {
  default as ResizableContainer,
  // @ts-ignore
  type IResizableContainerProps,
} from './ResizableContainer/ResizableContainer.vue'

export {
  default as Editor,
  // @ts-ignore
  type IEditorProps,
} from './Editor/Editor.vue'

//-------------------- EXPORT LINE  --------------------
