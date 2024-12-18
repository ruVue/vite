# Параметры оптимизации зависимостей

- **Связанный:** [Dependency Pre-Bundling](/guide/dep-pre-bundling)

Unless noted, the options in this section are only applied to the dependency optimizer, which is only used in dev.

## optimizeDeps.entries

- **Тип:** `string | string[]`

По умолчанию Vite будет сканировать все ваши файлы `.html`, чтобы обнаружить зависимости, которые необходимо предварительно связать (игнорируя `node_modules`, `build.outDir`, `__tests__` и `coverage`). Если указан `build.rollupOptions.input`, Vite вместо этого будет сканировать эти точки входа.

Если ни один из этих вариантов вам не подходит, вы можете указать пользовательские записи с помощью этой опции — значение должно быть шаблоном [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) или массивом шаблонов, которые являются относительными от корня проекта Vite. Это перезапишет вывод записей по умолчанию. Только папки `node_modules` и `build.outDir` будут игнорироваться по умолчанию, если `optimizeDeps.entries` явно определен. Если необходимо игнорировать другие папки, вы можете использовать шаблон игнорирования как часть списка записей, помеченный начальным `!`. Если вы не хотите игнорировать `node_modules` и `build.outDir`, вы можете указать их с помощью буквенных строковых путей (без шаблонов `tinyglobby`).

## optimizeDeps.exclude

- **Тип:** `string[]`

Зависимости, которые следует исключить из предварительной сборки.

:::warning CommonJS
Зависимости CommonJS не следует исключать из оптимизации. Если зависимость ESM исключена из оптимизации, но имеет вложенную зависимость CommonJS, зависимость CommonJS должна быть добавлена в `optimizeDeps.include`. Пример:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig({
  optimizeDeps: {
    include: ['esm-dep > cjs-dep'],
  },
})
```

:::

## optimizeDeps.include

- **Тип:** `string[]`

По умолчанию связанные пакеты не внутри `node_modules` предварительно не объединяются. Используйте этот параметр, чтобы предварительно объединить связанный пакет.

**Экспериментально:** Если вы используете библиотеку с большим количеством глубоких импортов, вы также можете указать завершающий шаблон glob для предварительной упаковки всех глубоких импортов одновременно. Это позволит избежать постоянной предварительной упаковки при каждом использовании нового глубокого импорта. [Оставьте отзыв](https://github.com/vitejs/vite/discussions/15833). Например:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig({
  optimizeDeps: {
    include: ['my-lib/components/**/*.vue'],
  },
})
```

## optimizeDeps.esbuildOptions

- **Тип:** [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)`<`[`EsbuildBuildOptions`](https://esbuild.github.io/api/#general-options)`,
| 'bundle'
| 'entryPoints'
| 'external'
| 'write'
| 'watch'
| 'outdir'
| 'outfile'
| 'outbase'
| 'outExtension'
| 'metafile'>`

Параметры для передачи в esbuild во время сканирования и оптимизации.

Некоторые параметры опущены, поскольку их изменение несовместимо с оптимизацией Vite.

- `external` также опущен, используйте опцию Vite `optimizeDeps.exclude`
- `plugins` объединены с плагином dep Vite

## optimizeDeps.force

- **Тип:** `boolean`

Установите значение `true`, чтобы принудительно выполнить предварительное объединение зависимостей, игнорируя ранее кэшированные оптимизированные зависимости.

## optimizeDeps.holdUntilCrawlEnd

- **Experimental:** [Give Feedback](https://github.com/vitejs/vite/discussions/15834)
- **Type:** `boolean`
- **Default:** `true`

When enabled, it will hold the first optimized deps results until all static imports are crawled on cold start. This avoids the need for full-page reloads when new dependencies are discovered and they trigger the generation of new common chunks. If all dependencies are found by the scanner plus the explicitly defined ones in `include`, it is better to disable this option to let the browser process more requests in parallel.

## optimizeDeps.disabled

- **Deprecated**
- **Экспериментальный:** [Дать отзыв](https://github.com/vitejs/vite/discussions/13839)
- **Тип:** `boolean | 'build' | 'dev'`
- **По умолчанию:** `'build'`

Эта опция устарела. Начиная с Vite 5.1 предварительная сборка зависимостей во время сборки была удалена. Установка `optimizeDeps.disabled` в `true` или `'dev'` отключает оптимизатор, а настройка в `false` или `'build'` оставляет оптимизатор во время разработки включенным.

Чтобы полностью отключить оптимизатор, используйте `optimizeDeps.noDiscovery: true`, чтобы запретить автоматическое обнаружение зависимостей, и оставьте `optimizeDeps.include` неопределенным или пустым.

:::warning
Оптимизация зависимостей во время сборки была **экспериментальной** функцией. Проекты, пробующие эту стратегию, также удалили `@rollup/plugin-commonjs` с помощью `build.commonjsOptions: { include: [] }`. Если вы это сделали, предупреждение поможет вам повторно включить его для поддержки пакетов только CJS во время сборки.
:::

## optimizeDeps.needsInterop

- **Экспериментальный**
- **Тип:** `string[]`

Принудительно обеспечивает взаимодействие ESM при импорте этих зависимостей. Vite может правильно определить, когда зависимость требует взаимодействия, поэтому эта опция обычно не требуется. Однако различные комбинации зависимостей могут привести к тому, что некоторые из них будут предварительно объединены по-разному. Добавление этих пакетов в `needsInterop` может ускорить холодный запуск, избегая полной перезагрузки страницы. Если это относится к одной из ваших зависимостей, вы получите предупреждение с предложением добавить имя пакета в этот массив в вашей конфигурации.
