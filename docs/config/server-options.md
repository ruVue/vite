# Параметры сервера

## server.host

- **Тип:** `string | boolean`
- **По умолчанию:** `'localhost'`

Укажите, какие IP-адреса сервер должен прослушивать.
Установите для этого параметра значение `0.0.0.0` или `true`, чтобы прослушивать все адреса, включая локальные и общедоступные адреса.

Это можно установить через CLI, используя `--host 0.0.0.0` или `--host`.

::: tip ПРИМЕЧАНИЕ

Бывают случаи, когда другие серверы могут отвечать вместо Vite.

В первом случае используется `localhost`. Node.js в версии 17 по умолчанию переупорядочивает результат разрешения DNS. При доступе к `localhost`, браузеры используют DNS для разрешения адреса, и этот адрес может отличаться от адреса, который прослушивает Vite. Vite печатает разрешенный адрес, когда он отличается.

Вы можете установить [`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order), чтобы отключить поведение переупорядочения. Затем Vite напечатает адрес как `localhost`.

```js twoslash
// vite.config.js
import { defineConfig } from 'vite'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // omit
})
```

Во втором случае используются подстановочные знаки (например, `0.0.0.0`). Это связано с тем, что серверы, прослушивающие хосты без подстановочных знаков, имеют приоритет над серверами, прослушивающими хосты с подстановочными знаками.

:::

::: tip Доступ к серверу WSL2 из вашей локальной сети

При запуске Vite на WSL2 недостаточно установить `host: true` для доступа к серверу из вашей локальной сети.
Смотрите [документацию WSL](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan) для более подробной информации.

:::

## server.port

- **Тип:** `number`
- **По умолчанию:** `5173`

Укажите порт сервера. Обратите внимание, что если порт уже используется, Vite автоматически попробует следующий доступный порт, поэтому это может быть не тот порт, который сервер в конечном итоге прослушивает.

## server.strictPort

- **Тип:** `boolean`

Установите значение `true`, чтобы выйти, если порт уже используется, вместо того, чтобы автоматически пытаться использовать следующий доступный порт.

## server.https

- **Тип:** `https.ServerOptions`

Включите TLS + HTTP/2. Обратите внимание, что переход на TLS происходит только в том случае, если также используется [опция `server.proxy`](#server-proxy).

Значение также может быть [объектом параметров](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener), переданным в `https.createServer()`.

Нужен действующий сертификат. Для базовой настройки вы можете добавить [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) в плагины проекта, которые будут автоматически создавать и кэшировать собственный -подписанный сертификат. Но мы рекомендуем создавать собственные сертификаты.

## server.open

- **Тип:** `boolean | string`

Автоматически открывать приложение в браузере при запуске сервера. Если значение представляет собой строку, оно будет использоваться в качестве пути URL-адреса. Если вы хотите открыть сервер в конкретном браузере, который вам нравится, вы можете установить env `process.env.BROWSER` (например, `firefox`). Вы также можете установить `process.env.BROWSER_ARGS` для передачи дополнительных аргументов (например, `--incognito`).

`BROWSER` и `BROWSER_ARGS` также являются специальными переменными среды, которые вы можете установить в файле `.env` для его настройки. Дополнительную информацию смотрите в [пакете `open`](https://github.com/sindresorhus/open#app).

**Пример:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- **Тип:** `Record<string, string | ProxyOptions>`

Настройте пользовательские правила прокси для сервера разработки. Ожидает объект пар `{ key: options }`. Любые запросы, путь запроса которых начинается с этого ключа, будут проксированы на указанную цель. Если ключ начинается с `^`, он будет интерпретирован как `RegExp`. Параметр `configure` можно использовать для доступа к экземпляру прокси.

Обратите внимание, что если вы используете не относительную [`base`](/config/shared-options.md#base), вы должны добавлять префикс на каждый ключ это `base`.

Расширяет [`http-proxy`](https://github.com/http-party/node-http-proxy#options). Дополнительные параметры находятся [здесь](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts#L13).

В некоторых случаях вы также можете настроить базовый сервер разработки (например, чтобы добавить настраиваемый мидлвар во внутреннее приложение [connect](https://github.com/senchalabs/connect)). Для этого вам нужно написать свой собственный [плагин](/guide/using-plugins.html) и использовать функцию [configureServer](/guide/api-plugin.html#configureserver).

**Пример:**

```js
export default defineConfig({
  server: {
    proxy: {
      // string shorthand: http://localhost:5173/foo -> http://localhost:4567/foo
      '/foo': 'http://localhost:4567',
      // with options: http://localhost:5173/api/bar-> http://jsonplaceholder.typicode.com/bar
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // with RegEx: http://localhost:5173/fallback/ -> http://jsonplaceholder.typicode.com/
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // Using the proxy instance
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // proxy will be an instance of 'http-proxy'
        },
      },
      // Proxying websockets or socket.io: ws://localhost:5173/socket.io -> ws://localhost:5174/socket.io
      // Exercise caution using `rewriteWsOrigin` as it can leave the proxying open to CSRF attacks.
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## server.cors

- **Тип:** `boolean | CorsOptions`

Настройте CORS для сервера разработки. Это включено по умолчанию и допускает любой источник. Передайте [объект параметров](https://github.com/expressjs/cors#configuration-options), чтобы точно настроить поведение, или `false`, чтобы отключить.

## server.headers

- **Тип:** `OutgoingHttpHeaders`

Укажите заголовки ответа сервера.

## server.hmr

- **Тип:** `boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean, clientPort?: number, server?: Server }`

Отключите или настройте соединение HMR (в случаях, когда веб-сокет HMR должен использовать адрес, отличный от http-сервера).

Установите для `server.hmr.overlay` значение `false`, чтобы отключить наложение ошибок сервера.

`protocol` устанавливает протокол WebSocket, используемый для соединения HMR: `ws` (WebSocket) или `wss` (WebSocket Secure).

`clientPort` — это расширенный параметр, который переопределяет порт только на стороне клиента, позволяя обслуживать веб-сокет на порту, отличном от того, на котором его ищет клиентский код.

Когда `server.hmr.server` определен, Vite будет обрабатывать запросы на подключение HMR через предоставленный сервер. Если не в режиме промежуточного программного обеспечения, Vite попытается обработать запросы на подключение HMR через существующий сервер. Это может быть полезно при использовании самозаверяющих сертификатов или когда вы хотите открыть Vite по сети на одном порту.

Посмотрите [`vite-setup-catalogue`](https://github.com/sapphi-red/vite-setup-catalogue) для некоторых примеров.

::: tip ПРИМЕЧАНИЕ

Ожидается, что в конфигурации по умолчанию обратные прокси-серверы перед Vite будут поддерживать проксирование WebSocket. Если клиенту Vite HMR не удается подключиться к WebSocket, клиент вернется к подключению WebSocket напрямую к серверу Vite HMR, минуя обратные прокси:

```
Отказ от прямого подключения к веб-сокету. Проверьте https://vitejs.ru/config/server-options.html#server-hmr , чтобы удалить предыдущую ошибку подключения.
```

Ошибку, которая появляется в браузере, когда происходит откат, можно игнорировать. Чтобы избежать ошибки путем прямого обхода обратных прокси-серверов, вы можете:

- настроить обратный прокси-сервер на прокси-сервер WebSocket
- установите [`server.strictPort = true`](#server-strictport) и установите для `server.hmr.clientPort` то же значение, что и для `server.port`
- установите для `server.hmr.port` значение, отличное от [`server.port`](#server-port)

:::

## server.warmup

- **Тип:** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **Связанный:** [Разминка часто используемых файлов](/guide/performance.html#warm-up-frequently-used-files)

Предварительно прогрейте файлы для преобразования и кэширования результатов. Это улучшает начальную загрузку страницы во время запуска сервера и предотвращает водопады преобразований.

`clientFiles` — это файлы, которые используются только в клиенте, а `ssrFiles` — это файлы, которые используются только в SSR. Они принимают массив путей к файлам или шаблоны [`fast-glob`](https://github.com/mrmlnc/fast-glob) относительно `root`.

Обязательно добавляйте только те файлы, которые часто используются, чтобы не перегружать сервер разработки Vite при запуске.

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
      ssrFiles: ['./src/server/modules/*.js'],
    },
  },
})
```

## server.watch

- **Тип:** `object | null`

Параметры средства наблюдения за файловой системой необходимо передать [chokidar](https://github.com/paulmillr/chokidar#api).

Наблюдатель сервера Vite по умолчанию наблюдает за `root` и пропускает `.git/`, `node_modules/`, а также каталоги `cacheDir` и `build.outDir` Vite. При обновлении наблюдаемого файла Vite применит HMR и обновит страницу только при необходимости.

Если установлено значение `null`, файлы просматриваться не будут. `server.watcher` предоставит совместимый генератор событий, но вызов `add` или `unwatch` не будет иметь никакого эффекта.

::: warning Наблюдение файлов в `node_modules`

В настоящее время невозможно просматривать файлы и пакеты в `node_modules`. Для дальнейшего прогресса и обходных путей вы можете следить за [проблемой #8619](https://github.com/vitejs/vite/issues/8619).

:::

::: warning Использование Vite в подсистеме Windows для Linux (WSL) 2

При запуске Vite на WSL2 просмотр файловой системы не работает, когда файл редактируется приложениями Windows (процесс, отличный от WSL2). Это связано с [ограничением WSL2](https://github.com/microsoft/WSL/issues/4739). Это также относится к работе в Docker с серверной частью WSL2.

Чтобы исправить это, вы можете:

- **Рекомендуется**: используйте приложения WSL2 для редактирования файлов.
  - Также рекомендуется переместить папку проекта за пределы файловой системы Windows. Доступ к файловой системе Windows из WSL2 медленный. Удаление этих накладных расходов повысит производительность.
- Установите `{ usePolling: true }`.
  - Обратите внимание, что [`usePolling` приводит к высокой загрузке ЦП](https://github.com/paulmillr/chokidar#performance).

:::

## server.middlewareMode

- **Тип:** `boolean`
- **По умолчанию:** `false`

Создайте сервер Vite в режиме мидлвара.

- **Связанный:** [appType](./shared-options#apptype), [SSR — настройка сервера разработки](/guide/ssr#setting-up-the-dev-server)

- **Пример:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom', // don't include Vite's default HTML handling middlewares
  })
  // Use vite's connect instance as middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // Since `appType` is `'custom'`, should serve response here.
    // Note: if `appType` is `'spa'` or `'mpa'`, Vite includes middlewares to handle
    // HTML requests and 404s so user middlewares should be added
    // before Vite's middlewares to take effect instead
  })
}

createServer()
```

## server.fs.strict

- **Тип:** `boolean`
- **По умолчанию:** `true` (enabled by default since Vite 2.7)

Ограничить обслуживание файлов за пределами корня рабочей области.

## server.fs.allow

- **Тип:** `string[]`

Ограничить файлы, которые можно обслуживать через `/@fs/`. Когда для `server.fs.strict` установлено значение `true`, доступ к файлам за пределами этого списка каталогов, которые не импортированы из разрешенного файла, приведет к ошибке 403.

Могут быть предоставлены как каталоги, так и файлы.

Vite выполнит поиск корня потенциального рабочего пространства и будет использовать его по умолчанию. Действительная рабочая область соответствует следующим условиям, в противном случае произойдет возврат к [project root](/guide/#index-html-and-project-root).

- содержит поле `workspaces` в `package.json`
- содержит один из следующих файлов
  - `lerna.json`
  - `pnpm-workspace.yaml`

Принимает путь для указания пользовательского корня рабочей области. Это может быть абсолютный путь или путь относительно [корня проекта](/guide/#index-html-and-project-root). Для примера:

```js
export default defineConfig({
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
})
```

Когда указан `server.fs.allow`, автоматическое обнаружение корня рабочей области будет отключено. Чтобы расширить исходное поведение, предоставляется утилита `searchForWorkspaceRoot`:

```js
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: [
        // search up for workspace root
        searchForWorkspaceRoot(process.cwd()),
        // your custom rules
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

- **Тип:** `string[]`
- **По умолчанию:** `['.env', '.env.*', '*.{crt,pem}']`

Черный список для конфиденциальных файлов, обслуживание которых ограничено сервером Vite dev. Это будет иметь более высокий приоритет, чем [`server.fs.allow`](#server-fs-allow). Поддерживаются [шаблоны picomatch](https://github.com/micromatch/picomatch#globbing-features).

## server.origin

- **Тип:** `string`

Определяет источник сгенерированных URL-адресов активов во время разработки.

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **Тип:** `false | (sourcePath: string, sourcemapPath: string) => boolean`
- **По умолчанию:** `(sourcePath) => sourcePath.includes('node_modules')`

Следует ли игнорировать исходные файлы в исходной карте сервера, используемой для заполнения [расширения исходной карты `x_google_ignoreList`](https://developer.chrome.com/articles/x-google-ignore-list/).

`server.sourcemapIgnoreList` является эквивалентом [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) для сервера разработки. Разница между двумя параметрами конфигурации заключается в том, что функция свертки вызывается с относительным путем для `sourcePath`, а функция `server.sourcemapIgnoreList` вызывается с абсолютным путем. Во время разработки большинство модулей хранят карту и исходный код в одной папке, поэтому относительный путь для `sourcePath` — это само имя файла. В этих случаях вместо этого удобно использовать абсолютные пути.

По умолчанию он исключает все пути, содержащие `node_modules`. Вы можете передать `false`, чтобы отключить это поведение, или, для полного контроля, функцию, которая принимает исходный путь и путь к исходной карте и возвращает, следует ли игнорировать исходный путь.

```js
export default defineConfig({
  server: {
    // This is the default value, and will add all files with node_modules
    // in their paths to the ignore list.
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip Примечание
[`server.sourcemapIgnoreList`](#server-sourcemapignorelist) и [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) необходимо устанавливать независимо. `server.sourcemapIgnoreList` — это конфигурация, предназначенная только для сервера, и она не получает значение по умолчанию из определенных параметров объединения.
:::
