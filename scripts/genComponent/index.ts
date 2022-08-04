import { getUserInput } from './getUserInput'
import { genTemplate } from './genTemplate'

const main = async () => {
  const meta = await getUserInput()
  console.log(meta)
  console.log(`组件 ${meta.name} 已经新建完成`)
  genTemplate(meta)
}
main()
