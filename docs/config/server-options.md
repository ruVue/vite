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

```js
// vite.config.js
import { defineConfig } from 'vite'
import dns from 'dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // omit
})
```

Во втором случае используются подстановочные знаки (например, `0.0.0.0`). Это связано с тем, что серверы, прослушивающие хосты без подстановочных знаков, имеют приоритет над серверами, прослушивающими хосты с подстановочными знаками.

:::

## server.port

- **Тип:** `number`
- **По умолчанию:** `5173`

Укажите порт сервера. Обратите внимание, что если порт уже используется, Vite автоматически попробует следующий доступный порт, поэтому это может быть не тот порт, который сервер в конечном итоге прослушивает.

## server.strictPort

- **Тип:** `boolean`

Установите значение `true`, чтобы выйти, если порт уже используется, вместо того, чтобы автоматически пытаться использовать следующий доступный порт.

## server.https

- **Тип:** `boolean | https.ServerOptions`

Включите TLS + HTTP/2. Обратите внимание, что переход на TLS происходит только в том случае, если также используется [опция `server.proxy`](#server-proxy).

Значение также может быть [объектом параметров](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener), переданным в `https.createServer()`.

Нужен действующий сертификат. Для базовой настройки вы можете добавить [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) в плагины проекта, которые будут автоматически создавать и кэшировать собственный -подписанный сертификат. Но мы рекомендуем создавать собственные сертификаты.

## server.open

- **Тип:** `boolean | string`

Автоматически открывать приложение в браузере при запуске сервера. Когда значение представляет собой строку, оно будет использоваться в качестве имени пути URL-адреса. Если вы хотите открыть сервер в определенном браузере, который вам нравится, вы можете установить env `process.env.BROWSER` (например, `firefox`). Подробнее смотрите [пакет `open`](https://github.com/sindresorhus/open#app).

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

Использует [`http-proxy`](https://github.com/http-party/node-http-proxy). Полные параметры [здесь](https://github.com/http-party/node-http-proxy#options).

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
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
      },
    },
  },
})
```

## server.cors

- **Тип:** `boolean | CorsOptions`

Настройте CORS для сервера разработки. Это включено по умолчанию и позволяет любое происхождение. Передайте [объект опций](https://github.com/expressjs/cors), чтобы точно настроить поведение, или `false`, чтобы отключить.

## server.headers

- **Тип:** `OutgoingHttpHeaders`

Укажите заголовки ответа сервера.

## server.hmr

- **Тип:** `boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean, clientPort?: number, server?: Server }`

Отключите или настройте соединение HMR (в случаях, когда веб-сокет HMR должен использовать адрес, отличный от http-сервера).

Установите для `server.hmr.overlay` значение `false`, чтобы отключить наложение ошибок сервера.

`clientPort` — это расширенный параметр, который переопределяет порт только на стороне клиента, позволяя вам обслуживать веб-сокет на порту, отличном от того, который ищет клиентский код.

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

## server.watch

- **Тип:** `object`

Параметры наблюдателя файловой системы для передачи [chokidar](https://github.com/paulmillr/chokidar#api).

Наблюдатель сервера Vite по умолчанию пропускает каталоги `.git/` и `node_modules/`. Если вы хотите просмотреть пакет внутри `node_modules/`, вы можете передать отрицательный шаблон glob в `server.watch.ignored`. То есть:

```js
export default defineConfig({
  server: {
    watch: {
      ignored: ['!**/node_modules/your-package-name/**'],
    },
  },
  // The watched package must be excluded from optimization,
  // so that it can appear in the dependency graph and trigger hot reload.
  optimizeDeps: {
    exclude: ['your-package-name'],
  },
})
```

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

```js
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

## server.base

- **Тип:** `string | undefined`

Добавляйте эту папку в HTTP-запросы для использования при проксировании vite в качестве подпапки. Должен начинаться с символа `/`.

## server.fs.strict

- **Тип:** `boolean`
- **По умолчанию:** `true` (enabled by default since Vite 2.7)

Ограничить обслуживание файлов за пределами корня рабочей области.

## server.fs.allow

- **Тип:** `string[]`

Ограничить файлы, которые можно обслуживать через `/@fs/`. Когда для `server.fs.strict` установлено значение `true`, доступ к файлам за пределами этого списка каталогов, которые не импортированы из разрешенного файла, приведет к ошибке 403.

Vite будет искать корень потенциального рабочего пространства и использовать его по умолчанию. Действительная рабочая область соответствует следующим условиям, в противном случае будет использоваться [корень проекта](/guide/#index-html-and-project-root).

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
        '/path/to/custom/allow',
      ],
    },
  },
})
```

## server.fs.deny

- **Тип:** `string[]`
- **По умолчанию:** `['.env', '.env.*', '*.{pem,crt}']`.

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
