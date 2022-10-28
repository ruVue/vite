# Параметры сборки

## build.target

- **Тип:** `string | string[]`
- **По умолчанию:** `'modules'`
- **Связанный:** [Browser Compatibility](/guide/build#browser-compatibility)

Цель совместимости браузера для окончательного пакета. Значением по умолчанию является специальное значение Vite, `'modules'`, предназначенное для браузеров с [нативными модулями ES](https://caniuse.com/es6-module), [нативным динамическим импортом ESM](https://caniuse.com/es6-module-dynamic-import), и [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta).

Другое специальное значение — `'esnext'` — предполагает встроенную поддержку динамического импорта и будет транспилировать как можно меньше:

- Если параметр [`build.minify`](#build-minify) имеет значение `'terser'`, `'esnext'` будет принудительно уменьшен до `'es2021'`.
- В других случаях он вообще не будет выполнять транспиляцию.

Преобразование выполняется с помощью esbuild, и значение должно быть допустимым [опция цели esbuild](https://esbuild.github.io/api/#target). Настраиваемыми целями могут быть версия ES (например, `es2015`), браузер с версией (например, `chrome58`) или массив из нескольких целевых строк.

Обратите внимание, что сборка завершится ошибкой, если код содержит функции, которые нельзя безопасно перенести с помощью esbuild. Подробнее смотрите в [документации esbuild](https://esbuild.github.io/content-types/#javascript).

## build.modulePreload

- **Тип:** `boolean | { polyfill?: boolean, resolveDependencies?: ResolveModulePreloadDependenciesFn }`
- **По умолчанию:** `true`

By default, a [module preload polyfill](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) is automatically injected. The polyfill is auto injected into the proxy module of each `index.html` entry. If the build is configured to use a non-HTML custom entry via `build.rollupOptions.input`, then it is necessary to manually import the polyfill in your custom entry:

Следует ли автоматически вводить [модуль предварительной загрузки полифилл](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill).

Если установлено значение `true`, полифилл автоматически внедряется в прокси-модуль каждой записи `index.html`. Если сборка настроена на использование пользовательской записи, отличной от HTML, через `build.rollupOptions.input`, необходимо вручную импортировать полифилл в вашу пользовательскую запись:

```js
import 'vite/modulepreload-polyfill'
```

Примечание: Полифилл **не** применяется к [режиму библиотеки](/guide/build#library-mode). Если вам нужно поддерживать браузеры без собственного динамического импорта, вам, вероятно, следует избегать его использования в вашей библиотеке.

The polyfill can be disabled using `{ polyfill: false }`.

The list of chunks to preload for each dynamic import is computed by Vite. By default, an absolute path including the `base` will be used when loading these dependencies. If the `base` is relative (`''` or `'./'`), `import.meta.url` is used at runtime to avoid absolute paths that depend on the final deployed base.

There is experimental support for fine grained control over the dependencies list and their paths using the `resolveDependencies` function. It expects a function of type `ResolveModulePreloadDependenciesFn`:

```ts
type ResolveModulePreloadDependenciesFn = (
  url: string,
  deps: string[],
  context: {
    importer: string
  }
) => (string | { runtime?: string })[]
```

The `resolveDependencies` function will be called for each dynamic import with a list of the chunks it depends on, and it will also be called for each chunk imported in entry HTML files. A new dependencies array can be returned with these filtered or more dependencies injected, and their paths modified. The `deps` paths are relative to the `build.outDir`. Returning a relative path to the `hostId` for `hostType === 'js'` is allowed, in which case `new URL(dep, import.meta.url)` is used to get an absolute path when injecting this module preload in the HTML head.

```js
modulePreload: {
  resolveDependencies: (filename, deps, { hostId, hostType }) => {
    return deps.filter(condition)
  }
}
```

The resolved dependency paths can be further modified using [`experimental.renderBuiltUrl`](../guide/build.md#advanced-base-options).

## build.polyfillModulePreload

- **Type:** `boolean`
- **Default:** `true`
- **Deprecated** use `build.modulePreload.polyfill` instead
  Whether to automatically inject a [module preload polyfill](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill).

## build.outDir

- **Тип:** `string`
- **По умолчанию:** `dist`

Укажите выходной каталог (относительно [корень проекта](/guide/#index-html-and-project-root)).

## build.assetsDir

- **Тип:** `string`
- **По умолчанию:** `assets`

Укажите каталог для вложения сгенерированных ресурсов (относительно `build.outDir`).

## build.assetsInlineLimit

- **Тип:** `number`
- **По умолчанию:** `4096` (4kb)

Импортированные ресурсы или ресурсы, на которые есть ссылки, размер которых меньше этого порога, будут встроены как URL-адреса base64, чтобы избежать дополнительных HTTP-запросов. Установите `0`, чтобы полностью отключить встраивание.

Заполнители Git LFS автоматически исключаются из встраивания, поскольку они не содержат содержимого файла, который они представляют.

::: tip Note
Если вы укажете `build.lib`, `build.assetsInlineLimit` будет игнорироваться, а активы всегда будут встроенными, независимо от размера файла или быть заполнителем Git LFS.
:::

## build.cssCodeSplit

- **Тип:** `boolean`
- **По умолчанию:** `true`

Включить/выключить разделение кода CSS. Если этот параметр включен, CSS, импортированный в асинхронные фрагменты, будет встроен в сам асинхронный фрагмент и вставлен при его загрузке.

Если этот параметр отключен, все CSS во всем проекте будут извлечены в один файл CSS.

::: tip Note
Если вы укажете `build.lib`, `build.cssCodeSplit` будет по умолчанию `false`.
:::

## build.cssTarget

- **Тип:** `string | string[]`
- **По умолчанию:** то же, что и [`build.target`](#build-target)

Этот параметр позволяет пользователям установить другую цель браузера для минификации CSS, отличную от той, которая используется для транспиляции JavaScript.

Его следует использовать только в том случае, если вы ориентируетесь на неосновной браузер.
Одним из примеров является Android WeChat WebView, который поддерживает большинство современных функций JavaScript, но не поддерживает [`#RGBA` шестнадцатеричное обозначение цвета в CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgb_colors).
В этом случае вам нужно установить для `build.cssTarget` значение `chrome61`, чтобы vite не преобразовывал цвета `rgba()` в шестнадцатеричные обозначения `#RGBA`.

## build.sourcemap

- **Тип:** `boolean | 'inline' | 'hidden'`
- **По умолчанию:** `false`

Создавайте исходные карты производства. Если `true`, будет создан отдельный файл исходной карты. Если `'inline'`, исходная карта будет добавлена к результирующему выходному файлу как URI данных. `'hidden'` работает так же, как `true`, за исключением того, что соответствующие комментарии исходной карты в связанных файлах подавляются.

## build.rollupOptions

- **Тип:** [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

Непосредственно настраивайте базовый пакет Rollup. Это то же самое, что и параметры, которые можно экспортировать из файла конфигурации Rollup, и они будут объединены с внутренними параметрами Rollup Vite. Дополнительные сведения см. в [Документация по вариантам Rollup](https://rollupjs.org/guide/en/#big-list-of-options).

## build.commonjsOptions

- **Тип:** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

Параметры для перехода к [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs).

## build.dynamicImportVarsOptions

- **Тип:** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)
- **Связанный:** [Dynamic Import](/guide/features#dynamic-import)

Параметры для перехода к [@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars).

## build.lib

- **Тип:** `{ entry: string | string[] | { [entryAlias: string]: string }, name?: string, formats?: ('es' | 'cjs' | 'umd' | 'iife')[], fileName?: string | ((format: ModuleFormat, entryName: string) => string) }`
- **Связанный:** [Library Mode](/guide/build#library-mode)

Построить как библиотеку. `entry` необходима, так как библиотека не может использовать HTML в качестве записи. `name` является открытой глобальной переменной и требуется, когда `formats` включает `'umd'` или `'iife'`. Форматы `formats` по умолчанию: `['es', 'umd']` , или `['es', 'cjs']`, если используется несколько записей. `fileName` — это имя выходного файла пакета, по умолчанию `fileName` — это параметр имени package.json, его также можно определить как функцию, принимающую `format` в качестве аргумента и `entryAlias` в качестве аргументов.

## build.manifest

- **Тип:** `boolean | string | string[] | { [entryAlias: string]: string }`
- **По умолчанию:** `false`
- **Связанный:** [Backend Integration](/guide/backend-integration)

Если установлено значение `true`, сборка также создаст файл `manifest.json`, который содержит сопоставление нехэшированных имен файлов ресурсов с их хэшированными версиями, которые затем могут использоваться серверной структурой для отображения правильных ссылок на ресурсы. Если значение представляет собой строку, оно будет использоваться в качестве имени файла манифеста.

## build.ssrManifest

- **Тип:** `boolean | string`
- **По умолчанию:** `false`
- **Связанный:** [Server-Side Rendering](/guide/ssr)

Если установлено значение `true`, сборка также будет генерировать манифест SSR для определения ссылок на стили и директив предварительной загрузки ресурсов в рабочей среде. Если значение представляет собой строку, оно будет использоваться в качестве имени файла манифеста.

When set to `true`, the build will also generate an SSR manifest for determining style links and asset preload directives in production. When the value is a string, it will be used as the manifest file name.

## build.ssr

- **Тип:** `boolean | string`
- **По умолчанию:** `undefined`
- **Связанный:** [Server-Side Rendering](/guide/ssr)

Создание сборки, ориентированной на SSR. Значение может быть строкой для прямого указания записи SSR или `true`, что требует указания записи SSR через `rollupOptions.input`.

## build.minify

- **Тип:** `boolean | 'terser' | 'esbuild'`
- **По умолчанию:** `'esbuild'`

Установите значение `false`, чтобы отключить минимизацию, или укажите минимизатор для использования. По умолчанию используется [esbuild](https://github.com/evanw/esbuild), который в 20–40 раз быстрее, чем краткий, и только на 1–2% хуже сжатие. [Тесты](https://github.com/privatenumber/minification-benchmarks)

Note the `build.minify` option does not minify whitespaces when using the `'es'` format in lib mode, as it removes pure annotations and breaks tree-shaking.

Обратите внимание, что опция `build.minify` не минимизирует пробелы при использовании формата `'es'` в режиме lib, поскольку она удаляет чистые аннотации и прерывает встряхивание дерева.

Terser должен быть установлен, если для него задано значение `'terser'`.

```sh
npm add -D terser
```

## build.terserOptions

- **Тип:** `TerserOptions`

Дополнительные [опции минимизации](https://terser.org/docs/api-reference#minify-options) для передачи в Terser.

## build.write

- **Тип:** `boolean`
- **По умолчанию:** `true`

Установите значение `false`, чтобы отключить запись пакета на диск. В основном это используется в [программных вызовах `build()`](/guide/api-javascript#build), где перед записью на диск требуется дополнительная постобработка пакета.

## build.emptyOutDir

- **Тип:** `boolean`
- **По умолчанию:** `true`, если `outDir` находится внутри `root`

По умолчанию Vite очищает `outDir` при сборке, если он находится внутри корня проекта. Он выдаст предупреждение, если `outDir` находится за пределами root, чтобы избежать случайного удаления важных файлов. Вы можете явно установить этот параметр, чтобы скрыть предупреждение. Это также доступно через командную строку как `--emptyOutDir`.

## build.copyPublicDir

- **Experimental**
- **Type:** `boolean`
- **Default:** `true`

By default, Vite will copy files from the `publicDir` into the `outDir` on build. Set to `false` to disable this.

## build.reportCompressedSize

- **Тип:** `boolean`
- **По умолчанию:** `true`

Включить/отключить отчеты о размерах, сжатых gzip. Сжатие больших выходных файлов может быть медленным, поэтому его отключение может повысить производительность сборки для больших проектов.

## build.chunkSizeWarningLimit

- **Тип:** `number`
- **По умолчанию:** `500`

Ограничение предупреждений о размере фрагмента (в КБ).

## build.watch

- **Тип:** [`WatcherOptions`](https://rollupjs.org/guide/en/#watch-options)`| null`
- **По умолчанию:** `null`

Установите `{}`, чтобы включить наблюдатель сводки. Это в основном используется в случаях, когда речь идет о плагинах только для сборки или процессах интеграции.

::: warning Использование Vite в подсистеме Windows для Linux (WSL) 2

Бывают случаи, когда просмотр файловой системы не работает с WSL2.
Подробнее смотрите [`server.watch`](./server-options.md#server-watch).

:::
