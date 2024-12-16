# Сборка для продакшена

Когда придет время развернуть ваше приложение для производства, просто запустите команду `vite build`. По умолчанию он использует `<root>/index.html` в качестве точки входа для сборки и создает пакет приложений, который подходит для обслуживания через службу статического хостинга. Ознакомьтесь с руководствами по популярным службам [Развертывание статического сайта](./static-deploy).

## Совместимость с браузером

Рабочий комплект предполагает поддержку современного JavaScript. По умолчанию Vite нацелен на браузеры, которые поддерживают [нативные модули ES](https://caniuse.com/es6-module), [динамический импорт нативного ESM](https://caniuse.com/es6-module-dynamic-import) и [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta):

- Chrome >=87
- Firefox >=78
- Safari >=14
- Edge >=88

Вы можете указать пользовательские цели с помощью [опции конфигурации `build.target`](/config/build-options.md#build-target), где самой низкой целью является `es2015`.

Обратите внимание, что по умолчанию Vite обрабатывает только преобразования синтаксиса и **не охватывает полифиллы**. Вы можете проверить https://cdnjs.cloudflare.com/polyfill/, который автоматически генерирует пакеты полифиллов на основе строки UserAgent браузера пользователя.

Устаревшие браузеры могут поддерживаться через [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy), который будет автоматически генерировать устаревшие фрагменты и соответствующие полифиллы функций языка ES. Устаревшие фрагменты условно загружаются только в браузерах, которые не имеют встроенной поддержки ESM.

## Публичный базовый путь

- Похожие: [Управление ресурсами](./assets)

Если вы развертываете свой проект по вложенному общедоступному пути, просто укажите [параметр конфигурации `base`](/config/shared-options.md#base), и все пути ресурсов будут соответствующим образом переписаны. Этот параметр также может быть указан как флаг командной строки, например, `vite build --base=/my/public/path/`.

URL-адреса ресурсов, импортированные из JS, ссылки CSS `url()` и ссылки на ресурсы в ваших файлах `.html` автоматически настраиваются с учетом этой опции во время сборки.

Исключение составляют случаи, когда вам нужно динамически объединять URL-адреса на лету. В этом случае вы можете использовать глобально внедренную переменную `import.meta.env.BASE_URL`, которая будет общедоступным базовым путем. Обратите внимание, что эта переменная статически заменяется во время сборки, поэтому она должна отображаться в точности как есть (т. е. `import.meta.env['BASE_URL']` не будет работать).

Для расширенного управления базовым путем ознакомьтесь с [Дополнительными базовыми параметрами](#advanced-base-options).

## Настройка сборки

Сборку можно настроить с помощью различных [параметров конфигурации сборки](/config/build-options.md). В частности, вы можете напрямую настроить базовые [параметры Rollup ](https://rollupjs.org/configuration-options/) через `build.rollupOptions`:

```js
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
})
```

Например, вы можете указать несколько выходных данных Rollup с подключаемыми модулями, которые применяются только во время сборки.

## Стратегия разделения

Вы можете настроить способ разделения фрагментов с помощью `build.rollupOptions.output.manualChunks` (смотрите [Документацию Rollup](https://rollupjs.org/configuration-options/#output-manualchunks)). Если вы используете фреймворк, обратитесь к его документации для настройки способа разделения фрагментов.

## Обработка ошибок загрузки

Vite генерирует событие `vite:preloadError`, когда не удается загрузить динамический импорт. `event.payload` содержит исходную ошибку импорта. Если вы вызовете `event.preventDefault()`, ошибка не будет выдана.

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // for example, refresh the page
})
```

При новом развертывании служба хостинга может удалить ресурсы из предыдущих развертываний. В результате пользователь, посетивший ваш сайт до нового развертывания, может столкнуться с ошибкой импорта. Эта ошибка возникает из-за того, что ресурсы, работающие на устройстве этого пользователя, устарели, и он пытается импортировать соответствующий старый фрагмент, который удаляется. Это событие полезно для решения этой ситуации.

## Перестроить при изменении файлов

Вы можете включить наблюдатель накопительных пакетов с помощью `vite build --watch`. Или вы можете напрямую настроить базовые [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) через `build.watch`:

```js
// vite.config.js
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/configuration-options/#watch
    },
  },
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

```js twoslash
// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

Если вы укажете другой корень, помните, что `__dirname` по-прежнему будет папкой вашего файла vite.config.js при разрешении входных путей. Поэтому вам нужно будет добавить свою `root` запись в аргументы для `resolve`.

Обратите внимание, что для файлов HTML Vite игнорирует имя, присвоенное записи в объекте `rollupOptions.input`, и вместо этого учитывает разрешенный идентификатор файла при создании ресурса HTML в папке dist. Это обеспечивает согласованность структуры с тем, как работает сервер разработки.

## Режим библиотеки

Когда вы разрабатываете ориентированную на браузер библиотеку, вы, вероятно, проводите большую часть времени на тестовой/демонстрационной странице, которая импортирует вашу настоящую библиотеку. С Vite вы можете использовать свой `index.html` для этой цели, чтобы получить беспрепятственный опыт разработки.

Когда придет время собрать вашу библиотеку для распространения, используйте [опцию конфигурации `build.lib`](/config/build-options.md#build-lib). Не забудьте также внедрить любые зависимости, которые вы не хотите объединять в свою библиотеку, например, `vue` или `react`:

```js twoslash
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
      fileName: 'my-lib',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
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
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
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
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

::: tip Расширения файлов
Если `package.json` не содержит `"type": "module"`, Vite сгенерирует разные расширения файлов для совместимости с Node.js. `.js` станет `.mjs` и `.cjs` станет `.js`.
:::

::: tip Переменные среды
В режиме библиотеки все использование [`import.meta.env.*`](./env-and-mode.md) статически заменяется при сборке для производства. Однако использование, `process.env.*` не допускается, поэтому потребители вашей библиотеки могут его динамически изменять. Если это нежелательно, вы можете использовать `define: { 'process.env.NODE_ENV': '"production"' }`, например, чтобы статически заменить их, или использовать [`esm-env`](https://github.com/benmccann/esm-env) для лучшей совместимости со сборщиками и средами выполнения.
:::

::: warning Расширенное использование
Режим библиотеки включает в себя простую и продуманную конфигурацию для библиотек, ориентированных на браузер и JS-фреймворк. Если вы создаете небраузерные библиотеки или вам требуются расширенные процессы сборки, вы можете напрямую использовать [Rollup](https://rollupjs.org) или [esbuild](https://esbuild.github.io).
:::

## Расширенные базовые параметры

::: warning
Эта функция является экспериментальной. [Оставить отзыв](https://github.com/vitejs/vite/discussions/13834).
:::

Для расширенных вариантов использования развернутые ресурсы и общедоступные файлы могут находиться по разным путям, например, для использования разных стратегий кэширования.
Пользователь может выбрать для развертывания три разных пути:

- Сгенерированные входные HTML-файлы (которые могут быть обработаны во время SSR)
- Сгенерированные хешированные активы (JS, CSS и другие типы файлов, такие как изображения)
- Скопированные [общедоступные файлы](assets.md#the-public-directory)

В этих сценариях недостаточно одного статического [base](#public-base-path). Vite обеспечивает экспериментальную поддержку расширенных базовых параметров во время сборки, используя `experimental.renderBuiltUrl`.

```ts twoslash
import type { UserConfig } from 'vite'
// prettier-ignore
const config: UserConfig = {
// ---cut-before---
experimental: {
  renderBuiltUrl(filename, { hostType }) {
    if (hostType === 'js') {
      return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
    } else {
      return { relative: true }
    }
  },
},
// ---cut-after---
}
```

Если хешированные активы и общедоступные файлы не развернуты вместе, параметры для каждой группы могут быть определены независимо, используя ассеты `type`, включенный во второй параметр `context`, заданной функции.

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
// prettier-ignore
const config: UserConfig = {
// ---cut-before---
experimental: {
  renderBuiltUrl(filename, { hostId, hostType, type }) {
    if (type === 'public') {
      return 'https://www.domain.com/' + filename
    } else if (path.extname(hostId) === '.js') {
      return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` }
    } else {
      return 'https://cdn.domain.com/assets/' + filename
    }
  },
},
// ---cut-after---
}
```

Note that the `filename` passed is a decoded URL, and if the function returns a URL string, it should also be decoded. Vite will handle the encoding automatically when rendering the URLs. If an object with `runtime` is returned, encoding should be handled yourself where needed as the runtime code will be rendered as is.
