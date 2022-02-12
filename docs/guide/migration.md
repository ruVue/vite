# Миграция с v1

## Изменение параметров конфигурации

- Следующие параметры были удалены и должны быть реализованы через [плагины](./api-plugin):

  - `resolvers`
  - `transforms`
  - `indexHtmlTransforms`

- удалены `jsx` и `enableEsbuild` Вместо этого используйте новую опцию [`esbuild`](/config/#esbuild).

- [Параметры, связанные с CSS](/config/#css-modules) теперь вложены в `css`.

- Все [параметры сборки](/config/#build-options) теперь вложены в `build`.

  - `rollupInputOptions` и `rollupOutputOptions` заменены на [`build.rollupOptions`](/config/#build-rollupoptions).
  - `esbuildTarget` теперь [`build.target`](/config/#build-target).
  - `emitManifest` теперь [`build.manifest`](/config/#build-manifest).
  - Следующие параметры сборки были удалены, так как они могут быть достигнуты с помощью хуков плагинов или других параметров:
    - `entry`
    - `rollupDedupe`
    - `emitAssets`
    - `emitIndex`
    - `shouldPreload`
    - `configureBuild`

- Все [специфичные для сервера параметры](/config/#server-options) теперь вложены в
  `server`.

  - `hostname` теперь [`server.host`](/config/#server-host).
  - `httpsOptions` был удален. [`server.https`](/config/#server-https) может напрямую принимать объект параметров.
  - `chokidarWatchOptions` теперь [`server.watch`](/config/#server-watch).

- [`assetsInclude`](/config/#assetsinclude) теперь ожидает `string | RegExp | (string | RegExp)[]` вместо функции.

- Все специфичные для Vue параметры удалены; Вместо этого передайте параметры плагину Vue.

## Изменение поведения псевдонима

[`alias`](/config/#resolve-alias) теперь передается в `@rollup/plugin-alias` и больше не требует начальной/конечной косой черты. Поведение теперь является прямой заменой, поэтому ключ псевдонима каталога в стиле 1.0 должен удалить косую черту в конце:

```diff
- alias: { '/@foo/': path.resolve(__dirname, 'some-special-dir') }
+ alias: { '/@foo': path.resolve(__dirname, 'some-special-dir') }
```

Кроме того, вы можете использовать формат опции `[{ find: RegExp, replacement: string }]` для более точного управления.

## Поддержка Vue

Vite 2.0 core теперь не зависит от фреймворка. Поддержка Vue теперь предоставляется через [`@vitejs/plugin-vue`](https://github.com/vitejs/vite/tree/main/packages/plugin-vue). Просто установите его и добавьте в конфигурацию Vite:

```js
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()]
})
```

### Преобразования пользовательских блоков

Пользовательский плагин можно использовать для преобразования пользовательских блоков Vue, как показано ниже:

```ts
// vite.config.js
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const vueI18nPlugin = {
  name: 'vue-i18n',
  transform(code, id) {
    if (!/vue&type=i18n/.test(id)) {
      return
    }
    if (/\.ya?ml$/.test(id)) {
      code = JSON.stringify(require('js-yaml').load(code.trim()))
    }
    return `export default Comp => {
      Comp.i18n = ${code}
    }`
  }
}

export default defineConfig({
  plugins: [vue(), vueI18nPlugin]
})
```

## Поддержка React

Поддержка React Fast Refresh теперь предоставляется через [`@vitejs/plugin-react`](https://github.com/vitejs/vite/tree/main/packages/plugin-react).

## Изменение HMR API

`import.meta.hot.acceptDeps()` устарело. [`import.meta.hot.accept()`](./api-hmr#hot-accept-deps-cb) теперь может принимать одно или несколько отложений.

## Изменение формата манифеста

Манифест сборки теперь использует следующий формат:

```json
{
  "index.js": {
    "file": "assets/index.acaf2b48.js",
    "imports": [...]
  },
  "index.css": {
    "file": "assets/index.7b7dbd85.css"
  }
  "asset.png": {
    "file": "assets/asset.0ab0f9cd.png"
  }
}
```

Для входных фрагментов JS также перечислены импортированные фрагменты, которые можно использовать для рендеринга директив предварительной загрузки.

## Для авторов плагинов

Vite 2 использует полностью переработанный интерфейс плагинов, который расширяет плагины Rollup. Пожалуйста, прочтите новое [Руководство по разработке плагинов](./api-plugin).

Некоторые общие указания по переносу плагина версии 1 на версию 2:

- `resolvers` -> используйте хук [`resolveId`](https://rollupjs.org/guide/en/#resolveid)
- `transforms` -> используйте хук [`transform`](https://rollupjs.org/guide/en/#transform)
- `indexHtmlTransforms` -> используйте хук [`transformIndexHtml`](./api-plugin#transformindexhtml)
- Обслуживание виртуальных файлов -> используйте хуки [`resolveId`](https://rollupjs.org/guide/en/#resolveid) + [`load`](https://rollupjs.org/guide/en/#load)
- Добавление `alias`, `define` или других параметров конфигурации -> используйте хук [`config`](./api-plugin#config)

Поскольку большая часть логики должна выполняться с помощью подключаемых модулей, а не промежуточного программного обеспечения, потребность в промежуточном программном обеспечении значительно снижается. Внутреннее серверное приложение теперь представляет собой старый добрый экземпляр [connect](https://github.com/senchalabs/connect) вместо Koa.
