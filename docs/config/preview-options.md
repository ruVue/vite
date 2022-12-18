# Параметры предварительного просмотра

## preview.host

- **Тип:** `string | boolean`
- **По умолчанию:** [`server.host`](./server-options#server-host)

Укажите, какие IP-адреса сервер должен прослушивать.
Установите для этого параметра значение `0.0.0.0` или `true`, чтобы прослушивать все адреса, включая локальные и общедоступные адреса.

Это можно установить через CLI, используя `--host 0.0.0.0` или `--host`.

::: tip ПРИМЕЧАНИЕ

There are cases when other servers might respond instead of Vite.
See [`server.host`](./server-options#server-host) for more details.

:::

## preview.port

- **Тип:** `number`
- **По умолчанию:** `4173`

Укажите порт сервера. Обратите внимание, что если порт уже используется, Vite автоматически попробует следующий доступный порт, поэтому это может быть не тот порт, который сервер в конечном итоге прослушивает.

**Пример:**

```js
export default defineConfig({
  server: {
    port: 3030,
  },
  preview: {
    port: 8080,
  },
})
```

## preview.strictPort

- **Тип:** `boolean`
- **По умолчанию:** [`server.strictPort`](./server-options#server-strictport)

Установите значение `true`, чтобы выйти, если порт уже используется, вместо того, чтобы автоматически пытаться использовать следующий доступный порт.

## preview.https

- **Тип:** `boolean | https.ServerOptions`
- **По умолчанию:** [`server.https`](./server-options#server-https)

Включите TLS + HTTP/2. Обратите внимание, что переход на TLS происходит только в том случае, если также используется опция [`server.proxy` option](./server-options#server-proxy).

Значение также может быть [объектом параметров](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener), переданным в `https.createServer()`.

## preview.open

- **Тип:** `boolean | string`
- **По умолчанию:** [`server.open`](./server-options#server-open)

Автоматически открывать приложение в браузере при запуске сервера. Когда значение представляет собой строку, оно будет использоваться в качестве имени пути URL-адреса. Если вы хотите открыть сервер в определенном браузере, который вам нравится, вы можете установить env `process.env.BROWSER` (например, `firefox`). Подробнее смотрите [пакет `open`](https://github.com/sindresorhus/open#app).

## preview.proxy

- **Тип:** `Record<string, string | ProxyOptions>`
- **По умолчанию:** [`server.proxy`](./server-options#server-proxy)

Настройте пользовательские правила прокси для сервера предварительного просмотра. Ожидает объект пар `{ key: options }`. Если ключ начинается с `^`, он будет интерпретирован как `RegExp`. Параметр `configure` можно использовать для доступа к экземпляру прокси.

Использует [`http-proxy`](https://github.com/http-party/node-http-proxy). Полные параметры [здесь](https://github.com/http-party/node-http-proxy#options).

## preview.cors

- **Тип:** `boolean | CorsOptions`
- **По умолчанию:** [`server.cors`](./server-options#server-cors)

Настройте CORS для сервера предварительного просмотра. Это включено по умолчанию и позволяет любое происхождение. Передайте [options object](https://github.com/expressjs/cors), чтобы точно настроить поведение, или `false`, чтобы отключить.

## preview.headers

- **Тип:** `OutgoingHttpHeaders`

Укажите заголовки ответа сервера.
