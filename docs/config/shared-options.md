# Общие параметры

## root

- **Тип:** `string`
- **По умолчанию:** `process.cwd()`

Корневой каталог проекта (где находится `index.html`). Может быть абсолютным путем или путем относительно текущего рабочего каталога.

Дополнительные сведения смотрите в [Корень проекта](/guide/#index-html-and-project-root).

## base

- **Type:** `string`
- **По умолчанию:** `/`
- **Связанный:** [`server.origin`](/config/server-options.md#server-origin)

Базовый общедоступный путь при использовании в разработке или рабочей среде. Допустимые значения включают:

- Абсолютный путь к URL-адресу, например, `/foo/`
- Полный URL-адрес, например, `https://foo.com/` (исходная часть не будет использоваться в разработке)
- Пустая строка или `./` (для встроенного развертывания)

Дополнительные сведения смотрите в разделе [Общедоступный базовый путь](/guide/build#public-base-path).

## mode

- **Тип:** `string`
- **По умолчанию:** `'development'` для serve, `'production'` для build

Указание этого в конфигурации переопределит режим по умолчанию для **и обслуживания, и сборки**. Это значение также можно переопределить с помощью параметра командной строки `--mode`.

Подробнее смотрите в разделе [Переменные и режимы окружения](/guide/env-and-mode).

## define

- **Тип:** `Record<string, any>`

Определить глобальные замены констант. Записи будут определены как глобальные во время разработки и статически заменены во время сборки.

Vite использует [esbuild defines](https://esbuild.github.io/api/#define) для выполнения замен, поэтому выражения значений должны быть строкой, содержащей сериализуемое значение JSON (нулевое, логическое, число, строка, массив или объект) или одиночный идентификатор. Для нестроковых значений Vite автоматически преобразует их в строку с помощью `JSON.stringify`.

**Example:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip ПРИМЕЧАНИЕ
Для пользователей TypeScript обязательно добавьте объявления типов в файл `env.d.ts` или `vite-env.d.ts`, чтобы получить проверки типов и Intellisense.

Пример:

```ts
// vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## plugins

- **Тип:** `(Plugin | Plugin[] | Promise<Plugin | Plugin[]>)[]`

Массив плагинов для использования. Фальшивые плагины игнорируются, а массивы плагинов сглаживаются. Если обещание возвращается, оно будет разрешено перед запуском. Смотрите [API плагина](/guide/api-plugin) для получения дополнительной информации о плагинах Vite.

## publicDir

- **Тип:** `string | false`
- **По умолчанию:** `"public"`

Каталог для использования в качестве простых статических активов. Файлы в этом каталоге обслуживаются в `/` во время разработки и копируются в корень `outDir` во время сборки, и всегда обслуживаются или копируются как есть без преобразования. Значение может быть либо абсолютным путем к файловой системе, либо путем относительно корня проекта.

Определение `publicDir` как `false` отключает эту функцию.

Смотрите [Каталог `public`](/guide/assets#the-public-directory) для более подробной информации.

## cacheDir

- **Тип:** `string`
- **По умолчанию:** `"node_modules/.vite"`

Каталог для сохранения файлов кеша. Файлы в этом каталоге представляют собой предварительно упакованные deps или некоторые другие файлы кеша, созданные vite, которые могут повысить производительность. Вы можете использовать флаг `--force` или вручную удалить каталог, чтобы восстановить файлы кеша. Значение может быть либо абсолютным путем к файловой системе, либо путем относительно корня проекта. По умолчанию используется `.vite`, если package.json не обнаружен.

## resolve.alias

- **Тип:**
  `Record<string, string> | Array<{ find: string | RegExp, replacement: string, customResolver?: ResolverFunction | ResolverObject }>`

Будет передан `@rollup/plugin-alias` в качестве [параметра записей](https://github.com/rollup/plugins/tree/master/packages/alias#entries). Может быть либо объектом, либо массивом пар `{ find, replacement, customResolver }`.

При использовании псевдонимов для путей файловой системы всегда используйте абсолютные пути. Относительные значения псевдонимов будут использоваться как есть и не будут преобразовываться в пути файловой системы.

Более расширенное пользовательское разрешение можно получить с помощью [плагинов](/guide/api-plugin).

::: warning Использование с SSR
Если вы настроили псевдонимы для [внешних зависимостей SSR](/guide/ssr.md#ssr-externals), вы можете захотеть создать псевдонимы для реальных пакетов `node_modules`. Оба [Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) и [pnpm](https://pnpm.io/aliases/) поддерживают псевдонимы через префикс `npm:`.
:::

## resolve.dedupe

- **Тип:** `string[]`

Если у вас есть дублированные копии одной и той же зависимости в вашем приложении (вероятно, из-за подъема или связанных пакетов в монорепозиториях), используйте этот параметр, чтобы заставить Vite всегда разрешать перечисленные зависимости в одну и ту же копию (из корня проекта).

:::warning SSR + ESM
Для сборок SSR дедупликация не работает для выходных данных сборки ESM, настроенных из `build.rollupOptions.output`. Обходной путь — использовать выходные данные сборки CJS, пока в ESM не будет улучшена поддержка подключаемых модулей для загрузки модулей.
:::

## resolve.conditions

- **Тип:** `string[]`

Дополнительные разрешенные условия при разрешении [условного экспорта](https://nodejs.org/api/packages.html#packages_conditional_exports) из пакета.

Пакет с условным экспортом может иметь следующее поле `exports` в `package.json`:

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

Здесь `import` и `require` — это «условия». Условия могут быть вложенными и должны указываться от наиболее конкретных к наименее конкретным.

Vite имеет список «разрешенных условий» и будет соответствовать первому условию в списке разрешенных. Допустимые условия по умолчанию: `import`, `module`, `browser`, `default` и `production/development` в зависимости от текущего режима. Параметр конфигурации `resolve.conditions` позволяет указать дополнительные допустимые условия.

:::warning Разрешение экспорта подпути
Ключи экспорта, оканчивающиеся на "/", устарели в Node и могут работать некорректно. Обратитесь к автору пакета, чтобы вместо этого использовать [`*` шаблоны подпути](https://nodejs.org/api/packages.html#package-entry-points).
:::

## resolve.mainFields

- **Type:** `string[]`
- **По умолчанию:** `['browser', 'module', 'jsnext:main', 'jsnext']`

Список полей в `package.json`, которые нужно попробовать при разрешении точки входа пакета. Обратите внимание, что это имеет более низкий приоритет, чем условный экспорт, разрешенный из поля `exports`: если точка входа успешно разрешена из `exports`, основное поле будет проигнорировано.

## resolve.extensions

- **Тип:** `string[]`
- **По умолчанию:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

Список расширений файлов, которые можно попробовать для импорта без расширений. Обратите внимание, что **НЕ** рекомендуется опускать расширения для пользовательских типов импорта (например, `.vue`), так как это может помешать IDE и поддержке типов.

## resolve.preserveSymlinks

- **Тип:** `boolean`
- **По умолчанию:** `false`

Включение этого параметра приводит к тому, что vite определяет идентификатор файла по исходному пути к файлу (т. е. пути без перехода по символическим ссылкам) вместо реального пути к файлу (т. е. пути после перехода по символическим ссылкам).

- **Связанный:** [esbuild#preserve-symlinks](https://esbuild.github.io/api/#preserve-symlinks), [webpack#resolve.symlinks
  ](https://webpack.js.org/configuration/resolve/#resolvesymlinks)

## css.modules

- **Тип:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * По умолчанию: undefined
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

Настройте поведение модулей CSS. Параметры передаются [postcss-modules](https://github.com/css-modules/postcss-modules).

Эта опция не имеет никакого эффекта при использовании [Lightning CSS](../guide/features.md#lightning-css). Если этот параметр включен, вместо него следует использовать [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html).

## css.postcss

- **Тип:** `string | (postcss.ProcessOptions & { plugins?: postcss.AcceptedPlugin[] })`

Встроенная конфигурация PostCSS или пользовательский каталог для поиска конфигурации PostCSS (по умолчанию — корень проекта).

Для встроенной конфигурации PostCSS ожидается тот же формат, что и `postcss.config.js`. Но для свойства `plugins` можно использовать только [формат массива](https://github.com/postcss/postcss-load-config/blob/main/README.md#array).

Поиск выполняется с помощью [postcss-load-config](https://github.com/postcss/postcss-load-config), и загружаются только поддерживаемые имена файлов конфигурации.

Обратите внимание, что если указана встроенная конфигурация, Vite не будет искать другие источники конфигурации PostCSS.

## css.preprocessorOptions

- **Тип:** `Record<string, object>`

Укажите параметры для передачи препроцессорам CSS. Расширения файлов используются в качестве ключей для параметров. Поддерживаемые параметры для каждого препроцессора можно найти в соответствующей документации:

- `sass`/`scss` - [Параметры](https://sass-lang.com/documentation/js-api/interfaces/LegacyStringOptions).
- `less` - [Параметры](https://lesscss.org/usage/#less-options).
- `styl`/`stylus` - Only [`define`](https://stylus-lang.com/docs/js.html#define-name-node), который можно передать как объект.

Все параметры препроцессора также поддерживают параметр `additionalData`, который можно использовать для внедрения дополнительного кода для каждого содержимого стиля. Обратите внимание: если вы включаете реальные стили, а не только переменные, эти стили будут дублироваться в окончательном пакете.

Пример:

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
    },
  },
})
```

## css.devSourcemap

- **Экспериментальный** [Дать обратную связь](https://github.com/vitejs/vite/discussions/13845)
- **Тип:** `boolean`
- **По умолчанию:** `false`

Включить ли исходные карты во время разработки.

## css.transformer

- **Экспериментальный** [Дать обратную связь](https://github.com/vitejs/vite/discussions/13835)
- **Тип:** `'postcss' | 'lightningcss'`
- **По умолчанию:** `'postcss'`

Выбирает механизм, используемый для обработки CSS. Посетите [Lightning CSS](../guide/features.md#lightning-css) для получения дополнительной информации.

## css.lightningcss

- **Экспериментальный** [Дать обратную связь](https://github.com/vitejs/vite/discussions/13835)
- **Тип:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

Настраивает CSS Lightning. Полные параметры преобразования можно найти в [репозитории Lightning CSS](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts).

## json.namedExports

- **Тип:** `boolean`
- **По умолчанию:** `true`

Поддерживать ли именованный импорт из файлов `.json`.

## json.stringify

- **Тип:** `boolean`
- **По умолчанию:** `false`

Если установлено значение `true`, импортированный JSON будет преобразован в `export default JSON.parse("...")`, который значительно более эффективен, чем литералы Object, особенно когда файл JSON большой.

Включение этого параметра отключает именованный импорт.

## esbuild

- **Тип:** `ESBuildOptions | false`

`ESBuildOptions` расширяет [собственные параметры преобразования esbuild](https://esbuild.github.io/api/#transform). Самый распространенный вариант использования — настройка JSX:

```js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

По умолчанию esbuild применяется к файлам `ts`, `jsx` и `tsx`. Вы можете настроить это с помощью `esbuild.include` и `esbuild.exclude`, которые могут быть регулярным выражением, шаблоном [picomatch](https://github.com/micromatch/picomatch#globbing-features) или массивом либо.

Кроме того, вы также можете использовать `esbuild.jsxInject`, чтобы автоматически внедрять вспомогательный импорт JSX для каждого файла, преобразованного esbuild:

```js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

Когда [`build.minify`](./build-options.md#build-minify) равно `true`, все оптимизации минимизации применяются по умолчанию. Чтобы отключить [определенные аспекты](https://esbuild.github.io/api/#minify) его, установите для любого из параметров `esbuild.minifyIdentifiers`, `esbuild.minifySyntax` или `esbuild.minifyWhitespace` значение `false`. Обратите внимание, что параметр `esbuild.minify` нельзя использовать для переопределения `build.minify`.

Установите `false`, чтобы отключить преобразования esbuild.

## assetsInclude

- **Тип:** `string | RegExp | (string | RegExp)[]`
- **Связанный:** [Static Asset Handling](/guide/assets)

Укажите дополнительные [шаблоны picomatch](https://github.com/micromatch/picomatch#globbing-features), которые будут рассматриваться как статические ресурсы, чтобы:

- Они будут исключены из конвейера преобразования плагина при ссылке из HTML или прямом запросе через `fetch` или XHR.

- Импорт их из JS вернет их разрешенную строку URL-адреса (это можно перезаписать, если у вас есть плагин `enforce: 'pre'` для другой обработки типа актива).

Список встроенных типов активов можно найти [здесь](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts).

**Пример:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## logLevel

- **Тип:** `'info' | 'warn' | 'error' | 'silent'`

Настройте уровень детализации вывода консоли. По умолчанию это `'info'`.

## customLogger

- **Тип:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

Используйте специальный регистратор для регистрации сообщений. Вы можете использовать API `createLogger` от Vite, чтобы получить регистратор по умолчанию и настроить его, например, для изменения сообщения или фильтрации определенных предупреждений.

```js
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // Ignore empty CSS files warning
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## clearScreen

- **Тип:** `boolean`
- **По умолчанию:** `true`

Установите значение `false`, чтобы Vite не очищал экран терминала при регистрации определенных сообщений. Через командную строку используйте `--clearScreen false`.

## envDir

- **Тип:** `string`
- **По умолчанию:** `root`

Каталог, из которого загружаются файлы `.env`. Может быть абсолютным путем или путем относительно корня проекта.

Подробнее о файлах среды смотрите [здесь](/guide/env-and-mode#env-files).

## envPrefix

- **Тип:** `string | string[]`
- **По умолчанию:** `VITE_`

Переменные Env, начинающиеся с `envPrefix`, будут доступны исходному коду вашего клиента через `import.meta.env`.

:::warning ЗАМЕЧАНИЯ ПО БЕЗОПАСНОСТИ
`envPrefix` не должен быть установлен как `''`, это приведет к раскрытию всех ваших переменных env и приведет к неожиданной утечке конфиденциальной информации. Vite выдаст ошибку при обнаружении `''`.

Если вы хотите предоставить переменную без префикса, вы можете использовать [define](#define) для ее предоставления:

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## appType

- **Тип:** `'spa' | 'mpa' | 'custom'`
- **По умолчанию:** `'spa'`

Независимо от того, является ли ваше приложение одностраничным приложением (SPA), [многостраничным приложением (MPA)](../guide/build#multi-page-app) или пользовательским приложением (SSR и фреймворки с пользовательской обработкой HTML):

- `'spa'`: включить HTML-мидлвары и использовать запасной вариант SPA. Настройте [sirv](https://github.com/lukeed/sirv) с `single: true` в превью
- `'mpa'`: включить HTML-мидлвары
- `'custom'`: не включать HTML-мидлвары

Узнайте больше в [Руководстве по Vite](/guide/ssr#vite-cli). Связанный: [`server.middlewareMode`](./server-options#server-middlewaremode).
