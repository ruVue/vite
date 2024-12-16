# Рендеринг на стороне сервера

:::tip Примечание
SSR конкретно относится к интерфейсным платформам (например, React, Preact, Vue и Svelte), которые поддерживают запуск одного и того же приложения в Node.js, предварительный рендеринг его в HTML и, наконец, его гидратацию на клиенте. Если вам нужна интеграция с традиционными серверными фреймворками, ознакомьтесь с [Руководством по интеграции с серверной частью](./backend-integration).

В следующем руководстве также предполагается, что у вас есть опыт работы с SSR в выбранной вами среде, и оно будет сосредоточено только на деталях интеграции, специфичных для Vite.
:::

:::warning API низкого уровня
Это низкоуровневый API, предназначенный для авторов библиотек и фреймворков. Если ваша цель — создать приложение, обязательно сначала ознакомьтесь с плагинами и инструментами SSR более высокого уровня в [разделе Awesome Vite SSR](https://github.com/vitejs/awesome-vite#ssr). Тем не менее, многие приложения успешно создаются непосредственно поверх собственного низкоуровневого API Vite.

В настоящее время Vite работает над улучшенным API SSR с [Environment API](https://github.com/vitejs/vite/discussions/16358). Ознакомьтесь со ссылкой для получения более подробной информации.
:::

:::tip Помощь
Если у вас есть вопросы, сообщество обычно помогает на [канале Vite Discord #ssr](https://discord.gg/PkbxgzPhJv).
:::

## Примеры проектов

Vite предоставляет встроенную поддержку рендеринга на стороне сервера (SSR). [`create-vite-extra`](https://github.com/bluwy/create-vite-extra) содержит примеры настроек SSR, которые вы можете использовать в качестве ссылок для этого руководства:

- [Vanilla](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vanilla)
- [Vue](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue)
- [React](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react)
- [Preact](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-preact)
- [Svelte](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-svelte)
- [Solid](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-solid)

You can also scaffold these projects locally by [running `create-vite`](./index.md#scaffolding-your-first-vite-project) and choose `Others > create-vite-extra` under the framework option.

## Исходная структура

Типичное приложение SSR будет иметь следующую структуру исходного файла:

```
- index.html
- server.js # главный сервер приложений
- src/
  - main.js          # экспортирует код приложения, независимый от env (универсальный)
  - entry-client.js  # монтирует приложение к элементу DOM
  - entry-server.js  # визуализирует приложение с помощью API SSR платформы
```

`index.html` должен будет ссылаться на `entry-client.js` и включать заполнитель, где должна быть введена разметка, отображаемая сервером:

```html
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

Вы можете использовать любой заполнитель вместо `<!--ssr-outlet-->`, если его можно точно заменить.

## Условная логика

Если вам нужно выполнить условную логику на основе SSR и клиента, вы можете использовать

```js twoslash
import 'vite/client'
// ---cut---
if (import.meta.env.SSR) {
  // ... server only logic
}
```

Это статически заменяется во время сборки, поэтому это позволяет tree-shaking неиспользуемых branches.

## Настройка сервера разработки

При создании приложения SSR вы, вероятно, захотите иметь полный контроль над своим основным сервером и отделить Vite от производственной среды. Поэтому рекомендуется использовать Vite в режиме мидлвара. Вот пример с [express](https://expressjs.com/):

**server.js**

```js{15-18} twoslash
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(5173)
}

createServer()
```

Здесь `vite` — это экземпляр [ViteDevServer](./api-javascript#vitedevserver). `vite.middlewares` — это экземпляр [Connect](https://github.com/senchalabs/connect), который можно использовать в качестве мидлвара в любой совместимой с Connect инфраструктуре Node.js.

Следующим шагом является реализация обработчика `*` для обслуживания отображаемого сервером HTML:

```js twoslash
// @noErrors
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('express').Express} */
var app
/** @type {import('vite').ViteDevServer}  */
var vite

// ---cut---
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. Read index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8',
    )

    // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
    //    and also applies HTML transforms from Vite plugins, e.g. global
    //    preambles from @vitejs/plugin-react
    template = await vite.transformIndexHtml(url, template)

    // 3. Load the server entry. ssrLoadModule automatically transforms
    //    ESM source code to be usable in Node.js! There is no bundling
    //    required, and provides efficient invalidation similar to HMR.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. render the app HTML. This assumes entry-server.js's exported
    //     `render` function calls appropriate framework SSR APIs,
    //    e.g. ReactDOMServer.renderToString()
    const appHtml = await render(url)

    // 5. Inject the app-rendered HTML into the template.
    const html = template.replace(`<!--ssr-outlet-->`, appHtml)

    // 6. Send the rendered HTML back.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // If an error is caught, let Vite fix the stack trace so it maps back
    // to your actual source code.
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

Сценарий `dev` в `package.json` также следует изменить, чтобы вместо него использовался сценарий сервера:

```diff
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## Сборка для продакшена

Чтобы отправить проект SSR в производство, нам необходимо:

1. Произведите сборку клиента как обычно;
2. Создайте сборку SSR, которую можно напрямую загрузить через `import()`, чтобы нам не приходилось проходить через Vite `ssrLoadModule`;

Наши скрипты в `package.json` будут выглядеть так:

```json
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

Обратите внимание на флаг `--ssr`, который указывает, что это сборка SSR. Также следует указать запись SSR.

Затем в `server.js` нам нужно добавить некоторую логику, специфичную для продакшена, проверив `process.env.NODE_ENV`:

- Вместо чтения корневого `index.html` используйте `dist/client/index.html` в качестве шаблона, так как он содержит правильные ссылки на ресурсы для сборки клиента.

- Вместо `await vite.ssrLoadModule('/src/entry-server.js')` используйте `import('./dist/server/entry-server.js')` (этот файл является результатом сборки SSR).

- Переместите создание и все использование сервера разработки `vite` за условные ветки только для разработки, затем добавьте мидлвар для обслуживания статических файлов для обслуживания файлов из `dist/client`.

Смотрите [примеры проектов](#example-projects) для рабочей настройки.

## Создание директив предварительной загрузки

`vite build` поддерживает флаг `--ssrManifest`, который будет генерировать `.vite/ssr-manifest.json` в выходном каталоге сборки:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

Приведенный выше сценарий теперь сгенерирует `dist/client/.vite/ssr-manifest.json` для сборки клиента (да, манифест SSR генерируется из сборки клиента, поскольку мы хотим сопоставить идентификаторы модулей с файлами клиента). Манифест содержит сопоставления идентификаторов модулей с соответствующими фрагментами и файлами ресурсов.

Чтобы использовать манифест, фреймворки должны предоставить способ сбора идентификаторов модулей компонентов, которые использовались во время вызова рендеринга сервера.

`@vitejs/plugin-vue` поддерживает это из коробки и автоматически регистрирует используемые идентификаторы модулей компонентов в связанном контексте Vue SSR:

```js
// src/entry-server.js
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules is now a Set of module IDs that were used during the render
```

В продакшен ветке `server.js` нам нужно прочитать и передать манифест функции `render`, экспортируемой `src/entry-server.js`. Это предоставит нам достаточно информации для отображения директив предварительной загрузки для файлов, используемых асинхронными маршрутами! Полный пример см. в [источнике демонстрационной версии](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/src/entry-server.js). Вы также можете использовать эту информацию для [103 Early Hints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103).

## Предварительный рендеринг / SSG

Если маршруты и данные, необходимые для определенных маршрутов, известны заранее, мы можем предварительно преобразовать эти маршруты в статический HTML, используя ту же логику, что и производственная SSR. Это также можно рассматривать как форму создания статических сайтов (SSG). Смотрите [демонстрационный скрипт предварительного рендеринга](https://github.com/vitejs/vite/blob/main/playground/ssr-vue/prerender.js) для рабочего примера.

## Внешний SSR

Зависимости «экстернализуются» из системы модулей преобразования Vite SSR по умолчанию при запуске SSR. Это ускоряет как разработку, так и сборку.

Если зависимость должна быть преобразована конвейером Vite, например, потому что функции Vite используются в них нетранспилированными, их можно добавить в [`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal).

Для связанных зависимостей они по умолчанию не экстернализуются, чтобы использовать преимущества HMR Vite. Если это нежелательно, например, для проверки зависимостей, как если бы они не были связаны, вы можете добавить его в [`ssr.external`](../config/ssr-options.md#ssr-external).

:::warning Работа с псевдонимами
Если вы настроили псевдонимы, которые перенаправляют один пакет на другой, вы можете вместо этого использовать псевдонимы фактических пакетов `node_modules`, чтобы они работали для внешних зависимостей SSR. Оба [Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) и [pnpm](https://pnpm.io/aliases/) поддерживают псевдонимы через префикс `npm:`.
:::

## Логика плагина, специфичная для SSR

Некоторые фреймворки, такие как Vue или Svelte, компилируют компоненты в разные форматы в зависимости от клиента и SSR. Для поддержки условных преобразований Vite передает дополнительное свойство `ssr` в объект `options` следующих хуков плагина:

- `resolveId`
- `load`
- `transform`

**Пример:**

```js twoslash
/** @type {() => import('vite').Plugin} */
// ---cut---
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // perform ssr-specific transform...
      }
    },
  }
}
```

Объект параметров в `load` и `transform` является необязательным, в настоящее время накопительный пакет не использует этот объект, но может расширить эти хуки дополнительными метаданными в будущем.

:::tip Примечание
До Vite 2.7 об этом сообщалось обработчикам плагинов с позиционным параметром `ssr` вместо использования объекта `options`. Все основные фреймворки и плагины обновлены, но вы можете найти устаревшие сообщения, используя предыдущий API.
:::

## Цель SSR

Целью по умолчанию для сборки SSR является среда узла, но вы также можете запустить сервер в веб-воркере. Разрешение входа пакетов отличается для каждой платформы. Вы можете настроить цель как Web Worker, используя для `ssr.target` значение `'webworker'`.

## SSR бандл

В некоторых случаях, таких как среды выполнения `webworker`, вы можете захотеть объединить сборку SSR в один файл JavaScript. Вы можете включить это поведение, установив для `ssr.noExternal` значение `true`. Это сделает две вещи:

- Рассматривать все зависимости как `noExternal`
- Выдавать ошибку, если какие-либо встроенные модули Node.js импортированы

## Условия решения SSR

По умолчанию разрешение записи пакета будет использовать условия, установленные в [`resolve.conditions`](../config/shared-options.md#resolve-conditions) для сборки SSR. Вы можете использовать [`ssr.resolve.conditions`](../config/ssr-options.md#ssr-resolve-conditions) и [`ssr.resolve.externalConditions`](../config/ssr-options.md#ssr-resolve-externalconditions), чтобы настроить это поведение.

## Vite CLI

Команды CLI `$ vite dev` и `$ vite preview` также можно использовать для приложений SSR. Вы можете добавить слой мидлваров SSR на сервер разработки с помощью [`configureServer`](/guide/api-plugin#configureserver) и на сервер предварительного просмотра с помощью [`configurePreviewServer`](/guide/api-plugin#configurepreviewserver).

:::tip Примечание
Используйте пост-хук, чтобы ваше мидлвар SSR запускал мидлвар _после_ Vite.
:::
