# Плагин API

Плагины Vite расширяют хорошо разработанный интерфейс плагинов Rollup несколькими дополнительными опциями, специфичными для Vite. В результате вы можете написать плагин Vite один раз, и он будет работать как для разработки, так и для сборки.

**Рекомендуется сначала просмотреть [документацию плагина Rollup](https://rollupjs.org/plugin-development/), прежде чем читать разделы ниже.**

## Создание плагина

Vite стремится предлагать установленные шаблоны из коробки, поэтому перед созданием нового плагина убедитесь, что вы проверили [Руководство по функциям](https://vitejs.ru/guide/features), чтобы убедиться, что ваши потребности удовлетворены. Также просмотрите доступные плагины сообщества, как в виде [совместимого плагина Rollup](https://github.com/rollup/awesome), так и [специальных плагинов Vite](https://github.com/vitejs/awesome-vite#plugins)

При создании плагина вы можете встроить его в свой `vite.config.js`. Для него не нужно создавать новый пакет. Как только вы увидите, что плагин был полезен в ваших проектах, рассмотрите возможность поделиться им, чтобы помочь другим [в экосистеме](https://chat.vitejs.dev).

::: tip
При изучении, отладке или создании плагинов мы рекомендуем включать [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) в ваш проект. Это позволяет вам проверять промежуточное состояние плагинов Vite. После установки вы можете посетить `localhost:5173/__inspect/`, чтобы проверить модули и стек преобразований вашего проекта. Ознакомьтесь с инструкциями по установке в [документации vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect).
![vite-plugin-inspect](/images/vite-plugin-inspect.png)
:::

## Соглашения

Если плагин не использует специальные перехватчики Vite и может быть реализован как [Совместимый плагин Rollup](#rollup-plugin-compatibility), то рекомендуется использовать [Соглашение об именах плагина Rollup](https://rollupjs.org/plugin-development/#conventions).

- Rollup плагины должны иметь четкое имя с префиксом `rollup-plugin-`.
- Включите ключевые слова `rollup-plugin` и `vite-plugin` в package.json.

Это позволяет использовать плагин в проектах на основе чистого Rollup или WMR.

Плагины только для Vite

- Vite плагины должны иметь четкое имя с префиксом `vite-plugin-`.
- Включите ключевые слова `vite-plugin` в package.json.
- Включите в документацию плагина раздел с подробным описанием того, почему это плагин только для Vite (например, он использует хуки плагинов, специфичные для Vite).

Если ваш плагин будет работать только для определенного фреймворка, его имя должно быть включено как часть префикса

- префикс `vite-plugin-vue-` для плагинов Vue
- префикс `vite-plugin-react-` для плагинов React
- префикс `vite-plugin-svelte-` для плагинов Svelte

Смотрите также [Соглашение о виртуальных модулях](#virtual-modules-convention).

## Конфигурация плагинов

Пользователи будут добавлять плагины в проект `devDependencies` и настраивать их с помощью опции массива `plugins`.

```js
// vite.config.js
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
})
```

Фальшивые плагины будут игнорироваться, что можно использовать для простой активации или деактивации плагинов.

`plugins` также принимают пресеты, включающие несколько плагинов, как один элемент. Это полезно для сложных функций (таких как интеграция с фреймворком), которые реализуются с помощью нескольких плагинов. Массив будет сплющен внутри.

```js
// framework-plugin
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()],
})
```

## Простые примеры

:::tip
Общепринято создавать плагин Vite/Rollup как фабричную функцию, которая возвращает фактический объект плагина. Функция может принимать параметры, которые позволяют пользователям настраивать поведение плагина.
:::

### Преобразование пользовательских типов файлов

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null, // provide source map if available
        }
      }
    },
  }
}
```

### Импорт виртуального файла

Смотрите пример в [следующем разделе](#virtual-modules-convention).

## Соглашение о виртуальных модулях

Виртуальные модули — полезная схема, позволяющая передавать информацию о времени сборки в исходные файлы с использованием обычного синтаксиса импорта ESM.

```js
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // required, will show up in warnings and errors
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

Что позволяет импортировать модуль в JavaScript:

```js
import { msg } from 'virtual:my-module'

console.log(msg)
```

Виртуальные модули в Vite (и Rollup) по соглашению имеют префикс `virtual:` для пути, обращенного к пользователю. Если возможно, имя плагина следует использовать в качестве пространства имен, чтобы избежать конфликтов с другими плагинами в экосистеме. Например, `vite-plugin-posts` может попросить пользователей импортировать виртуальные модули `virtual:posts` или `virtual:posts/helpers`, чтобы получить информацию о времени сборки. Внутренне плагины, использующие виртуальные модули, должны ставить перед идентификатором модуля префикс `\0` при разрешении идентификатора, что является соглашением экосистемы агрегирования. Это предотвращает попытки других плагинов обработать идентификатор (например, разрешение узла), а основные функции, такие как исходные карты, могут использовать эту информацию, чтобы различать виртуальные модули и обычные файлы. `\0` не является разрешенным символом в URL-адресах импорта, поэтому мы должны заменить их во время анализа импорта. Виртуальный идентификатор `\0{id}` в конечном итоге кодируется как `/@id/__x00__{id}` во время разработки в браузере. Идентификатор будет декодирован обратно перед входом в конвейер плагинов, поэтому он не виден коду хуков плагинов.

Обратите внимание, что модули, полученные непосредственно из реального файла, как в случае модуля сценария в компоненте с одним файлом (например, .vue или .svelte SFC), не обязаны следовать этому соглашению. SFC обычно генерируют набор подмодулей при обработке, но код в них может быть отображен обратно в файловую систему. Использование `\0` для этих подмодулей помешает корректной работе исходных карт.

## Универсальные крючки

Во время разработки сервер разработки Vite создает контейнер плагинов, который вызывает [Rollup Build Hooks](https://rollupjs.org/plugin-development/#build-hooks) так же, как это делает Rollup.

Следующие хуки вызываются один раз при запуске сервера:

- [`options`](https://rollupjs.org/plugin-development/#options)
- [`buildStart`](https://rollupjs.org/plugin-development/#buildstart)

Следующие хуки вызываются при каждом входящем запросе модуля:

- [`resolveId`](https://rollupjs.org/plugin-development/#resolveid)
- [`load`](https://rollupjs.org/plugin-development/#load)
- [`transform`](https://rollupjs.org/plugin-development/#transform)

These hooks also have an extended `options` parameter with additional Vite-specific properties. You can read more in the [SSR documentation](/guide/ssr#ssr-specific-plugin-logic).

Some `resolveId` calls' `importer` value may be an absolute path for a generic `index.html` at root as it's not always possible to derive the actual importer due to Vite's unbundled dev server pattern. For imports handled within Vite's resolve pipeline, the importer can be tracked during the import analysis phase, providing the correct `importer` value.

При закрытии сервера вызываются следующие хуки:

- [`buildEnd`](https://rollupjs.org/plugin-development/#buildend)
- [`closeBundle`](https://rollupjs.org/plugin-development/#closebundle)

Обратите внимание, что хук [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) **не** вызывается во время разработки, поскольку Vite избегает полного анализа AST для повышения производительности.

[Перехватчики генерации вывода](https://rollupjs.org/plugin-development/#output-generation-hooks) (кроме `closeBundle`) **не** вызываются во время разработки. Вы можете думать о сервере разработки Vite как о вызове `rollup.rollup()` без вызова `bundle.generate()`.

## Специальные крючки Vite

Плагины Vite также могут предоставлять хуки, которые служат конкретным целям Vite. Эти хуки игнорируются Rollup.

### `config`

- **Тип:** `(config: UserConfig, env: { mode: string, command: string }) => UserConfig | null | void`
- **Вид:** `async`, `sequential`

  Измените конфигурацию Vite, прежде чем она будет решена. Хук получает необработанную конфигурацию пользователя (параметры CLI объединены с файлом конфигурации) и текущую среду конфигурации, которая раскрывает используемые `mode` и `command`. Он может возвращать частичный объект конфигурации, который будет глубоко объединен с существующей конфигурацией, или напрямую изменять конфигурацию (если слияние по умолчанию не может дать желаемого результата).

  **Пример:**

  ```js
  // return partial config (recommended)
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      resolve: {
        alias: {
          foo: 'bar',
        },
      },
    }),
  })

  // mutate the config directly (use only when merging doesn't work)
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = 'foo'
      }
    },
  })
  ```

  ::: warning Примечание
  Пользовательские плагины разрешаются перед запуском этого хука, поэтому внедрение других плагинов внутри хука `config` не будет иметь никакого эффекта.
  :::

### `configResolved`

- **Тип:** `(config: ResolvedConfig) => void | Promise<void>`
- **Вид:** `async`, `parallel`

  Вызывается после разрешения конфигурации Vite. Используйте этот хук, чтобы прочитать и сохранить окончательный разрешенный конфиг. Это также полезно, когда плагину нужно сделать что-то другое в зависимости от выполняемой команды.

  **Пример:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // store the resolved config
        config = resolvedConfig
      },

      // use stored config in other hooks
      transform(code, id) {
        if (config.command === 'serve') {
          // dev: plugin invoked by dev server
        } else {
          // build: plugin invoked by Rollup
        }
      },
    }
  }
  ```

  Обратите внимание, что значение `command` равно `serve` в dev (в cli `vite`, `vite dev` и `vite serve` являются псевдонимами).

### `configureServer`

- **Тип:** `(server: ViteDevServer) => (() => void) | void | Promise<(() => void) | void>`
- **Вид:** `async`, `sequential`
- **Смотрите также:** [ViteDevServer](./api-javascript#vitedevserver)

  Хук для настройки сервера разработки. Наиболее распространенный вариант использования — добавление пользовательских мидлваров во внутреннее приложение [connect](https://github.com/senchalabs/connect):

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // custom handle request...
      })
    },
  })
  ```

  **Внедрение поста мидлвара**

  Хук `configureServer` вызывается перед установкой внутренних мидлваров, поэтому пользовательские промежуточные программы по умолчанию будут запускаться перед внутренними промежуточными программами. Если вы хотите внедрить мидлвар **после** внутреннего мидлвара, вы можете вернуть функцию из `configureServer`, которая будет вызываться после установки внутреннего мидлвара:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // return a post hook that is called after internal middlewares are
      // installed
      return () => {
        server.middlewares.use((req, res, next) => {
          // custom handle request...
        })
      }
    },
  })
  ```

  **Хранение доступа к серверу**

  В некоторых случаях другим хукам плагинов может потребоваться доступ к экземпляру сервера разработки (например, доступ к серверу веб-сокетов, наблюдателю файловой системы или графику модуля). Этот хук также можно использовать для хранения экземпляра сервера для доступа к другим хукам:

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // use server...
        }
      },
    }
  }
  ```

  Обратите внимание, что `configureServer` не вызывается при запуске рабочей сборки, поэтому ваши другие хуки должны защищать от его отсутствия.

### `configurePreviewServer`

- **Тип:** `(server: PreviewServerForHook) => (() => void) | void | Promise<(() => void) | void>`
- **Вид:** `async`, `sequential`
- **Смотрите также:** [PreviewServerForHook](./api-javascript#previewserverforhook)

  То же, что и [`configureServer`](/guide/api-plugin.html#configureserver), но для сервера предварительного просмотра. Как и в случае с `configureServer`, ловушка `configurePreviewServer` вызывается перед установкой других промежуточных программ. Если вы хотите внедрить промежуточное программное обеспечение **после** других промежуточных программ, вы можете вернуть функцию из `configurePreviewServer`, которая будет вызываться после установки внутреннего мидлвара:

  ```js
  const myPlugin = () => ({
    name: 'configure-preview-server',
    configurePreviewServer(server) {
      // return a post hook that is called after other middlewares are
      // installed
      return () => {
        server.middlewares.use((req, res, next) => {
          // custom handle request...
        })
      }
    },
  })
  ```

### `transformIndexHtml`

- **Тип:** `IndexHtmlTransformHook | { order?: 'pre' | 'post', handler: IndexHtmlTransformHook }`
- **Вид:** `async`, `sequential`

  Специальный хук для преобразования файлов точек входа HTML, таких как `index.html`. Хук получает текущую строку HTML и контекст преобразования. Контекст предоставляет экземпляр [`ViteDevServer`](./api-javascript#vitedevserver) во время разработки и предоставляет выходной пакет Rollup во время сборки.

  Хук может быть асинхронным и может возвращать одно из следующего:

  - Преобразованная строка HTML
  - Массив объектов дескриптора тега (`{ tag, attrs, children }`) для внедрения в существующий HTML. Каждый тег также может указывать, куда он должен быть введен (по умолчанию добавляется перед `<head>`)
  - Объект, содержащий как `{ html, tags }`

  По умолчанию `order` имеет значение `undefined`, при этом этот крючок применяется после преобразования HTML. Чтобы внедрить скрипт, который должен пройти через конвейер плагинов Vite, `order: 'pre'` применит перехват перед обработкой HTML. `order: 'post'` применяет хук после того, как будут применены все хуки с `order` неопределенным.

  **Простой Пример:**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Title replaced!</title>`,
        )
      },
    }
  }
  ```

  **Полная сигнатура хука:**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    },
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * default: 'head-prepend'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

### `handleHotUpdate`

- **Тип:** `(ctx: HmrContext) => Array<ModuleNode> | void | Promise<Array<ModuleNode> | void>`

  Выполнение пользовательской обработки обновлений HMR. Хук получает объект контекста со следующей сигнатурой:

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules` - это массив модулей, на которые влияет измененный файл. Это массив, потому что один файл может сопоставляться с несколькими обслуживаемыми модулями (например, Vue SFC).

  - `read` — это функция асинхронного чтения, которая возвращает содержимое файла. Это предусмотрено, потому что в некоторых системах обратный вызов изменения файла может срабатывать слишком быстро, прежде чем редактор завершит обновление файла, и прямой `fs.readFile` вернет пустое содержимое. Передаваемая функция чтения нормализует это поведение.

  Крюк может выбрать:

  - Отфильтруйте и сузьте список затронутых модулей, чтобы HMR был более точным.

  - Вернуть пустой массив и выполнить полную пользовательскую обработку HMR, отправив клиенту пользовательские события:

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    Клиентский код должен зарегистрировать соответствующий обработчик с помощью [HMR API](./api-hmr) (это может быть введено хуком `transform` того же плагина):

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // perform custom update
      })
    }
    ```

## Порядок плагина

Плагин Vite может дополнительно указать свойство `enforce` (аналогично загрузчикам веб-пакетов), чтобы настроить порядок приложений. Значение `enforce` может быть либо `"pre"` или `"post"`. Разрешенные плагины будут в следующем порядке:

- Псевдоним
- Пользовательские плагины с `enforce: 'pre'`
- Основные плагины Vite
- Пользовательские плагины без `enforce` значения
- Плагины сборки Vite
- Пользовательские плагины с `enforce: 'post'`
- Плагины пост-сборки Vite (минификация, манифест, отчеты)

## Условное применение

По умолчанию подключаемые модули вызываются как для обслуживания, так и для сборки. В тех случаях, когда плагин необходимо условно применить только во время подачи или сборки, используйте свойство `apply`, чтобы вызывать их только во время `'build'` или `'serve'`:

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build', // or 'serve'
  }
}
```

Функцию также можно использовать для более точного управления:

```js
apply(config, { command }) {
  // apply only on build but not for SSR
  return command === 'build' && !config.build.ssr
}
```

## Совместимость плагинов Rollup

Достаточное количество плагинов Rollup будет работать напрямую как плагин Vite (например, `@rollup/plugin-alias` или `@rollup/plugin-json`), но не все из них, поскольку некоторые хуки плагина не имеют смысла в несвязанный контекст сервера разработки.

В общем, если плагин Rollup соответствует следующим критериям, он должен работать просто как плагин Vite:

- Он не использует хук [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) hook.
- Он не имеет сильной связи между перехватчиками фазы пакета и перехватчиками фазы вывода.

Если подключаемый модуль Rollup имеет смысл только для этапа сборки, то вместо этого его можно указать в разделе `build.rollupOptions.plugins`. Он будет работать так же, как плагин Vite с `enforce: 'post'` и `apply: 'build'`.

Вы также можете дополнить существующий плагин Rollup свойствами только для Vite:

```js
// vite.config.js
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build',
    },
  ],
})
```

Ознакомьтесь с [Плагинами Vite Rollup](https://vite-rollup-plugins.patak.dev) для получения списка совместимых официальных плагинов Rollup с инструкциями по использованию.

## Нормализация пути

Vite нормализует пути при разрешении идентификаторов для использования разделителей POSIX (/) при сохранении объема в Windows. С другой стороны, Rollup по умолчанию сохраняет разрешенные пути нетронутыми, поэтому разрешенные идентификаторы имеют разделители win32 ( \\ ) в Windows. Тем не менее, подключаемые модули Rollup используют [служебную функцию `normalizePath`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath) из `@rollup/pluginutils` внутри, которая преобразует разделители в POSIX. перед выполнением сравнений. Это означает, что когда эти плагины используются в Vite, шаблон конфигурации `include` и `exclude` и другие аналогичные пути для сопоставления разрешенных идентификаторов работают правильно.

Таким образом, для плагинов Vite при сравнении путей с разрешенными идентификаторами важно сначала нормализовать пути для использования разделителей POSIX. Эквивалентная вспомогательная функция `normalizePath` экспортируется из модуля `vite`.

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 'foo/bar'
normalizePath('foo/bar') // 'foo/bar'
```

## Фильтрация, включение/исключение паттерна

Vite предоставляет функцию `createFilter` [`@rollup/pluginutils`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter), чтобы побудить специальные плагины и интеграции Vite использовать стандартный включить/исключить шаблон фильтрации, который также используется в самом ядре Vite.

## Связь клиент-сервер

Начиная с Vite 2.9, мы предоставляем некоторые утилиты для плагинов, которые помогают поддерживать связь с клиентами.

### Сервер к клиенту

Со стороны плагина мы могли бы использовать `server.ws.send` для трансляции событий всем клиентам:

```js
// vite.config.js
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        // Example: wait for a client to connect before sending a message
        server.ws.on('connection', () => {
          server.ws.send('my:greetings', { msg: 'hello' })
        })
      },
    },
  ],
})
```

::: tip ПРИМЕЧАНИЕ
Мы рекомендуем **всегда добавлять префикс** к именам событий, чтобы избежать конфликтов с другими плагинами.
:::

На стороне клиента используйте [`hot.on`](/guide/api-hmr.html#hot-on-event-cb) для прослушивания событий:

```ts
// client side
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg) // hello
  })
}
```

### Клиент к серверу

Для отправки событий от клиента к серверу мы можем использовать [`hot.send`](/guide/api-hmr.html#hot-send-event-payload):

```ts
// client side
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}
```

Затем используйте `server.ws.on` и слушайте события на стороне сервера:

```js
// vite.config.js
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('my:from-client', (data, client) => {
          console.log('Message from client:', data.msg) // Hey!
          // reply only to the client (if needed)
          client.send('my:ack', { msg: 'Hi! I got your message!' })
        })
      },
    },
  ],
})
```

### TypeScript для пользовательских событий

Пользовательские события можно ввести, расширив интерфейс `CustomEventMap`:

```ts
// events.d.ts
import 'vite/types/customEvent'

declare module 'vite/types/customEvent' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
    // 'event-key': payload
  }
}
```
