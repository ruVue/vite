# JavaScript API

API-интерфейсы JavaScript Vite полностью типизированы, и рекомендуется использовать TypeScript или включить проверку типов JS в VS Code, чтобы использовать intellisense и проверку.

## `createServer`

**Тип подписи:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**Пример использования:**

```ts twoslash
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const server = await createServer({
  // any valid user config options, plus `mode` and `configFile`
  configFile: false,
  root: __dirname,
  server: {
    port: 1337,
  },
})
await server.listen()

server.printUrls()
server.bindCLIShortcuts({ print: true })
```

::: tip ПРИМЕЧАНИЕ
При использовании `createServer` и `build` в одном и том же процессе Node.js обе функции полагаются на `process.env.NODE_ENV` для правильной работы, что также зависит от параметра конфигурации `mode`. Чтобы предотвратить конфликтное поведение, установите для `process.env.NODE_ENV` или `mode` двух API значение `development`. В противном случае вы можете создать дочерний процесс для отдельного запуска API.
:::

::: tip ПРИМЕЧАНИЕ
При использовании [режима мидлвара](/config/server-options.html#server-middlewaremode) в сочетании с [конфигурацией прокси-сервера для WebSocket](/config/server-options.html#server-proxy), необходимо указать родительский http-сервер в `middlewareMode`, чтобы правильно привязать прокси.

<details>
<summary>Пример</summary>

```ts twoslash
import http from 'http'
import { createServer } from 'vite'

const parentServer = http.createServer() // or express, koa, etc.

const vite = await createServer({
  server: {
    // Enable middleware mode
    middlewareMode: {
      // Provide the parent http server for proxy WebSocket
      server: parentServer,
    },
    proxy: {
      '/ws': {
        target: 'ws://localhost:3000',
        // Proxying WebSocket
        ws: true,
      },
    },
  },
})

// @noErrors: 2339
parentServer.use(vite.middlewares)
```

</details>
:::

## `InlineConfig`

Интерфейс `InlineConfig` расширяет `UserConfig` дополнительными свойствами:

- `configFile`: укажите используемый файл конфигурации. Если не установлено, Vite попытается автоматически разрешить его из корня проекта. Установите значение `false`, чтобы отключить автоматическое разрешение.
- `envFile`: Установите значение `false`, чтобы отключить файлы `.env`.

## `ResolvedConfig`

Интерфейс `ResolvedConfig` имеет все те же свойства, что и `UserConfig`, за исключением того, что большинство свойств разрешены и не определены. Он также содержит такие утилиты, как:

- `config.assetsInclude`: Функция для проверки, считается ли `id` ассетом.
- `config.logger`: Внутренний объект регистратора Vite.

## `ResolvedConfig`

Интерфейс `ResolvedConfig` имеет все те же свойства, что и `UserConfig`, за исключением того, что большинство свойств разрешены и не определены. Он также содержит такие утилиты, как:

- `config.assetsInclude`: Функция для проверки, считается ли `id` асетом.
- `config.logger`: Внутренний объект регистратора Vite.

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * The resolved Vite config object.
   */
  config: ResolvedConfig
  /**
   * A connect app instance
   * - Can be used to attach custom middlewares to the dev server.
   * - Can also be used as the handler function of a custom http server
   *   or as a middleware in any connect-style Node.js frameworks.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Native Node http server instance.
   * Will be null in middleware mode.
   */
  httpServer: http.Server | null
  /**
   * Chokidar watcher instance. If `config.server.watch` is set to `null`,
   * it will not watch any files and calling `add` or `unwatch` will have no effect.
   * https://github.com/paulmillr/chokidar/tree/3.6.0#api
   */
  watcher: FSWatcher
  /**
   * Web socket server with `send(payload)` method.
   */
  ws: WebSocketServer
  /**
   * Rollup plugin container that can run plugin hooks on a given file.
   */
  pluginContainer: PluginContainer
  /**
   * Module graph that tracks the import relationships, url to file mapping
   * and hmr state.
   */
  moduleGraph: ModuleGraph
  /**
   * The resolved urls Vite prints on the CLI (URL-encoded). Returns `null`
   * in middleware mode or if the server is not listening on any port.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Programmatically resolve, load and transform a URL and get the result
   * without going through the http request pipeline.
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * Apply Vite built-in HTML transforms and any plugin HTML transforms.
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * Load a given URL as an instantiated module for SSR.
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * Fix ssr error stacktrace.
   */
  ssrFixStacktrace(e: Error): void
  /**
   * Triggers HMR for a module in the module graph. You can use the `server.moduleGraph`
   * API to retrieve the module to be reloaded. If `hmr` is false, this is a no-op.
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * Start the server.
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * Restart the server.
   *
   * @param forceOptimize - force the optimizer to re-bundle, same as --force cli flag
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * Stop the server.
   */
  close(): Promise<void>
  /**
   * Bind CLI shortcuts
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * Calling `await server.waitForRequestsIdle(id)` will wait until all static imports
   * are processed. If called from a load or transform plugin hook, the id needs to be
   * passed as a parameter to avoid deadlocks. Calling this function after the first
   * static imports section of the module graph has been processed will resolve immediately.
   * @experimental
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle` is meant to be used as a escape hatch to improve DX for features that can't be implemented following the on-demand nature of the Vite dev server. It can be used during startup by tools like Tailwind to delay generating the app CSS classes until the app code has been seen, avoiding flashes of style changes. When this function is used in a load or transform hook, and the default HTTP1 server is used, one of the six http channels will be blocked until the server processes all static imports. Vite's dependency optimizer currently uses this function to avoid full-page reloads on missing dependencies by delaying loading of pre-bundled dependencies until all imported dependencies have been collected from static imported sources. Vite may switch to a different strategy in a future major release, setting `optimizeDeps.crawlUntilStaticImports: false` by default to avoid the performance hit in large applications during cold start.
:::

## `build`

**Тип подписи:**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**Пример использования:**

```ts twoslash [vite.config.js]
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await build({
  root: path.resolve(__dirname, './project'),
  base: '/foo/',
  build: {
    rollupOptions: {
      // ...
    },
  },
})
```

## `preview`

**Тип подписи:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**Пример использования:**

```ts twoslash
import { preview } from 'vite'

const previewServer = await preview({
  // any valid user config options, plus `mode` and `configFile`
  preview: {
    port: 8080,
    open: true,
  },
})

previewServer.printUrls()
previewServer.bindCLIShortcuts({ print: true })
```

## `PreviewServer`

```ts
interface PreviewServer {
  /**
   * The resolved vite config object
   */
  config: ResolvedConfig
  /**
   * A connect app instance.
   * - Can be used to attach custom middlewares to the preview server.
   * - Can also be used as the handler function of a custom http server
   *   or as a middleware in any connect-style Node.js frameworks
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * native Node http server instance
   */
  httpServer: http.Server
  /**
   * The resolved urls Vite prints on the CLI (URL-encoded). Returns `null`
   * if the server is not listening on any port.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Print server urls
   */
  printUrls(): void
  /**
   * Bind CLI shortcuts
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**Тип подписи:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

Значением `command` является `serve` в разработке и предварительной версии и `build` в сборке.

## `mergeConfig`

**Тип подписи:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

Глубоко объедините две конфигурации Vite. `isRoot` представляет уровень в конфигурации Vite, который объединяется. Например, установите `false`, если вы объединяете две опции `build`.

::: tip ПРИМЕЧАНИЕ
`mergeConfig` принимает только конфигурацию в объектной форме. Если у вас есть конфигурация в форме обратного вызова, вам следует вызвать ее перед переходом в `mergeConfig`.

Вы можете использовать помощник `defineConfig` для объединения конфигурации в форме обратного вызова с другой конфигурацией:

```ts twoslash
import {
  defineConfig,
  mergeConfig,
  type UserConfigFnObject,
  type UserConfig,
} from 'vite'
declare const configAsCallback: UserConfigFnObject
declare const configAsObject: UserConfig

// ---cut---
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**Тип подписи:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**Связанное:** [server.fs.allow](/config/server-options.md#server-fs-allow)

Найдите корень потенциального рабочего пространства, если он соответствует следующим условиям, в противном случае он вернется к `root`:

- содержит поле `workspaces` в `package.json`
- содержит один из следующих файлов
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**Тип подписи:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**Связанное:** [Файлы `.env`](./env-and-mode.md#env-files)

Загрузите файлы `.env` в `envDir`. По умолчанию загружаются только переменные env с префиксом `VITE_`, если `prefixes` не изменены.

## `normalizePath`

**Тип подписи:**

```ts
function normalizePath(id: string): string
```

**Связанное:** [Нормализация пути](./api-plugin.md#path-normalization)

Нормализует путь взаимодействия между плагинами Vite.

## `mergeConfig`

**Тип подписи:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

Глубоко объедините две конфигурации Vite. `isRoot` представляет уровень в конфигурации Vite, который объединяется. Например, установите `false`, если вы объединяете две опции `build`.

## `searchForWorkspaceRoot`

**Тип подписи:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**Связанное:** [server.fs.allow](/config/server-options.md#server-fs-allow)

Найдите корень потенциального рабочего пространства, если он соответствует следующим условиям, в противном случае он вернется к `root`:

- содержит поле `workspaces` в `package.json`
- содержит один из следующих файлов
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**Тип подписи:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**Связанное:** [Файлы `.env`](./env-and-mode.md#env-files)

Загрузите файлы `.env` в `envDir`. По умолчанию загружаются только переменные env с префиксом `VITE_`, если `prefixes` не изменены.

## `normalizePath`

**Тип подписи:**

```ts
function normalizePath(id: string): string
```

**Связанное:** [Нормализация пути](./api-plugin.md#path-normalization)

Нормализует путь взаимодействия между плагинами Vite.

## `transformWithEsbuild`

**Тип подписи:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

Преобразуйте JavaScript или TypeScript с помощью esbuild. Полезно для плагинов, которые предпочитают соответствие внутреннему преобразованию esbuild Vite.

## `loadConfigFromFile`

**Тип подписи:**

```ts
async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
  customLogger?: Logger,
): Promise<{
  path: string
  config: UserConfig
  dependencies: string[]
} | null>
```

Загрузите файл конфигурации Vite вручную с помощью esbuild.

## `preprocessCSS`

- **Экспериментальный:** [Дать отзыв](https://github.com/vitejs/vite/discussions/13815)

**Тип подписи:**

```ts
async function preprocessCSS(
  code: string,
  filename: string,
  config: ResolvedConfig,
): Promise<PreprocessCSSResult>

interface PreprocessCSSResult {
  code: string
  map?: SourceMapInput
  modules?: Record<string, string>
  deps?: Set<string>
}
```

Предварительно обрабатывает файлы `.css`, `.scss`, `.sass`, `.less`, `.styl` и `.stylus` в обычный CSS, чтобы его можно было использовать в браузерах или анализировать другими инструментами. Подобно [встроенной поддержке предварительной обработки CSS](/guide/features#css-pre-processors), соответствующий предварительный процессор должен быть установлен, если используется.

Используемый предварительный процессор выводится из расширения `filename`. Если `filename` заканчивается на `.module.{ext}`, он выводится как [модуль CSS](https://github.com/css-modules/css-modules), а возвращаемый результат будет включать объект `modules`, сопоставляющий исходные имена классов с преобразованными.

Обратите внимание, что предварительная обработка не разрешает URL-адреса в `url()` или `image-set()`.
