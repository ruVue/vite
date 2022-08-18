import { defineConfig, DefaultTheme } from 'vitepress'

const ogDescription = 'Интерфейсные инструменты нового поколения'
const ogImage = 'https://vitejs.ru/og-image.png'
const ogTitle = 'Vite'
const ogUrl = 'https://vitejs.ru'

// netlify envs
const deployURL = process.env.DEPLOY_PRIME_URL || ''
const commitRef = process.env.COMMIT_REF?.slice(0, 8) || 'dev'

const deployType = (() => {
  switch (deployURL) {
    case 'https://vitejs-ru.netlify.app':
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
  switch (deployType) {
    case 'main':
    case 'local':
      return [
        {
          text: 'Vite 3 Документация (релиз)',
          link: 'https://vitejs.ru'
        },
        {
          text: 'Vite 2 Документация',
          link: 'https://v2.vitejs.ru'
        }
      ]
    case 'release':
      return [
        {
          text: 'Vite 2 Документация',
          link: 'https://v2.vitejs.ru'
        }
      ]
  }
})()

export default defineConfig({
  title: `Vite${additionalTitle}`,
  description: 'Интерфейсные инструменты нового поколения',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@vite_js' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    [
      'script',
      { type: 'text/javascript' },
      '(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}) (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym"); ym(89402826, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });'
    ],
    [
      'noscript',
      {},
      '<div><img src="https://mc.yandex.ru/watch/89402826" style="position:absolute; left:-9999px;" alt="" /></div>'
    ]
  ],

  vue: {
    reactivityTransform: true
  },

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/ruVue/vite/edit/main-ru/docs/:path',
      text: 'Предложить изменения на этой странице'
    },

    socialLinks: [
      { icon: 'twitter', link: 'https://twitter.com/vite_js' },
      { icon: 'discord', link: 'https://chat.vitejs.dev' },
      { icon: 'github', link: 'https://github.com/ruVue/vite' }
    ],

    algolia: {
      appId: '7H67QR5P0A',
      apiKey: 'deaab78bcdfe96b599497d25acc6460e',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:ru']
      }
    },

    localeLinks: {
      text: 'Русский',
      items: [{ text: 'English', link: 'https://vitejs.dev' }]
    },

    footer: {
      message: `Выпущено под лицензией MIT. (${commitRef})`,
      copyright:
        'Copyright © 2019-настоящее время Evan You и Vite контрибьюторам'
    },

    nav: [
      { text: 'Руководство', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Конфигурация', link: '/config/', activeMatch: '/config/' },
      { text: 'Плагины', link: '/plugins/', activeMatch: '/plugins/' },
      {
        text: 'Ресурсы',
        items: [
          { text: 'Команда', link: '/team' },
          {
            items: [
              {
                text: 'Twitter',
                link: 'https://twitter.com/vite_js'
              },
              {
                text: 'Discord Chat',
                link: 'https://chat.vitejs.dev'
              },
              {
                text: 'Awesome Vite',
                link: 'https://github.com/vitejs/awesome-vite'
              },
              {
                text: 'DEV Community',
                link: 'https://dev.to/t/vite'
              },
              {
                text: 'Rollup Plugins Compat',
                link: 'https://vite-rollup-plugins.patak.dev/'
              },
              {
                text: 'Changelog',
                link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md'
              }
            ]
          }
        ]
      },
      {
        text: 'Версия',
        items: versionLinks
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Руководство',
          items: [
            {
              text: 'Почему Vite',
              link: '/guide/why'
            },
            {
              text: 'Начало работы',
              link: '/guide/'
            },
            {
              text: 'Возможности',
              link: '/guide/features'
            },
            {
              text: 'Использование плагинов',
              link: '/guide/using-plugins'
            },
            {
              text: 'Предварительное связывание зависимостей',
              link: '/guide/dep-pre-bundling'
            },
            {
              text: 'Обработка статических ресурсов',
              link: '/guide/assets'
            },
            {
              text: 'Сборка для продакшена',
              link: '/guide/build'
            },
            {
              text: 'Деплой статического сайта',
              link: '/guide/static-deploy'
            },
            {
              text: 'Переменные окружения и режимы',
              link: '/guide/env-and-mode'
            },
            {
              text: 'Рендеринг на стороне сервера (SSR)',
              link: '/guide/ssr'
            },
            {
              text: 'Бэкэнд-интеграция',
              link: '/guide/backend-integration'
            },
            {
              text: 'Сравнения',
              link: '/guide/comparisons'
            },
            {
              text: 'Устранение неполадок',
              link: '/guide/troubleshooting'
            },
            {
              text: 'Миграция с v2',
              link: '/guide/migration'
            }
          ]
        },
        {
          text: 'APIs',
          items: [
            {
              text: 'Plugin API',
              link: '/guide/api-plugin'
            },
            {
              text: 'HMR API',
              link: '/guide/api-hmr'
            },
            {
              text: 'JavaScript API',
              link: '/guide/api-javascript'
            },
            {
              text: 'Config Reference',
              link: '/config/'
            }
          ]
        }
      ],
      '/config/': [
        {
          text: 'Config',
          items: [
            {
              text: 'Configuring Vite',
              link: '/config/'
            },
            {
              text: 'Shared Options',
              link: '/config/shared-options'
            },
            {
              text: 'Server Options',
              link: '/config/server-options'
            },
            {
              text: 'Build Options',
              link: '/config/build-options'
            },
            {
              text: 'Preview Options',
              link: '/config/preview-options'
            },
            {
              text: 'Dep Optimization Options',
              link: '/config/dep-optimization-options'
            },
            {
              text: 'SSR Options',
              link: '/config/ssr-options'
            },
            {
              text: 'Worker Options',
              link: '/config/worker-options'
            }
          ]
        }
      ]
    }
  }
})
