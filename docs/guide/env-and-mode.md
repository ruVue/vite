# Переменные окружения и режимы

## Переменные окружения

Vite выставляет переменные env на специальном объекте **`import.meta.env`**, которые статически заменяются во время сборки. Некоторые встроенные переменные доступны во всех случаях:

- **`import.meta.env.MODE`**: {string} [режим](#modes), в котором работает приложение.

- **`import.meta.env.BASE_URL`**: {string} базовый URL-адрес, с которого обслуживается приложение. Это определяется [параметром конфигурации `base`](/config/shared-options.md#base).

- **`import.meta.env.PROD`**: {boolean}, работает ли приложение в рабочей среде (запускается сервер разработки с `NODE_ENV='production'` или приложение, созданное с `NODE_ENV='production'`).

- **`import.meta.env.DEV`**: {boolean} указывает, находится ли приложение в разработке (всегда противоположно `import.meta.env.PROD`)

- **`import.meta.env.SSR`**: {boolean}, работает ли приложение на [сервере](./ssr.md#conditional-logic).

## Файлы `.env`

Vite использует [dotenv](https://github.com/motdotla/dotenv) для загрузки дополнительных переменных среды из следующих файлов в вашем [каталоге среды](/config/shared-options.md#envdir):

```
.env                # загружается во всех случаях
.env.local          # загружается во всех случаях, игнорируется git
.env.[mode]         # загружается только в указанном режиме
.env.[mode].local   # загружается только в указанном режиме, игнорируется git
```

:::tip Приоритеты загрузки окружения

Файл env для определенного режима (например, `.env.production`) будет иметь более высокий приоритет, чем общий файл (например, `.env`).

Vite всегда будет загружать `.env` и `.env.local` в дополнение к файлу `.env.[mode]`, специфичному для режима. Переменные, объявленные в файлах, специфичных для режима, будут иметь приоритет над переменными в общих файлах, но переменные, определенные только в `.env` или `.env.local`, по-прежнему будут доступны в среде.

Кроме того, переменные среды, которые уже существуют при запуске Vite, имеют наивысший приоритет и не будут перезаписаны файлами `.env`. Например, при запуске `VITE_SOME_KEY=123 vite build`.

Файлы `.env` загружаются при запуске Vite. Перезапустите сервер после внесения изменений.
:::

Загруженные переменные env также отображаются в исходном коде вашего клиента через `import.meta.env` в виде строк.

Чтобы предотвратить случайную утечку переменных env клиенту, только переменные с префиксом `VITE_` доступны вашему коду, обработанному Vite. например для следующих переменных env:

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

Только `VITE_SOME_KEY` будет отображаться как `import.meta.env.VITE_SOME_KEY` в исходном коде вашего клиента, но `DB_PASSWORD` не будет.

```js
console.log(import.meta.env.VITE_SOME_KEY) // "123"
console.log(import.meta.env.DB_PASSWORD) // undefined
```

:::tip Разбор Env

Как показано выше, `VITE_SOME_KEY` — это число, но при анализе оно возвращает строку. То же самое произойдет и с логическими переменными env. Обязательно преобразуйте его в нужный тип при использовании его в своем коде.
:::

Также Vite использует [dotenv-expand](https://github.com/motdotla/dotenv-expand) для расширения переменных, записанных в env-файлах из коробки. Чтобы узнать больше о синтаксисе, ознакомьтесь с [их документацией](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow).

Обратите внимание, что если вы хотите использовать `$` внутри значения вашей среды, вы должны экранировать его с помощью `\`.

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

If you want to customize the env variables prefix, see the [envPrefix](/config/shared-options.html#envprefix) option.

:::warning ЗАМЕЧАНИЯ ПО БЕЗОПАСНОСТИ

- Файлы `.env.*.local` предназначены только для локального использования и могут содержать конфиденциальные переменные. Вы должны добавить `*.local` к вашему `.gitignore`, чтобы избежать их проверки в git.

- Поскольку любые переменные, открытые для вашего исходного кода Vite, попадут в ваш клиентский пакет, переменные `VITE_*` _не_ должны содержать никакой конфиденциальной информации.
  :::

### IntelliSense для TypeScript

По умолчанию Vite предоставляет определения типов для `import.meta.env` в [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts). Хотя вы можете определить дополнительные пользовательские переменные окружения в файлах `.env.[mode]`, вы можете захотеть получить TypeScript IntelliSense для определяемых пользователем переменных окружения с префиксом `VITE_`.

Чтобы добиться этого, вы можете создать `vite-env.d.ts` в каталоге `src`, а затем дополнить `ImportMetaEnv` следующим образом:

```typescript [vite-env.d.ts]
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Если ваш код использует типы из сред браузера, таких как [DOM](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts) и [WebWorker](https://github.com/microsoft/TypeScript/blob/main/src/lib/webworker.generated.d.ts), вы можете обновить поле [lib](https://www.typescriptlang.org/tsconfig#lib) в `tsconfig.json`.

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning Импорт нарушит расширение типов

Если дополнение `ImportMetaEnv` не работает, убедитесь, что у вас нет операторов `import` в `vite-env.d.ts`. Дополнительную информацию смотрите в [документации TypeScript](https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined).
:::

## Замена HTML Env

Vite также поддерживает замену переменных env в файлах HTML. Любые свойства в `import.meta.env` могут использоваться в HTML-файлах со специальным синтаксисом `%ENV_NAME%`:

```html
<h1>Vite работает в %MODE%</h1>
<p>Использование данных из %VITE_API_URL%</p>
```

Если env не существует в `import.meta.env`, например, `%NON_EXISTENT%`, он будет игнорироваться и не заменяться, в отличие от `import.meta.env.NON_EXISTENT` в JS, где он заменяется на `undefined`.

Учитывая, что Vite используется многими фреймворками, он намеренно не относится к сложным заменам, таким как условные выражения. Vite можно расширить с помощью [существующего плагина пользовательской среды](https://github.com/vitejs/awesome-vite#transformers) или специального плагина, реализующего [хук `transformIndexHtml`](./api-plugin#transformindexhtml).

## Режимы

По умолчанию сервер разработки (команда `dev`) работает в режиме `development`, а команда `build` запускается в режиме `production`.

Это означает, что при запуске `vite build`, он будет загружать переменные env из `.env.production`, если они есть:

```
# .env.production
VITE_APP_TITLE=My App
```

В своем приложении вы можете отобразить заголовок с помощью `import.meta.env.VITE_APP_TITLE`.

В некоторых случаях вам может понадобиться запустить `vite build` в другом режиме, чтобы отобразить другой заголовок. Вы можете перезаписать режим по умолчанию, используемый для команды, передав флаг опции `--mode`. Например, если вы хотите создать приложение для промежуточного режима:

```bash
vite build --mode staging
```

And create a `.env.staging` file:

```
# .env.staging
VITE_APP_TITLE=My App (staging)
```

Поскольку `vite build` по умолчанию запускает производственную сборку, вы также можете изменить это и запустить сборку для разработки, используя другой режим и конфигурацию файла `.env`:

```
# .env.testing
NODE_ENV=development
```

## NODE_ENV и Режимы

Важно отметить, что `NODE_ENV` (`process.env.NODE_ENV`) и режимы — это два разных понятия. Вот как разные команды влияют на `NODE_ENV` и режим:

| Команда                                              | NODE_ENV        | Режим           |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

Различные значения `NODE_ENV` и mode также отражаются на соответствующих свойствах `import.meta.env`:

| Команда                | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| Команда              | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `NODE_ENV` в файлах `.env`

`NODE_ENV=...` можно установить в команде, а также в вашем файле `.env`. Если `NODE_ENV` указан в файле `.env.[mode]`, режим можно использовать для управления его значением. Однако и `NODE_ENV`, и режимы остаются двумя разными понятиями.

Основное преимущество команды `NODE_ENV=...` заключается в том, что она позволяет Vite обнаружить значение на ранней стадии. Это также позволяет вам читать `process.env.NODE_ENV` в вашей конфигурации Vite, поскольку Vite может загружать файлы env только после оценки конфигурации.
:::
