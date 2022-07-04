# Рендеринг на стороне сервера

:::warning Экспериментально
Поддержка SSR все еще является экспериментальной, и вы можете столкнуться с ошибками и неподдерживаемыми вариантами использования. Действуйте на свой страх и риск.
:::

:::tip Примечание
SSR конкретно относится к интерфейсным платформам (например, React, Preact, Vue и Svelte), которые поддерживают запуск одного и того же приложения в Node.js, предварительный рендеринг его в HTML и, наконец, его гидратацию на клиенте. Если вам нужна интеграция с традиционными серверными фреймворками, ознакомьтесь с [Руководством по интеграции с серверной частью](./backend-integration).

В следующем руководстве также предполагается, что у вас есть опыт работы с SSR в выбранной вами среде, и оно будет сосредоточено только на деталях интеграции, специфичных для Vite.
:::

:::warning API низкого уровня
Это низкоуровневый API, предназначенный для авторов библиотек и фреймворков. Если ваша цель — создать приложение, обязательно сначала ознакомьтесь с плагинами и инструментами SSR более высокого уровня в [разделе Awesome Vite SSR](https://github.com/vitejs/awesome-vite#ssr). Тем не менее, многие приложения успешно создаются непосредственно поверх собственного низкоуровневого API Vite.
:::

:::tip Помощь
Если у вас есть вопросы, сообщество обычно помогает на [канале Vite Discord #ssr](https://discord.gg/PkbxgzPhJv).
:::

## Примеры проектов

Vite предоставляет встроенную поддержку рендеринга на стороне сервера (SSR). Игровая площадка Vite содержит примеры настроек SSR для Vue 3 и React, которые можно использовать в качестве справочных материалов для этого руководства:

- [Vue 3](https://github.com/vitejs/vite/tree/v2/packages/playground/ssr-vue)
- [React](https://github.com/vitejs/vite/tree/v2/packages/playground/ssr-react)

## Исходная структура

Типичное приложение SSR будет иметь следующую структуру исходного файла:

```
- index.html
- server.js # main application server
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

`index.html` должен будет ссылаться на `entry-client.js` и включать заполнитель, где должна быть введена разметка, отображаемая сервером:

```html
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

Вы можете использовать любой заполнитель вместо `<!--ssr-outlet-->`, если его можно точно заменить.

## Условная логика

Если вам нужно выполнить условную логику на основе SSR и клиента, вы можете использовать

```js
if (import.meta.env.SSR) {
  // ... server only logic
}
```

Это статически заменяется во время сборки, поэтому это позволяет tree-shaking неиспользуемых branches.

## Настройка сервера разработки

При создании приложения SSR вы, вероятно, захотите иметь полный контроль над своим основным сервером и отделить Vite от производственной среды. Поэтому рекомендуется использовать Vite в режиме мидлвара. Вот пример с [express](https://expressjs.com/):

**server.js**

```js{17-19}
const fs = require('fs')
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode. This disables Vite's own HTML
  // serving logic and let the parent server take control.
  //
  // In middleware mode, if you want to use Vite's own HTML serving logic
  // use `'html'` as the `middlewareMode` (ref https://vitejs.dev/config/#server-middlewaremode)
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' }
  })
  // use vite's connect instance as middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(3000)
}

createServer()
```

Здесь `vite` — это экземпляр [ViteDevServer](./api-javascript#vitedevserver). `vite.middlewares` — это экземпляр [Connect](https://github.com/senchalabs/connect), который можно использовать в качестве мидлвара в любой совместимой с Connect инфраструктуре Node.js.

Следующим шагом является реализация обработчика `*` для обслуживания отображаемого сервером HTML:

```js
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. Read index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8'
    )

    // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
    //    also applies HTML transforms from Vite plugins, e.g. global preambles
    //    from @vitejs/plugin-react
    template = await vite.transformIndexHtml(url, template)

    // 3. Load the server entry. vite.ssrLoadModule automatically transforms
    //    your ESM source code to be usable in Node.js! There is no bundling
    //    required, and provides efficient invalidation similar to HMR.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. render the app HTML. This assumes entry-server.js's exported `render`
    //    function calls appropriate framework SSR APIs,
    //    e.g. ReactDOMServer.renderToString()
    const appHtml = await render(url)

    // 5. Inject the app-rendered HTML into the template.
    const html = template.replace(`<!--ssr-outlet-->`, appHtml)

    // 6. Send the rendered HTML back.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // If an error is caught, let Vite fix the stracktrace so it maps back to
    // your actual source code.
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
2. Создайте сборку SSR, которую можно напрямую загрузить с помощью `require()`, чтобы нам не приходилось проходить через Vite `ssrLoadModule`;

Наши скрипты в `package.json` будут выглядеть так:

```json
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js "
  }
}
```

Обратите внимание на флаг `--ssr`, который указывает, что это сборка SSR. Также следует указать запись SSR.

Затем в `server.js` нам нужно добавить некоторую производственную логику, проверив `process.env.NODE_ENV`:

- Вместо того, чтобы читать корень `index.html`, используйте `dist/client/index.html` в качестве шаблона, так как он содержит правильные ссылки ресурсов на сборку клиента.

- Вместо `await vite.ssrLoadModule('/src/entry-server.js')`, используйте `require('./dist/server/entry-server.js')` (этот файл является результатом Сборка SSR).

- Переместите создание и все использование сервера разработки `vite` за условные ветки только для разработки, затем добавьте мидлвар для обслуживания статических файлов для обслуживания файлов из `dist/client`.

Смотрите [Vue](https://github.com/vitejs/vite/tree/v2/packages/playground/ssr-vue) и [React](https://github.com/vitejs/vite/tree/v2/packages/playground/ssr-react) демонстрации для рабочей установки.

## Создание директив предварительной загрузки

`vite build` поддерживает флаг `--ssrManifest`, который будет генерировать `ssr-manifest.json` в выходном каталоге сборки:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

Приведенный выше скрипт теперь сгенерирует `dist/client/ssr-manifest.json` для сборки клиента (да, манифест SSR создается из сборки клиента, потому что мы хотим сопоставить идентификаторы модулей с файлами клиента). Манифест содержит сопоставления идентификаторов модулей с соответствующими фрагментами и файлами активов.

Чтобы использовать манифест, фреймворки должны предоставить способ сбора идентификаторов модулей компонентов, которые использовались во время вызова рендеринга сервера.

`@vitejs/plugin-vue` поддерживает это из коробки и автоматически регистрирует используемые идентификаторы модулей компонентов в связанном контексте Vue SSR:

```js
// src/entry-server.js
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules is now a Set of module IDs that were used during the render
```

В продакшен ветке `server.js` нам нужно прочитать и передать манифест функции `render`, экспортируемой `src/entry-server.js`. Это даст нам достаточно информации для рендеринга директив предварительной загрузки для файлов, используемых асинхронными маршрутами! Полный пример смотрите в [источнике демо](https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/src/entry-server.js).

## Предварительный рендеринг / SSG

Если маршруты и данные, необходимые для определенных маршрутов, известны заранее, мы можем предварительно преобразовать эти маршруты в статический HTML, используя ту же логику, что и производственная SSR. Это также можно рассматривать как форму создания статических сайтов (SSG). Смотрите [демонстрационный сценарий предварительного рендеринга](https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/prerender.js) для рабочего примера.

## Внешний SSR

Многие зависимости содержат как файлы ESM, так и файлы CommonJS. При запуске SSR зависимость, которая обеспечивает сборки CommonJS, может быть «экстернализирована» из системы преобразования/модуля SSR Vite, чтобы ускорить как разработку, так и сборку. Например, вместо того, чтобы использовать предустановленную ESM-версию React, а затем преобразовывать ее обратно, чтобы она была совместима с Node.js, более эффективно вместо этого просто `require('react')`. Это также значительно повышает скорость сборки пакета SSR.

Vite выполняет автоматическую экстернализацию SSR на основе следующих эвристик:

- Если разрешенная точка входа ESM зависимости и ее точка входа Node по умолчанию отличаются, ее запись Node по умолчанию, вероятно, является сборкой CommonJS, которую можно экстернализовать. Например, `vue` будет автоматически экстернализирован, потому что он поставляется как с ESM, так и с CommonJS.

- В противном случае Vite проверит, содержит ли точка входа пакета действительный синтаксис ESM — если нет, пакет, скорее всего, является CommonJS и будет экстернализован. Например, `react-dom` будет автоматически экстернализован, потому что он указывает только одну запись в формате CommonJS.

Если эта эвристика приводит к ошибкам, вы можете вручную настроить внешние SSR, используя параметры конфигурации `ssr.external` и `ssr.noExternal`.

В будущем эта эвристика, вероятно, улучшится, чтобы определить, включен ли в проекте тип `type: "module"`, чтобы Vite также мог экстернализовать зависимости, которые доставляют Node-совместимые сборки ESM, импортируя их через динамический `import()` во время SSR.

:::warning Работа с псевдонимами
Если вы настроили псевдонимы, которые перенаправляют один пакет на другой, вы можете вместо этого использовать псевдонимы для фактических пакетов `node_modules`, чтобы он работал для внешних зависимостей SSR. И [Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias), и [pnpm](https://pnpm.js.org/en/aliases) поддерживают псевдонимы через префикс `npm:`.
:::

## Логика плагина, специфичная для SSR

Некоторые фреймворки, такие как Vue или Svelte, компилируют компоненты в разные форматы в зависимости от клиента и SSR. Для поддержки условных преобразований Vite передает дополнительное свойство `ssr` в объект `options` следующих хуков плагина:

- `resolveId`
- `load`
- `transform`

**Example:**

```js
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // perform ssr-specific transform...
      }
    }
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
