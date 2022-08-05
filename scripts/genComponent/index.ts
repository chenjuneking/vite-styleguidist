import { getUserInput } from './getUserInput'
import { genTemplate } from './genTemplate'

const main = async () => {
  const meta = await getUserInput()
  console.log(meta)
  console.log(`Create component: ${meta.name}, done!`)
  genTemplate(meta)
}
main()
