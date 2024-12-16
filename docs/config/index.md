---
title: Конфигурация Vite
---

# Конфигурирование Vite

При запуске `vite` из командной строки Vite автоматически попытается разрешить файл конфигурации с именем `vite.config.js` внутри [project root](/guide/#index-html-and-project-root) (другие JS и расширения TS также поддерживаются).

Самый простой файл конфигурации выглядит так:

```js
// vite.config.js
export default {
  // config options
}
```

Примечание. Vite поддерживает использование синтаксиса модулей ES в файле конфигурации, даже если проект не использует собственный Node ESM, например, `type: "module"` в `package.json`. В этом случае файл конфигурации автоматически предварительно обрабатывается перед загрузкой.

Вы также можете явно указать файл конфигурации для использования с параметром CLI `--config` (разрешено относительно `cwd`):

```bash
vite --config my-config.js
```

## Конфигурация IntelliSense

Поскольку Vite поставляется с типами TypeScript, вы можете использовать intellisense вашей IDE с помощью подсказок типа jsdoc:

```js
/** @type {import('vite').UserConfig} */
export default {
  // ...
}
```

В качестве альтернативы вы можете использовать хелпер `defineConfig`, который должен предоставлять IntelliSense без необходимости аннотаций jsdoc:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite также поддерживает файлы конфигурации TypeScript. Вы можете использовать `vite.config.ts` с вспомогательной функцией `defineConfig` выше или с оператором `satisfies`:

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

## Условная конфигурация

Если конфигурации необходимо условно определить параметры на основе команды (`serve` или `build`), используемого [режима](/guide/env-and-mode), если это сборка SSR (`isSsrBuild`), или выполняет предварительный просмотр сборки (`isPreview`), вместо этого он может экспортировать функцию:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // dev specific config
    }
  } else {
    // command === 'build'
    return {
      // build specific config
    }
  }
})
```

Важно отметить, что в API Vite значением `command` является `serve` во время разработки (в cli [`vite`](/guide/cli#vite), `vite dev` b `vite serve` являются псевдонимами), и `build` при сборке для производства ([`vite build`](/guide/cli#vite-build)).

`isSsrBuild` и `isPreview` — это дополнительные необязательные флаги, позволяющие различать типы команд `build` и `serve` соответственно. Некоторые инструменты, загружающие конфигурацию Vite, могут не поддерживать эти флаги и вместо этого передавать `undefined`. Следовательно, рекомендуется использовать явное сравнение с `true` и `false`.

## Асинхронная конфигурация

Если конфигурации необходимо вызывать асинхронные функции, вместо этого она может экспортировать асинхронную функцию. Эту асинхронную функцию также можно передать через `defineConfig` для улучшения поддержки intellisense:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // vite config
  }
})
```

## Использование переменных среды в конфигурации

Переменные окружения можно получить, как обычно, из `process.env`.

Обратите внимание, что Vite не загружает файлы `.env` по умолчанию, поскольку файлы для загрузки можно определить только после оценки конфигурации Vite, например, параметры `root` и `envDir` влияют на поведение загрузки. Однако вы можете использовать экспортированный помощник `loadEnv` для загрузки определенного файла `.env`, если это необходимо.

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
```
