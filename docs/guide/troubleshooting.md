# Исправление проблем

Дополнительную информацию также можно найти в [Руководстве по устранению неполадок Rollup](https://rollupjs.org/troubleshooting/).

Если приведенные здесь предложения не сработали, попробуйте задать вопросы на [обсуждениях GitHub](https://github.com/vitejs/vite/discussions) или на канале `#help` в [Vite Land Discord](https://chat.vite.dev).

## CJS

### Vite CJS Node API deprecated

The CJS build of Vite's Node API is deprecated and will be removed in Vite 6. See the [GitHub discussion](https://github.com/vitejs/vite/discussions/13928) for more context. You should update your files or frameworks to import the ESM build of Vite instead.

In a basic Vite project, make sure:

1. The `vite.config.js` file content is using the ESM syntax.
2. The closest `package.json` file has `"type": "module"`, or use the `.mjs`/`.mts` extension, e.g. `vite.config.mjs` or `vite.config.mts`.

For other projects, there are a few general approaches:

- **Configure ESM as default, opt-in to CJS if needed:** Add `"type": "module"` in the project `package.json`. All `*.js` files are now interpreted as ESM and need to use the ESM syntax. You can rename a file with the `.cjs` extension to keep using CJS instead.
- **Keep CJS as default, opt-in to ESM if needed:** If the project `package.json` does not have `"type": "module"`, all `*.js` files are interpreted as CJS. You can rename a file with the `.mjs` extension to use ESM instead.
- **Dynamically import Vite:** If you need to keep using CJS, you can dynamically import Vite using `import('vite')` instead. This requires your code to be written in an `async` context, but should still be manageable as Vite's API is mostly asynchronous.

If you're unsure where the warning is coming from, you can run your script with the `VITE_CJS_TRACE=true` flag to log the stack trace:

```bash
VITE_CJS_TRACE=true vite dev
```

If you'd like to temporarily ignore the warning, you can run your script with the `VITE_CJS_IGNORE_WARNING=true` flag:

```bash
VITE_CJS_IGNORE_WARNING=true vite dev
```

Note that postcss config files do not support ESM + TypeScript (`.mts` or `.ts` in `"type": "module"`) yet. If you have postcss configs with `.ts` and added `"type": "module"` to package.json, you'll also need to rename the postcss config to use `.cts`.

## CLI

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

Путь к папке вашего проекта может включать `&`, что не работает с `npm` в Windows ([npm/cmd-shim#45](https://github.com/npm/cmd-shim/issues/45)).

Вам нужно будет либо:

- Переключитесь на другой менеджер пакетов (например, `pnpm`, `yarn`)
- Удалите `&` из пути к вашему проекту

## Конфиг

### Этот пакет предназначен только для ESM

При импорте пакета только ESM с помощью `require` возникает следующая ошибка.

> Не удалось разрешить «foo». Этот пакет предназначен только для ESM, но его попыталась загрузить с помощью `require`.

> «foo» преобразован в файл ESM. Файл ESM не может быть загружен с помощью `require`.

Файлы ESM не могут быть загружены с помощью [`require`](<https://nodejs.org/docs/latest-v18.x/api/esm.html#require:~:text=Using%20require%20to%20load%20an%20ES%20module%20is%20not%20supported%20because%20ES%20modules%20have%20asynchronous%20execution.%20Instead%2C%20use%20import()%20to%20load%20an%20ES%20module%20from%20a%20CommonJS%20module.>).

Мы рекомендуем преобразовать вашу конфигурацию в ESM одним из следующих способов:

- добавление `"type": "module"` к ближайшему `package.json`
- переименование `vite.config.js`/`vite.config.ts` в `vite.config.mjs`/`vite.config.mts`

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

Для Ubuntu Linux вам может потребоваться добавить строку `* - nofile 65536` в файл `/etc/security/limits.conf` вместо обновления файлов конфигурации systemd.

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

> Сервер ответил кодом состояния 431. Смотрите https://vitejs.ru/guide/troubleshooting.html#_431-request-header-fields-too-large.

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

Если HMR не обрабатывается Vite или плагином, произойдет полная перезагрузка, поскольку это единственный способ обновить состояние.

Если HMR обрабатывается, но находится в циклической зависимости, также произойдет полная перезагрузка для восстановления порядка выполнения. Чтобы решить эту проблему, попробуйте разорвать цикл. Вы можете запустить `vite --debug hmr`, чтобы зарегистрировать циклический путь зависимости, если его вызвало изменение файла.

## Сборка

### Встроенный файл не работает из-за ошибки CORS

Если вывод HTML-файла был открыт с использованием протокола `file`, сценарии не будут запускаться со следующей ошибкой.

> Access to script at 'file:///foo/bar.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, isolated-app, chrome-extension, chrome, https, chrome-untrusted.

> Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at file:///foo/bar.js. (Reason: CORS request not http).

Смотрите [Причина: запрос CORS не HTTP - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp) для получения дополнительной информации о том, почему это происходит.

Вам нужно будет получить доступ к файлу по протоколу `http`. Самый простой способ добиться этого — запустить `npx vite preview`.

## Оптимизированные зависимости

### Устаревшие предустановленные пакеты при ссылке на локальный пакет

Хэш-ключ, используемый для аннулирования оптимизированных зависимостей, зависит от содержимого блокировки пакета, исправлений, примененных к зависимостям, и параметров в файле конфигурации Vite, которые влияют на связывание модулей узлов. Это означает, что Vite определит, когда зависимость переопределяется с помощью функции, такой как [npm overrides](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides), и повторно свяжет ваши зависимости при следующем запуске сервера. Vite не аннулирует зависимости, если вы используете функцию, такую ​​как [npm link](https://docs.npmjs.com/cli/v9/commands/npm-link). В случае, если вы связываете или отключаете зависимость, вам нужно будет принудительно выполнить повторную оптимизацию при следующем запуске сервера с помощью `vite --force`. Вместо этого мы рекомендуем использовать переопределения, которые теперь поддерживаются всеми менеджерами пакетов (см. также [переопределения pnpm](https://pnpm.io/package_json#pnpmoverrides) и [разрешения yarn](https://yarnpkg.com/configuration/manifest/#resolutions)).

## Узкие места производительности

Если у вас возникли узкие места в производительности приложения, приводящие к медленной загрузке, вы можете запустить встроенный инспектор Node.js на сервере разработки Vite или при создании приложения, чтобы создать профиль ЦП:

::: code-group

```bash [dev server]
vite --profile --open
```

```bash [build]
vite build --profile
```

:::

::: tip Vite Dev Server
Как только ваше приложение откроется в браузере, просто дождитесь завершения его загрузки, а затем вернитесь к терминалу и нажмите клавишу `p` (останавливает инспектор Node.js), затем нажмите клавишу `q`, чтобы остановить сервер разработки.
:::

Инспектор Node.js сгенерирует `vite-profile-0.cpuprofile` в корневой папке, перейдите на https://www.speedscope.app/ и загрузите профиль ЦП с помощью кнопки `BROWSE`, чтобы проверить результат.

Вы можете установить [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect), который позволяет вам проверять промежуточное состояние плагинов Vite, а также может помочь вам определить, какие плагины или мидлвара являются узкое место в ваших приложениях. Плагин можно использовать как в режиме разработки, так и в режиме сборки. Более подробную информацию можно найти в файле readme.

## Другие

### Модуль вынесен наружу для совместимости с браузером

Когда вы используете модуль Node.js в браузере, Vite выведет следующее предупреждение.

> Модуль «fs» вынесен наружу для совместимости с браузером. Невозможно получить доступ к «fs.readFile» в клиентском коде.

Это связано с тем, что Vite не выполняет автоматическое заполнение модулей Node.js.

Мы рекомендуем избегать модулей Node.js для кода браузера, чтобы уменьшить размер пакета, хотя вы можете добавлять полифилы вручную. Если модуль импортирован из сторонней библиотеки (которая предназначена для использования в браузере), рекомендуется сообщить о проблеме в соответствующую библиотеку.

### Синтаксическая ошибка / Ошибка типа

Vite не может обрабатывать и не поддерживает код, который работает только в нестрогом режиме (небрежный режим). Это связано с тем, что Vite использует ESM и всегда [строгий режим](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) внутри ESM.

Например, вы можете увидеть эти ошибки.

> [ОШИБКА] Операторы With нельзя использовать с форматом вывода «esm» из-за строгого режима.

> Ошибка типа: невозможно создать свойство «foo» для логического значения «false».

Если эти коды используются внутри зависимостей, вы можете использовать [`patch-package`](https://github.com/ds300/patch-package) (или [`yarn patch`](https://yarnpkg.com/cli/patch) или [`pnpm patch`](https://pnpm.io/cli/patch)) для аварийного выхода.

### Расширения браузера

Некоторые расширения браузера (например, блокировщики рекламы) могут препятствовать отправке клиентом Vite запросов на сервер разработки Vite. В этом случае вы можете увидеть белый экран без зарегистрированных ошибок. Попробуйте отключить расширения, если у вас возникла эта проблема.

### Перекрестные ссылки в Windows

Если в вашем проекте в Windows есть перекрестные ссылки, Vite может не работать.

Пример перекрестных ссылок:

- виртуальный диск, связанный с папкой командой `subst`
- символическая ссылка/переход на другой диск с помощью команды `mklink` (например, глобальный кеш Yarn)

Связанная проблема: [#10802](https://github.com/vitejs/vite/issues/10802)
