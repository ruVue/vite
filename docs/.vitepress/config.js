// @ts-check

/**
 * @type {import('vitepress').UserConfig}
 */
module.exports = {
  title: 'Vite',
  description: 'Интерфейсные инструменты нового поколения',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ["script", { type: "text/javascript" }, '(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}) (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym"); ym(89402826, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });'],
    ["noscript", {}, '<div><img src="https://mc.yandex.ru/watch/89402826" style="position:absolute; left:-9999px;" alt="" /></div>'],
  ],
  vue: {
    reactivityTransform: true
  },
  themeConfig: {
    repo: 'w3ref/vite',
    logo: '/logo.svg',
    docsDir: 'docs',
    docsBranch: 'main-ru',
    editLinks: true,
    editLinkText: 'Предложить изменения на этой странице',

    algolia: {
      apiKey: 'b573aa848fd57fb47d693b531297403c',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en']
      }
    },

    // carbonAds: {
    //   carbon: 'CEBIEK3N',
    //   placement: 'vitejsdev'
    // },

    nav: [
      { text: 'Руководство', link: '/guide/' },
      { text: 'Конфигурация', link: '/config/' },
      { text: 'Плагины', link: '/plugins/' },
      {
        text: 'Ссылки',
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
      },
      {
        text: 'Языки',
        items: [
          {
            text: 'English',
            link: 'https://vitejs.dev'
          },
          {
            text: 'Русский',
            link: 'https://vitejs.ru'
          },
          {
            text: '简体中文',
            link: 'https://cn.vitejs.dev'
          },
          {
            text: '日本語',
            link: 'https://ja.vitejs.dev'
          }
        ]
      }
    ],

    sidebar: {
      '/config/': 'auto',
      '/plugins': 'auto',
      // catch-all fallback
      '/': [
        {
          text: 'Руководство',
          children: [
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
              text: 'Развертывание статического сайта',
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
              text: 'Миграция с v1',
              link: '/guide/migration'
            }
          ]
        },
        {
          text: 'APIs',
          children: [
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
      ]
    }
  }
}
