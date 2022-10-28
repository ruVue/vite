# Сборка для продакшена

Когда придет время развернуть ваше приложение для производства, просто запустите команду `vite build`. По умолчанию он использует `<root>/index.html` в качестве точки входа для сборки и создает пакет приложений, который подходит для обслуживания через службу статического хостинга. Ознакомьтесь с руководствами по популярным службам [Развертывание статического сайта](./static-deploy).

## Совместимость с браузером

Рабочий комплект предполагает поддержку современного JavaScript. По умолчанию Vite нацелен на браузеры, которые поддерживают [нативные модули ES](https://caniuse.com/es6-module), [динамический импорт нативного ESM](https://caniuse.com/es6-module-dynamic-import) и [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta):

- Chrome >=87
- Firefox >=78
- Safari >=13
- Edge >=88

Вы можете указать пользовательские цели с помощью [опции конфигурации `build.target`](/config/build-options.md#build-target), где самой низкой целью является `es2015`.

Обратите внимание, что по умолчанию Vite обрабатывает только синтаксические преобразования и **по умолчанию не распространяется на полифиллы**. Вы можете проверить [Polyfill.io](https://polyfill.io/v3/), который представляет собой сервис, который автоматически генерирует пакеты полифилла на основе строки UserAgent браузера пользователя.

Устаревшие браузеры могут поддерживаться через [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy), который будет автоматически генерировать устаревшие фрагменты и соответствующие полифиллы функций языка ES. Устаревшие фрагменты условно загружаются только в браузерах, которые не имеют встроенной поддержки ESM.

## Публичный базовый путь

- Похожие: [Управление ресурсами](./assets)

Если вы развертываете свой проект по вложенному общедоступному пути, просто укажите [параметр конфигурации `base`](/config/shared-options.md#base), и все пути ресурсов будут соответствующим образом переписаны. Этот параметр также может быть указан как флаг командной строки, например, `vite build --base=/my/public/path/`.

URL-адреса ресурсов, импортированные из JS, ссылки CSS `url()` и ссылки на ресурсы в ваших файлах `.html` автоматически настраиваются с учетом этой опции во время сборки.

Исключение составляют случаи, когда вам нужно динамически объединять URL-адреса на лету. В этом случае вы можете использовать глобально внедренную переменную `import.meta.env.BASE_URL`, которая будет общедоступным базовым путем. Обратите внимание, что эта переменная статически заменяется во время сборки, поэтому она должна отображаться в точности как есть (т. е. `import.meta.env['BASE_URL']` не будет работать).

Для расширенного управления базовым путем ознакомьтесь с [Дополнительными базовыми параметрами](#advanced-base-options).

## Настройка сборки

Сборку можно настроить с помощью различных [параметров конфигурации сборки](/config/build-options.md). В частности, вы можете напрямую настроить базовые [Параметры объединения](https://rollupjs.org/guide/en/#big-list-of-options) с помощью `build.rollupOptions`:

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#big-list-of-options
    }
  }
})
```

Например, вы можете указать несколько выходных данных Rollup с подключаемыми модулями, которые применяются только во время сборки.

## Стратегия разделения

Вы можете настроить разделение фрагментов с помощью `build.rollupOptions.output.manualChunks` (смотрите [документацию Rollup](https://rollupjs.org/guide/en/#outputmanualchunks)). До Vite 2.8 стратегия разделения по умолчанию разделяла куски на `index` и `vendor`. Это хорошая стратегия для некоторых SPA, но сложно найти общее решение для каждого целевого варианта использования Vite. Начиная с Vite 2.9, `manualChunks` больше не изменяется по умолчанию. Вы можете продолжать использовать стратегию Split Vendor Chunk, добавив `splitVendorChunkPlugin` в свой файл конфигурации:

```js
// vite.config.js
import { splitVendorChunkPlugin } from 'vite'
export default defineConfig({
  plugins: [splitVendorChunkPlugin()]
})
```

Эта стратегия также предоставляется как фабрика `splitVendorChunk({ cache: SplitVendorChunkCache })`, если требуется композиция с пользовательской логикой. `cache.reset()` необходимо вызвать в `buildStart`, чтобы в этом случае режим наблюдения за сборкой работал правильно.

## Восстановить при изменении файлов

Вы можете включить наблюдатель сводки с помощью `vite build --watch`. Или вы можете напрямую настроить базовые [`WatcherOptions`](https://rollupjs.org/guide/en/#watch-options) через `build.watch`:

```js
// vite.config.js
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/guide/en/#watch-options
    }
  }
})
```

При включенном флаге `--watch` изменения в `vite.config.js`, а также любые файлы, которые должны быть объединены, вызовут перестроение.

## Многостраничное приложение

Предположим, у вас есть следующая структура исходного кода:

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

Во время разработки просто перейдите или дайте ссылку на `/nested/` — он работает так, как и ожидалось, как и для обычного статического файлового сервера.

Во время сборки все, что вам нужно сделать, это указать несколько файлов `.html` в качестве точек входа:

```js
// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html')
      }
    }
  }
})
```

Если вы укажете другой корень, помните, что `__dirname` по-прежнему будет папкой вашего файла vite.config.js при разрешении входных путей. Поэтому вам нужно будет добавить свою `root` запись в аргументы для `resolve`.

## Библиотечный режим

Когда вы разрабатываете ориентированную на браузер библиотеку, вы, вероятно, проводите большую часть времени на тестовой/демонстрационной странице, которая импортирует вашу настоящую библиотеку. С Vite вы можете использовать свой `index.html` для этой цели, чтобы получить беспрепятственный опыт разработки.

Когда придет время собрать вашу библиотеку для распространения, используйте [опцию конфигурации `build.lib`](/config/build-options.md#build-lib). Не забудьте также внедрить любые зависимости, которые вы не хотите объединять в свою библиотеку, например, `vue` или `react`:

```js
// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // the proper extensions will be added
      fileName: 'my-lib'
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

Файл входа будет содержать экспорты, которые могут быть импортированы пользователями вашего пакета:

```js
// lib/main.js
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

Запуск `vite build` с этой конфигурацией использует предустановку Rollup, ориентированную на поставляемые библиотеки, и создает два формата пакетов: `es` и `umd` (настраивается через `build.lib`):

```
$ vite build
building for production...
dist/my-lib.js      0.08 KiB / gzip: 0.07 KiB
dist/my-lib.umd.cjs 0.30 KiB / gzip: 0.16 KiB
```

Рекомендуемый `package.json` для вашей библиотеки:

```json
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

Или, если выставлено несколько точек входа:

```json
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.mjs",
  "exports": {
    ".": {
      "import": "./dist/my-lib.mjs",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.mjs",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

::: tip Note
If the `package.json` does not contain `"type": "module"`, Vite will generate different file extensions for Node.js compatibility. `.js` will become `.mjs` and `.cjs` will become `.js`.
:::

::: tip Environment Variables
In library mode, all `import.meta.env.*` usage are statically replaced when building for production. However, `process.env.*` usage are not, so that consumers of your library can dynamically change it. If this is undesirable, you can use `define: { 'process.env.`<wbr>`NODE_ENV': '"production"' }` for example to statically replace them.
:::

## Advanced Base Options

::: warning
This feature is experimental, the API may change in a future minor without following semver. Please always pin Vite's version to a minor when using it.
:::

For advanced use cases, the deployed assets and public files may be in different paths, for example to use different cache strategies.
A user may choose to deploy in three different paths:

- The generated entry HTML files (which may be processed during SSR)
- The generated hashed assets (JS, CSS, and other file types like images)
- The copied [public files](assets.md#the-public-directory)

A single static [base](#public-base-path) isn't enough in these scenarios. Vite provides experimental support for advanced base options during build, using `experimental.renderBuiltUrl`.

```ts
experimental: {
  renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
    if (hostType === 'js') {
      return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
    } else {
      return { relative: true }
    }
  }
}
```

If the hashed assets and public files aren't deployed together, options for each group can be defined independently using asset `type` included in the second `context` param given to the function.

```ts
experimental: {
  renderBuiltUrl(filename: string, { hostId, hostType, type }: { hostId: string, hostType: 'js' | 'css' | 'html', type: 'public' | 'asset' }) {
    if (type === 'public') {
      return 'https://www.domain.com/' + filename
    }
    else if (path.extname(hostId) === '.js') {
      return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` }
    }
    else {
      return 'https://cdn.domain.com/assets/' + filename
    }
  }
}
```
