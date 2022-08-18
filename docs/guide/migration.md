# Миграция с v2

## Поддержка Node.js

Vite больше не поддерживает Node.js 12/13/15, который достиг своего EOL. Теперь требуется Node.js 14.18+ / 16+.

## Изменение базовой линии современного браузера

Рабочий комплект предполагает поддержку современного JavaScript. По умолчанию Vite нацелен на браузеры, которые поддерживают [нативные модули ES](https://caniuse.com/es6-module), [динамический импорт нативного ESM](https://caniuse.com/es6-module-dynamic-import) и [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta):

- Chrome >=87
- Firefox >=78
- Safari >=13
- Edge >=88

Небольшой части пользователей теперь потребуется использовать [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy), который будет автоматически генерировать устаревшие фрагменты и соответствующие ES языковые функции полифиллы.

## Изменения параметров конфигурации

Следующие параметры, которые уже устарели в v2, были удалены:

- `alias` (переключиться на [`resolve.alias`](../config/shared-options.md#resolve-alias))
- `dedupe` (переключиться на [`resolve.dedupe`](../config/shared-options.md#resolve-dedupe))
- `build.base` (переключиться на [`base`](../config/shared-options.md#base))
- `build.brotliSize` (переключиться на [`build.reportCompressedSize`](../config/build-options.md#build-reportcompressedsize))
- `build.cleanCssOptions` (теперь Vite использует esbuild для минимизации CSS)
- `build.polyfillDynamicImport` (используйте [`@vitejs/plugin-legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) для браузеров без поддержки динамического импорта)
- `optimizeDeps.keepNames` (переключиться на [`optimizeDeps.esbuildOptions.keepNames`](../config/dep-optimization-options.md#optimizedeps-esbuildoptions))

## Изменения архитектуры и устаревшие варианты

В этом разделе описываются самые большие изменения архитектуры в Vite v3. Чтобы проекты могли переходить с версии 2 в случае проблем с совместимостью, были добавлены устаревшие параметры для возврата к стратегиям Vite v2.

### Изменения сервера разработки

Порт сервера разработки Vite по умолчанию теперь равен 5173. Вы можете использовать [`server.port`](../config/server-options.md#server-port), чтобы установить для него значение 3000.

Хост сервера разработки Vite по умолчанию теперь называется `localhost`. В Vite v2 Vite по умолчанию прослушивал `127.0.0.1`. Node.js под v17 обычно разрешает `localhost` в `127.0.0.1`, поэтому для этих версий хост не изменится. Для Node.js 17+ вы можете использовать [`server.host`](../config/server-options.md#server-host), чтобы установить для него значение `127.0.0.1`, чтобы сохранить тот же хост, что и Vite v2.

Обратите внимание, что Vite v3 теперь печатает правильный хост. Это означает, что Vite может печатать `127.0.0.1` в качестве прослушивающего хоста, когда используется `localhost`. Вы можете установить [`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order), чтобы предотвратить это. Подробнее смотрите [`server.host`](../config/server-options.md#server-host) для получения подробной информации.

### Изменения SSR

Vite v3 по умолчанию использует ESM для сборки SSR. При использовании ESM [эвристика экстернализации SSR](https://vitejs.dev/guide/ssr.html#ssr-externals) больше не требуется. По умолчанию все зависимости являются внешними. Вы можете использовать [`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal), чтобы контролировать, какие зависимости включать в пакет SSR.

Если использование ESM для SSR в вашем проекте невозможно, вы можете установить `legacy.buildSsrCjsExternalHeuristics` для создания пакета CJS с использованием той же стратегии экстернализации Vite v2.

Также [`build.rollupOptions.output.inlineDynamicImports`](https://rollupjs.org/guide/en/#outputinlinedynamicimports) теперь по умолчанию имеет значение `false`, когда `ssr.target` имеет значение `'node'`. `inlineDynamicImports` изменяет порядок выполнения, и объединение в один файл не требуется для сборки узлов.

## Общие изменения

- Расширения файлов JS в режимах SSR и lib теперь используют допустимое расширение (`js`, `mjs` или `cjs`) для выходных записей и фрагментов JS в зависимости от их формата и типа пакета.
- Terser теперь необязательная зависимость. Если вы используете `build.minify: 'terser'`, вам необходимо установить его.
  ```shell
  npm add -D terser
  ```

### `import.meta.glob`

- [Необработанный `import.meta.glob`](features.md#glob-import-as) переключен с `{ assert: { type: 'raw' }}` на `{ as: 'raw' }`
- Ключи `import.meta.glob` теперь относятся к текущему модулю.

  ```diff
  // file: /foo/index.js
  const modules = import.meta.glob('../foo/*.js')

  // transformed:
  const modules = {
  -  '../foo/bar.js': () => {}
  +  './bar.js': () => {}
  }
  ```

- При использовании псевдонима с `import.meta.glob` ключи всегда абсолютны.
- `import.meta.globEager` больше не рекомендуется. Вместо этого используйте `import.meta.glob('*', { eager: true })`.

### Поддержка веб-сборки

Синтаксис `import init from 'example.wasm'` удален, чтобы предотвратить будущие конфликты с ["ESM integration for Wasm"](https://github.com/WebAssembly/esm-integration).
Вы можете использовать `?init`, который аналогичен предыдущему поведению.

```diff
-import init from 'example.wasm'
+import init from 'example.wasm?init'

-init().then((exports) => {
+init().then(({ exports }) => {
  exports.test()
})
```

### Автоматическая генерация https-сертификата

Действительный сертификат необходим при использовании `https`. В Vite v2, если сертификат не был настроен, автоматически создавался и кэшировался самозаверяющий сертификат.
Начиная с Vite v3, мы рекомендуем создавать сертификаты вручную. Если вы все еще хотите использовать автоматическую генерацию из v2, эту функцию можно снова включить, добавив [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) в плагины проекта.

```js
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [basicSsl()]
}
```

## Экспериментальный

### Использование оптимизации esbuild deps во время сборки

В v3 Vite позволяет использовать esbuild для оптимизации зависимостей во время сборки. Если он включен, он устраняет одно из наиболее значительных различий между dev и prod, присутствующее во 2 версии. [`@rollup/plugin-commonjs`](https://github.com/rollup/plugins/tree/master/packages/commonjs) в этом случае больше не нужен, поскольку esbuild преобразует зависимости только для CJS в ESM.

Если вы хотите попробовать эту стратегию сборки, вы можете использовать `optimizeDeps.disabled: false` (по умолчанию в 3 версии `disabled: 'build'`). `@rollup/plugin-commonjs` можно удалить, передав `build.commonjsOptions: { include: [] }`

## Продвинутый

Есть некоторые изменения, которые затрагивают только создателей плагинов/инструментов.

- [[#5868] рефакторинг: удалить устаревший API для 3.0](https://github.com/vitejs/vite/pull/5868)
  - `printHttpServerUrls` удален
  - `server.app`, `server.transformWithEsbuild` are removed
  - `import.meta.hot.acceptDeps` удален
- [[#6901] исправление: последовательное внедрение тегов в transformIndexHtml](https://github.com/vitejs/vite/pull/6901)
  - `transformIndexHtml` теперь получает правильное содержимое, измененное более ранними плагинами, поэтому порядок вставленных тегов теперь работает так, как ожидалось.
- [[#7995] рутинная работа: не исправлен fixStacktrace](https://github.com/vitejs/vite/pull/7995)
  - Опция `ssrLoadModule` для `fixStacktrace` по умолчанию теперь имеет значение `false`
- [[#8178] улучшение!: миграция на ESM](https://github.com/vitejs/vite/pull/8178)
  - `formatPostcssSourceMap` теперь асинхронный
  - `resolvePackageEntry`, `resolvePackageData` больше не доступны из сборки CJS (для использования в CJS необходим динамический импорт)
- [[#8626] рефакторинг: тип клиентских карт](https://github.com/vitejs/vite/pull/8626)
  - Тип обратного вызова `import.meta.hot.accept` теперь более строгий. Теперь это `(mod: (Record<string, any> & { [Symbol.toStringTag]: 'Module' }) | undefined) => void` (было `(mod: any) => void`).

Также есть другие критические изменения, которые затрагивают лишь нескольких пользователей.

- [[#5018] улучшение: включено `generatedCode: 'es2015'` для накопительной сборки](https://github.com/vitejs/vite/pull/5018)
  - Транспиляция в ES5 теперь необходима, даже если пользовательский код включает только ES5.
- [[#7877] исправление: типы клиентов vite](https://github.com/vitejs/vite/pull/7877)
  - `/// <reference lib="dom" />` удален из `vite/client.d.ts`. `{ "lib": ["dom"] }` или `{ "lib": ["webworker"] }` необходимо в `tsconfig.json`.
- [[#8090] улучшение: сохранены переменные окружения процесса в сборке библиотек](https://github.com/vitejs/vite/pull/8090)
  - `process.env.*` теперь сохраняется в режиме библиотеки
- [[#8280] улучшение: неблокирующая оптимизация esbuild во время сборки](https://github.com/vitejs/vite/pull/8280)
  - `server.force` была удалена в пользу опции `optimizeDeps.force`.
- [[#8550] исправление: не обрабатывать sigterm в режиме мидлвара](https://github.com/vitejs/vite/pull/8550)
  - При работе в режиме мидлвара Vite больше не убивает процесс на `SIGTERM`.

## Миграция с v1

Сначала проверьте [Руководство по переходу с v1](https://v2.vitejs.dev/guide/migration.html) в документации Vite v2, чтобы увидеть необходимые изменения для переноса вашего приложения на Vite v2, а затем продолжите внесение изменений. на этой странице.
