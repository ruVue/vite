import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { buildEnd } from './buildEnd.config'

const ogDescription = 'Интерфейсные инструменты нового поколения'
const ogImage = 'https://vitejs.ru/og-image.jpg'
const ogTitle = 'Vite'
const ogUrl = 'https://vitejs.ru'

// netlify envs
const deployURL = process.env.DEPLOY_PRIME_URL || 'main'
const commitRef = process.env.COMMIT_REF?.slice(0, 8) || 'dev'

const deployType = (() => {
  switch (deployURL) {
    case 'https://vitejs.ru':
      return 'main'
    case '':
      return 'local'
    default:
      return 'release'
  }
})()
const additionalTitle = ((): string => {
  switch (deployType) {
    case 'main':
      return ' (main branch)'
    case 'local':
      return ' (local)'
    case 'release':
      return ''
  }
})()
const versionLinks = ((): DefaultTheme.NavItemWithLink[] => {
  const oldVersions: DefaultTheme.NavItemWithLink[] = [
    {
      text: 'Документация Vite 5',
      link: 'https://v5.vitejs.ru',
    },
    {
      text: 'Документация Vite 4',
      link: 'https://v4.vitejs.ru',
    },
    {
      text: 'Документация Vite 3',
      link: 'https://v3.vitejs.ru',
    },
    {
      text: 'Документация Vite 2',
      link: 'https://v2.vite.dev',
    },
  ]

  switch (deployType) {
    case 'main':
    case 'local':
      return [
        {
          text: 'Документация Vite 6 (релиз)',
          link: 'https://vitejs.ru',
        },
        ...oldVersions,
      ]
    case 'release':
      return oldVersions
  }
})()

export default defineConfig({
  lang: 'ru',
  title: `Vite${additionalTitle}`,
  description: 'Интерфейсные инструменты нового поколения',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    [
      'link',
      { rel: 'alternate', type: 'application/rss+xml', href: '/blog.rss' },
    ],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'true',
      },
    ],
    [
      'link',
      {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600&family=IBM+Plex+Mono:wght@400&display=swap',
        as: 'style',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600&family=IBM+Plex+Mono:wght@400&display=swap',
      },
    ],
    ['link', { rel: 'me', href: 'https://m.webtoo.ls/@vite' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { property: 'og:site_name', content: 'vitejs' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@vite_js' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'CBDFBSLI',
        'data-spa': 'auto',
        defer: '',
      },
    ],
    [
      'script',
      { type: 'text/javascript' },
      '(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}) (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym"); ym(89402826, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });',
    ],
    [
      'noscript',
      {},
      '<div><img src="https://mc.yandex.ru/watch/89402826" style="position:absolute; left:-9999px;" alt="" /></div>',
    ],
  ],

  locales: {
    root: { label: 'Русский' },
    en: { label: 'English', link: 'https://vitejs.dev' },
    zh: { label: '简体中文', link: 'https://cn.vite.dev' },
    ja: { label: '日本語', link: 'https://ja.vite.dev' },
    es: { label: 'Español', link: 'https://es.vite.dev' },
    pt: { label: 'Português', link: 'https://pt.vite.dev' },
    ko: { label: '한국어', link: 'https://ko.vite.dev' },
    de: { label: 'Deutsch', link: 'https://de.vite.dev' },
  },

  themeConfig: {
    logo: '/logo.svg',

    outlineTitle: 'На этой странице',

    editLink: {
      pattern: 'https://github.com/ruVue/vite/edit/main-ru/docs/:path',
      text: 'Предложить изменения на этой странице',
    },

    socialLinks: [
      { icon: 'bluesky', link: 'https://bsky.app/profile/vite.dev' },
      { icon: 'mastodon', link: 'https://elk.zone/m.webtoo.ls/@vite' },
      { icon: 'x', link: 'https://x.com/vite_js' },
      { icon: 'discord', link: 'https://chat.vite.dev' },
      { icon: 'github', link: 'https://github.com/vitejs/vite' },
    ],

    algolia: {
      appId: '7H67QR5P0A',
      apiKey: '208bb9c14574939326032b937431014b',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:ru'],
      },
    },

    footer: {
      message: `Выпущено под лицензией MIT. (${commitRef})`,
      copyright: 'Авторские права © 2019-настоящее время VoidZero Inc. и участники Vite',
    },

    nav: [
      { text: 'Руководство', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Конфигурация', link: '/config/', activeMatch: '/config/' },
      { text: 'Плагины', link: '/plugins/', activeMatch: '/plugins/' },
      {
        text: 'Ресурсы',
        items: [
          { text: 'Команда', link: '/team' },
          { text: 'Блог', link: '/blog' },
          { text: 'Релизы', link: '/releases' },
          {
            items: [
              {
                text: 'Bluesky',
                link: 'https://bsky.app/profile/vite.dev',
              },
              {
                text: 'Mastodon',
                link: 'https://elk.zone/m.webtoo.ls/@vite',
              },
              {
                text: 'X',
                link: 'https://x.com/vite_js',
              },
              {
                text: 'Чат в Discord',
                link: 'https://chat.vite.dev',
              },
              {
                text: 'Awesome Vite',
                link: 'https://github.com/vitejs/awesome-vite',
              },
              {
                text: 'ViteConf',
                link: 'https://viteconf.org',
              },
              {
                text: 'Сообщество разработчиков',
                link: 'https://dev.to/t/vite',
              },
              {
                text: 'Журнал изменений',
                link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
              },
              {
                text: 'Contributing',
                link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
              },
            ],
          },
        ],
      },
      {
        text: 'Версия',
        items: versionLinks,
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Руководство',
          items: [
            {
              text: 'Почему Vite',
              link: '/guide/why',
            },
            {
              text: 'Начало работы',
              link: '/guide/',
            },
            {
              text: 'Возможности',
              link: '/guide/features',
            },
            {
              text: 'CLI',
              link: '/guide/cli',
            },
            {
              text: 'Использование плагинов',
              link: '/guide/using-plugins',
            },
            {
              text: 'Предварительное связывание зависимостей',
              link: '/guide/dep-pre-bundling',
            },
            {
              text: 'Обработка статических ресурсов',
              link: '/guide/assets',
            },
            {
              text: 'Сборка для продакшена',
              link: '/guide/build',
            },
            {
              text: 'Деплой статического сайта',
              link: '/guide/static-deploy',
            },
            {
              text: 'Переменные окружения и режимы',
              link: '/guide/env-and-mode',
            },
            {
              text: 'Рендеринг на стороне сервера (SSR)',
              link: '/guide/ssr',
            },
            {
              text: 'Бэкэнд-интеграция',
              link: '/guide/backend-integration',
            },
            {
              text: 'Сравнения',
              link: '/guide/comparisons',
            },
            {
              text: 'Устранение неполадок',
              link: '/guide/troubleshooting',
            },
            {
              text: 'Производительность',
              link: '/guide/performance',
            },
            {
              text: 'Философия',
              link: '/guide/philosophy',
            },
            {
              text: 'Миграция с v5',
              link: '/guide/migration',
            },
            {
              text: 'Breaking Changes',
              link: '/changes/',
            },
          ],
        },
        {
          text: 'APIs',
          items: [
            {
              text: 'Плагин API',
              link: '/guide/api-plugin',
            },
            {
              text: 'HMR API',
              link: '/guide/api-hmr',
            },
            {
              text: 'JavaScript API',
              link: '/guide/api-javascript',
            },
            {
              text: 'Справочник по конфигурации',
              link: '/config/',
            },
          ],
        },
        {
          text: 'Environment API',
          items: [
            {
              text: 'Introduction',
              link: '/guide/api-environment',
            },
            {
              text: 'Environment instances',
              link: '/guide/api-environment-instances',
            },
            {
              text: 'Plugins',
              link: '/guide/api-environment-plugins',
            },
            {
              text: 'Frameworks',
              link: '/guide/api-environment-frameworks',
            },
            {
              text: 'Runtimes',
              link: '/guide/api-environment-runtimes',
            },
          ],
        },
      ],
      '/config/': [
        {
          text: 'Конфиг',
          items: [
            {
              text: 'Настройка Vite',
              link: '/config/',
            },
            {
              text: 'Опции Shared',
              link: '/config/shared-options',
            },
            {
              text: 'Опции Server',
              link: '/config/server-options',
            },
            {
              text: 'Опции Build',
              link: '/config/build-options',
            },
            {
              text: 'Опции Preview',
              link: '/config/preview-options',
            },
            {
              text: 'Опции Dep Optimization',
              link: '/config/dep-optimization-options',
            },
            {
              text: 'Опции SSR',
              link: '/config/ssr-options',
            },
            {
              text: 'Опции Worker',
              link: '/config/worker-options',
            },
          ],
        },
      ],
      '/changes/': [
        {
          text: 'Breaking Changes',
          link: '/changes/',
        },
        {
          text: 'Current',
          items: [],
        },
        {
          text: 'Future',
          items: [
            {
              text: 'this.environment in Hooks',
              link: '/changes/this-environment-in-hooks',
            },
            {
              text: 'HMR hotUpdate Plugin Hook',
              link: '/changes/hotupdate-hook',
            },
            {
              text: 'Move to per-environment APIs',
              link: '/changes/per-environment-apis',
            },
            {
              text: 'SSR using ModuleRunner API',
              link: '/changes/ssr-using-modulerunner',
            },
            {
              text: 'Shared plugins during build',
              link: '/changes/shared-plugins-during-build',
            },
          ],
        },
        {
          text: 'Past',
          items: [],
        },
      ],
    },

    outline: {
      level: [2, 3],
    },
  },
  transformPageData(pageData) {
    const canonicalUrl = `${ogUrl}/${pageData.relativePath}`
      .replace(/\/index\.md$/, '/')
      .replace(/\.md$/, '/')
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.unshift(
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { property: 'og:title', content: pageData.title }],
    )
    return pageData
  },
  markdown: {
    codeTransformers: [transformerTwoslash()],
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          firebase: 'vscode-icons:file-type-firebase',
          '.gitlab-ci.yml': 'vscode-icons:file-type-gitlab',
        },
      }),
    ],
    optimizeDeps: {
      include: [
        '@shikijs/vitepress-twoslash/client',
        'gsap',
        'gsap/dist/ScrollTrigger',
        'gsap/dist/MotionPathPlugin',
      ],
    },
  },
  buildEnd,
})
