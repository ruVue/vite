# Исправление проблем

Смотрите [Руководство по устранению неполадок Rollup](https://rollupjs.org/guide/en/#troubleshooting) для получения дополнительной информации.

Если приведенные здесь предложения не работают, попробуйте опубликовать вопросы в [Обсуждения GitHub](https://github.com/vitejs/vite/discussions) или на канале `#help` в [Vite Land Discord](https://chat.vitejs.dev).

## CLI

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

Путь к папке вашего проекта может включать `&`, что не работает с `npm` в Windows ([npm/cmd-shim#45](https://github.com/npm/cmd-shim/issues/45)).

Вам нужно будет либо:

- Переключитесь на другой менеджер пакетов (например, `pnpm`, `yarn`)
- Удалите `&` из пути к вашему проекту

## Сервер разработки

### Запросы задерживаются навсегда

Если вы используете Linux, причиной проблемы могут быть ограничения файловых дескрипторов и ограничения inotify. Поскольку Vite не объединяет большинство файлов, браузеры могут запрашивать много файлов, для которых требуется много файловых дескрипторов, что превышает лимит.

Чтобы решить эту проблему:

- Увеличьте лимит дескриптора файла на `ulimit`

  ```shell
  # Check current limit
  $ ulimit -Sn
  # Change limit (temporary)
  $ ulimit -Sn 10000 # You might need to change the hard limit too
  # Restart your browser
  ```

- Увеличьте следующие ограничения, связанные с inotify, с помощью `sysctl`

  ```shell
  # Check current limits
  $ sysctl fs.inotify
  # Change limits (temporary)
  $ sudo sysctl fs.inotify.max_queued_events=16384
  $ sudo sysctl fs.inotify.max_user_instances=8192
  $ sudo sysctl fs.inotify.max_user_watches=524288
  ```

Если описанные выше шаги не сработали, вы можете попробовать добавить `DefaultLimitNOFILE=65536` в качестве незакомментированной конфигурации в следующие файлы:

- /etc/systemd/system.conf
- /etc/systemd/user.conf

Обратите внимание, что эти настройки сохраняются, но **требуется перезагрузка**.

### Сетевые запросы перестают загружаться

При использовании самозаверяющего SSL-сертификата Chrome игнорирует все директивы кэширования и перезагружает содержимое. Vite полагается на эти директивы кэширования.

Чтобы решить эту проблему, используйте доверенный сертификат SSL.

Смотрите: [Проблемы с кэшем](https://helpx.adobe.com/mt/experience-manager/kb/cache-problems-on-chrome-with-SSL-certificate-errors.html), [Chrome issue](https://bugs.chromium.org/p/chromium/issues/detail?id=110649#c8)

#### macOS

Вы можете установить доверенный сертификат через интерфейс командной строки с помощью этой команды:

```
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db your-cert.cer
```

Или импортируйте его в приложение Keychain Access и обновите доверие вашего сертификата до "Always Trust."

### 431 Поля заголовка запроса слишком велики

Когда сервер / сервер WebSocket получает большой HTTP-заголовок, запрос будет отброшен, и будет показано следующее предупреждение.

> Server responded with status code 431. See https://vitejs.ru/guide/troubleshooting.html#_431-request-header-fields-too-large.

Это связано с тем, что Node.js ограничивает размер заголовка запроса для смягчения последствий [CVE-2018-12121](https://www.cve.org/CVERecord?id=CVE-2018-12121).

Чтобы этого избежать, попробуйте уменьшить размер заголовка запроса. Например, если файл cookie длинный, удалите его. Или вы можете использовать [`--max-http-header-size`](https://nodejs.org/api/cli.html#--max-http-header-sizesize), чтобы изменить максимальный размер заголовка.

## HMR

### Vite обнаруживает изменение файла, но HMR не работает

Возможно, вы импортируете файл с другим регистром. Например, `src/foo.js` существует, а `src/bar.js` содержит:

```js
import './Foo.js' // should be './foo.js'
```

Связанная проблема: [#964](https://github.com/vitejs/vite/issues/964)

### Vite не обнаруживает изменение файла

Если вы используете Vite с WSL2, Vite не может отслеживать изменения файлов в некоторых условиях. Смотрите [параметр `server.watch`](/config/server-options.md#server-watch).

### Происходит полная перезагрузка вместо HMR

Если HMR не обрабатывается Vite или плагином, произойдет полная перезагрузка.

Также, если есть цикл зависимости, произойдет полная перезагрузка. Чтобы решить эту проблему, попробуйте удалить цикл.

### Большое количество обновлений HMR в консоли

Это может быть вызвано циклической зависимостью. Чтобы решить эту проблему, попробуйте разорвать цикл.

## Сборка

### Встроенный файл не работает из-за ошибки CORS

Если вывод HTML-файла был открыт с использованием протокола `file`, сценарии не будут запускаться со следующей ошибкой.

> Access to script at 'file:///foo/bar.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, isolated-app, chrome-extension, chrome, https, chrome-untrusted.

> Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at file:///foo/bar.js. (Reason: CORS request not http).

Смотрите [Причина: запрос CORS не HTTP - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp) для получения дополнительной информации о том, почему это происходит.

Вам нужно будет получить доступ к файлу по протоколу `http`. Самый простой способ добиться этого — запустить `npx vite preview`.

## Другие

### Произошла ошибка синтаксиса/ошибка типа

Vite не может обрабатывать и не поддерживает код, который работает только в нестрогом режиме (небрежный режим). Это связано с тем, что Vite использует ESM и всегда [строгий режим](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) внутри ESM.

Например, вы можете увидеть эти ошибки.

> [ERROR] With statements cannot be used with the "esm" output format due to strict mode

> TypeError: Cannot create property 'foo' on boolean 'false'

Если этот код используется внутри зависимостей, вы можете использовать [`patch-package`](https://github.com/ds300/patch-package) (или [`yarn patch`](https://yarnpkg.com/cli/patch) или [`pnpm patch`](https://pnpm.io/cli/patch)) для эвакуационного люка.
