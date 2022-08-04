import { mount } from '@vue/test-utils'
import {{name}} from './{{name}}.vue'

describe('Test <{{name}} />', () => {
  test('it should render successfully', () => {
    expect({{name}}).toBeTruthy()
    const wrapper = mount({{name}}, {
      props: {
        text: 'foo',
      },
    })
    expect(wrapper.find('p').text()).toContain('foo')
    expect(wrapper.html()).toMatchSnapshot()
  })
})