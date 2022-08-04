import { defineConfig } from 'vitepress'
import { createLinks } from '../components/createLinks'

const links = createLinks()

export default defineConfig({
  lang: 'en-US',
  title: '@VITE-STYLEGUIDIST / COMPONENTS',
  description: 'Yep another vue UI components',
  lastUpdated: true,
  themeConfig: {
    nav: nav(),
    sidebar: {
      '/guide/': sidebarGuide(),
      '/components/': sidebarComponents(),
    },
    footer: {
      message: 'Power by XXX Team',
      copyright: 'Copyright @ 2022-present xxx.com',
    },
  },
})

function nav() {
  return [
    {
      text: 'Getting Started',
      link: '/getting-started',
      activeMatch: '/getting-started',
    },
    {
      text: 'Components',
      link: links[0].link,
      activeMatch: '/components/',
    },
  ]
}

function sidebarGuide() {
  return [
    {
      text: 'Getting Started',
      collapsible: true,
      items: [{ text: 'Getting Started', link: '/getting-started' }],
    },
  ]
}

function sidebarComponents() {
  return [
    {
      text: 'Components',
      collapsible: true,
      items: links,
    },
  ]
}
