# Функции

На самом базовом уровне разработка с использованием Vite не сильно отличается от использования статического файлового сервера. Тем не менее, Vite предоставляет множество улучшений по сравнению с собственным импортом ESM для поддержки различных функций, которые обычно используются в настройках на основе сборщиков.

## Разрешение зависимостей NPM и предварительное связывание

Собственный импорт ES не поддерживает импорт голых модулей, например:

```js
import { someMethod } from 'my-dep'
```

Приведенное выше вызовет ошибку в браузере. Vite обнаружит такой импорт голых модулей во всех обслуживаемых исходных файлах и выполнит следующее:

1. [Pre-bundle](./dep-pre-bundling) их для повышения скорости загрузки страницы и преобразования модулей CommonJS / UMD в ESM. Этап предварительной сборки выполняется с помощью [esbuild](http://esbuild.github.io/) и значительно ускоряет время холодного запуска Vite по сравнению с любым сборщиком на основе JavaScript.

2. Перепишите импорт на действительные URL-адреса, такие как `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd`, чтобы браузер мог их правильно импортировать.

**Зависимости сильно кэшируются**

Vite кэширует запросы зависимостей через заголовки HTTP, поэтому, если вы хотите локально отредактировать/отладить зависимость, выполните шаги [здесь](./dep-pre-bundling#browser-cache).

## Горячая Замена Модуля (HMR)

Vite предоставляет [HMR API](./api-hmr) поверх собственного ESM. Платформы с возможностями HMR могут использовать API для предоставления мгновенных и точных обновлений без перезагрузки страницы или стирания состояния приложения. Vite предоставляет сторонние интеграции HMR для [Vue Single File Components](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) и [React Fast Refresh](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react). Также существуют официальные интеграции для Preact через [@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite).

Обратите внимание, что вам не нужно настраивать их вручную — когда вы [создаете приложение с помощью `create-vite`](./), в выбранных шаблонах они уже будут предварительно настроены для вас.

## TypeScript

Vite поддерживает импорт файлов `.ts` из коробки.

### Только транспиляция

Обратите внимание, что Vite выполняет транспиляцию только файлов `.ts` и **НЕ** выполняет проверку типов. Предполагается, что проверка типов осуществляется вашей IDE и процессом сборки.

Причина, по которой Vite не выполняет проверку типов в процессе преобразования, заключается в том, что эти два задания работают принципиально по-разному. Транспиляция может работать для каждого файла отдельно и идеально согласуется с моделью компиляции Vite по требованию. Для сравнения, проверка типов требует знания всего графа модуля. Проверка типа подключения к конвейеру преобразования Vite неизбежно поставит под угрозу преимущества скорости Vite.

Задача Vite — привести ваши исходные модули в форму, которая может работать в браузере как можно быстрее. С этой целью мы рекомендуем отделить проверки статического анализа от конвейера преобразования Vite. Этот принцип применим и к другим проверкам статического анализа, таким как ESLint.

- Для производственных сборок вы можете запустить `tsc --noEmit` в дополнение к команде сборки Vite.

- Во время разработки, если вам нужно больше, чем подсказки IDE, мы рекомендуем запустить `tsc --noEmit --watch` в отдельном процессе или использовать [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker), если вы предпочитаете, чтобы ошибки типа сообщались непосредственно в браузере.

Vite использует [esbuild](https://github.com/evanw/esbuild) для преобразования TypeScript в JavaScript, что примерно в 20–30 раз быстрее, чем ванильный `tsc`, а обновления HMR могут отображаться в браузере менее чем за 50 мс.

Используйте синтаксис [Импорт и экспорт только для типа](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export), чтобы избежать потенциальных проблем, таких как неправильный пакет импорта только для типа, например:

```ts
import type { T } from 'only/types'
export type { T }
```

### Параметры компилятора TypeScript

Некоторые поля конфигурации в разделе `compilerOptions` в `tsconfig.json` требуют особого внимания.

#### `isolatedModules`

Должно быть установлено значение `true`.

Это связано с тем, что `esbuild` выполняет транспиляцию только без информации о типе, он не поддерживает некоторые функции, такие как const enum и неявный импорт только типов.

Вы должны установить `"isolatedModules": true` в вашем `tsconfig.json` в разделе `compilerOptions`, чтобы TS предупредил вас о функциях, которые не работают с изолированной транспиляцией.

Однако некоторые библиотеки (например, [`vue`](https://github.com/vuejs/core/issues/1228)) плохо работают с `"isolatedModules": true`. Вы можете использовать `"skipLibCheck": true`, чтобы временно подавить ошибки, пока они не будут исправлены вышестоящим.

#### `useDefineForClassFields`

Начиная с Vite 2.5.0, значением по умолчанию будет `true`, если целью TypeScript является `ESNext` или `ES2022` или новее. Это соответствует [поведению `tsc` 4.3.2 и более поздних версий](https://github.com/microsoft/TypeScript/pull/42663). Это также стандартное поведение среды выполнения ECMAScript.

Но это может быть нелогичным для тех, кто работает с другими языками программирования или более старыми версиями TypeScript.
Подробнее о переходе можно прочитать в [примечаниях к выпуску TypeScript 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier).

Если вы используете библиотеку, которая сильно зависит от полей класса, будьте осторожны с ее предполагаемым использованием библиотекой.

Большинство библиотек ожидают `"useDefineForClassFields": true`, например, [MobX](https://mobx.js.org/installation.html#use-spec-compliant-transpilation-for-class-properties).

Но несколько библиотек еще не перешли на это новое значение по умолчанию, в том числе [`lit-element`](https://github.com/lit/lit-element/issues/1030). В этих случаях явно установите для `useDefineForClassFields` значение `false`.

#### Другие параметры компилятора, влияющие на результат сборки

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)

Если миграция вашей кодовой базы на `"isolatedModules": true` является непреодолимой задачей, вы можете обойти ее с помощью стороннего плагина, такого как [rollup-plugin-friendly-type-imports](https://www.npmjs.com/package/rollup-plugin-friendly-type-imports). Однако этот подход официально не поддерживается Vite.

### Клиентские типы

Типы Vite по умолчанию предназначены для его API Node.js. Чтобы изменить среду кода на стороне клиента в приложении Vite, добавьте файл объявления `d.ts`:

```typescript
/// <reference types="vite/client" />
```

Альтернативно, вы можете добавить `vite/client` в `compilerOptions.types` внутри `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

Это обеспечит следующие типы прокладок:

- Импорт ассетов (например, импорт файла `.svg`)
- Типы для Vite-injected [переменных env](./env-and-mode#env-variables) в `import.meta.env`
- Типы для [HMR API](./api-hmr) в `import.meta.hot`

::: tip
Чтобы переопределить типизацию по умолчанию, добавьте файл определения типа, содержащий ваши типизации. Затем добавьте ссылку на тип перед `vite/client`.

For example, to make the default import of `*.svg` a React component:

- `vite-env-override.d.ts` (the file that contains your typings):
  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```
- The file containing the reference to `vite/client`:
  ```ts
  /// <reference types="./vite-env-override.d.ts" />
  /// <reference types="vite/client" />
  ```

:::

## Vue

Vite обеспечивает первоклассную поддержку Vue:

- Поддержка Vue 3 SFC через [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)
- Поддержка Vue 3 JSX через [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
- Поддержка Vue 2.7 SFC через [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)
- Поддержка Vue 2.7 JSX через [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

## JSX

Файлы `.jsx` и `.tsx` также поддерживаются по умолчанию. Транспиляция JSX также выполняется через [esbuild](https://esbuild.github.io).

Пользователи Vue должны использовать официальный плагин [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx), который предоставляет Vue 3 специальные функции, включая HMR, глобальное разрешение компонентов, директивы и слоты.

Если JSX не используется с React или Vue, пользовательские `jsxFactory` и `jsxFragment` можно настроить с помощью [параметра `esbuild`](/config/shared-options.md#esbuild). Например, для Preact:

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

Подробнее в [документации esbuild](https://esbuild.github.io/content-types/#jsx).

Вы можете внедрить помощники JSX с помощью `jsxInject` (это опция только для Vite), чтобы избежать ручного импорта:

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

При импорте файлов `.css` их содержимое будет внедрено на страницу с помощью тега `<style>` с поддержкой HMR. Вы также можете получить обработанный CSS в виде строки в качестве экспорта модуля по умолчанию.

### `@import` Inlining и Rebasing

Vite предварительно настроен для поддержки встраивания CSS `@import` через `postcss-import`. Псевдонимы Vite также учитываются для CSS `@import`. Кроме того, все ссылки CSS `url()`, даже если импортированные файлы находятся в разных каталогах, всегда автоматически переустанавливаются для обеспечения корректности.

Псевдонимы `@import` и перебазирование URL-адресов также поддерживаются для файлов Sass и Less (смотрите [Препроцессоры CSS](#css-pre-processors)).

### PostCSS

Если проект содержит допустимую конфигурацию PostCSS (любой формат, поддерживаемый [postcss-load-config](https://github.com/postcss/postcss-load-config), например, `postcss.config.js`), он будет автоматически применяется ко всем импортированным CSS.

Обратите внимание, что минимизация CSS будет выполняться после PostCSS и будет использовать параметр [`build.cssTarget`](/config/build-options.md#build-csstarget).

### CSS модули

Любой файл CSS, оканчивающийся на `.module.css`, считается [файлом модулей CSS](https://github.com/css-modules/css-modules). Импорт такого файла вернет соответствующий объект модуля:

```css
/* example.module.css */
.red {
  color: red;
}
```

```js
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

Поведение модулей CSS можно настроить с помощью [параметра `css.modules`](/config/shared-options.md#css-modules).

Если `css.modules.localsConvention` настроен на включение локальных переменных camelCase (например, `localsConvention: 'camelCaseOnly'`), вы также можете использовать именованный импорт:

```js
// .apply-color -> applyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### Препроцессоры CSS

Поскольку Vite предназначен только для современных браузеров, рекомендуется использовать собственные переменные CSS с плагинами PostCSS, которые реализуют черновики CSSWG (например, [postcss-nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting)) и создавать простой CSS, соответствующий будущим стандартам.

Тем не менее, Vite обеспечивает встроенную поддержку файлов `.scss`, `.sass`, `.less`, `.styl` и `.stylus`. Для них не нужно устанавливать специфичные для Vite плагины, но сам соответствующий препроцессор должен быть установлен:

```bash
# .scss and .sass
npm add -D sass

# .less
npm add -D less

# .styl and .stylus
npm add -D stylus
```

При использовании однофайловых компонентов Vue это также автоматически включает `<style lang="sass">` и др.

Vite улучшает разрешение `@import` для Sass и Less, так что псевдонимы Vite также учитываются. Кроме того, относительные ссылки `url()` внутри импортированных файлов Sass/Less, которые находятся в каталогах, отличных от корневого файла, также автоматически переустанавливаются для обеспечения корректности.

Перемещение псевдонимов и URL-адресов `@import` не поддерживается для Stylus из-за ограничений его API.

Вы также можете использовать модули CSS в сочетании с препроцессорами, добавив `.module` к расширению файла, например, `style.module.scss`.

### Отключение внедрения CSS на страницу

Автоматическое внедрение содержимого CSS можно отключить с помощью параметра запроса `?inline`. В этом случае обработанная строка CSS возвращается как экспорт модуля по умолчанию, как обычно, но стили не внедряются на страницу.

```js
import './foo.css' // will be injected into the page
import otherStyles from './bar.css?inline' // will not be injected
```

::: tip ПРИМЕЧАНИЕ
Импорт по умолчанию и именованный импорт из файлов CSS (например, `import style from './foo.css'`) устарел, начиная с Vite 4. Вместо этого используйте запрос `?inline`.
:::

### Lightning CSS

Начиная с Vite 4.4 существует экспериментальная поддержка [Lightning CSS](https://lightningcss.dev/). Вы можете принять его, добавив [`css.transformer: 'lightningcss'`](../config/shared-options.md#css-transformer) в свой файл конфигурации и установив дополнительную зависимость [`lightningcss`](https://www.npmjs.com/package/lightningcss):

```bash
npm add -D lightningcss
```

Если этот параметр включен, файлы CSS будут обрабатываться с помощью Lightning CSS вместо PostCSS. Чтобы настроить его, вы можете передать параметры CSS Lightning в параметр конфигурации [`css.lightingcss`](../config/shared-options.md#css-lightningcss).

Чтобы настроить модули CSS, вы будете использовать [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) вместо [`css.modules`](../config/shared-options.md#css-modules) (который настраивает способ обработки PostCSS модулей CSS).

По умолчанию Vite использует esbuild для минимизации CSS. Lightning CSS также можно использовать в качестве минификатора CSS с помощью [`build.cssMinify: 'lightningcss'`](../config/build-options.md#build-cssminify).

::: tip ПРИМЕЧАНИЕ
[Препроцессоры CSS](#css-pre-processors) не поддерживаются при использовании Lightning CSS.
:::

## Статические ресурсы

Импорт статического ресурса вернет разрешенный общедоступный URL-адрес при его обслуживании:

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Специальные запросы могут изменить способ загрузки ресурсов:

```js
// Explicitly load assets as URL
import assetAsURL from './asset.js?url'
```

```js
// Load assets as strings
import assetAsString from './shader.glsl?raw'
```

```js
// Load Web Workers
import Worker from './worker.js?worker'
```

```js
// Web Workers inlined as base64 strings at build time
import InlineWorker from './worker.js?worker&inline'
```

Дополнительные сведения см. в разделе [Обработка статических ресурсов](./assets).

## JSON

Файлы JSON можно импортировать напрямую — также поддерживается именованный импорт:

```js
// import the entire object
import json from './example.json'
// import a root field as named exports - helps with tree-shaking!
import { field } from './example.json'
```

## Импорт Glob

Vite поддерживает импорт нескольких модулей из файловой системы с помощью специальной функции `import.meta.glob`:

```js
const modules = import.meta.glob('./dir/*.js')
```

Вышеупомянутое будет преобразовано в следующее:

```js
// code produced by vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js'),
}
```

Затем вы можете перебирать ключи объекта `modules` для доступа к соответствующим модулям:

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

Совпадающие файлы по умолчанию загружаются с помощью динамического импорта и будут разделены на отдельные фрагменты во время сборки. Если вы предпочитаете импортировать все модули напрямую (например, полагаясь на то, что побочные эффекты в этих модулях будут применены в первую очередь), вы можете передать `{ eager: true }` в качестве второго аргумента:

```js
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

Вышеупомянутое будет преобразовано в следующее:

```js
// code produced by vite
import * as __glob__0_0 from './dir/foo.js'
import * as __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1,
}
```

### Глобальный импорт как

`import.meta.glob` также поддерживает импорт файлов в виде строк (аналогично [Импортировать актив как строку](https://vitejs.ru/guide/assets.html#importing-asset-as-string)) с помощью синтаксиса [Импорт Reflection](https://github.com/tc39/proposal-import-reflection):

```js
const modules = import.meta.glob('./dir/*.js', { as: 'raw', eager: true })
```

Вышеупомянутое будет преобразовано в следующее:

```js
// code produced by vite
const modules = {
  './dir/foo.js': 'export default "foo"\n',
  './dir/bar.js': 'export default "bar"\n',
}
```

`{ as: 'url' }` также поддерживается для загрузки ресурсов в виде URL-адресов.

### Несколько шаблонов

Первый аргумент может быть глобальным массивом, например:

```js
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### Негативные шаблоны

Также поддерживаются негативные глобальные шаблоны (с префиксом `!`). Чтобы игнорировать некоторые файлы из результата, вы можете добавить к первому аргументу глобальные шаблоны исключения:

```js
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// code produced by vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

#### Именованный импорт

Можно импортировать только части модулей с параметрами `import`.

```ts
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// code produced by vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
}
```

В сочетании с `eager` можно даже включить встряхивание дерева для этих модулей.

```ts
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true,
})
```

```ts
// code produced by vite:
import { setup as __glob__0_0 } from './dir/foo.js'
import { setup as __glob__0_1 } from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1,
}
```

Установите для `import` значение `default`, чтобы импортировать экспорт по умолчанию.

```ts
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true,
})
```

```ts
// code produced by vite:
import __glob__0_0 from './dir/foo.js'
import __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1,
}
```

#### Пользовательские запросы

Вы также можете использовать опцию `query`, чтобы предоставить пользовательские запросы для импорта для использования другими плагинами.

```ts
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

```ts
// code produced by vite:
const modules = {
  './dir/foo.js': () => import('./dir/foo.js?foo=bar&bar=true'),
  './dir/bar.js': () => import('./dir/bar.js?foo=bar&bar=true'),
}
```

### Предостережения по глобальному импорту

Обратите внимание, что:

- Это функция только для Vite и не является стандартом для Интернета или ES.
- Шаблоны glob обрабатываются как спецификаторы импорта: они должны быть либо относительными (начинаться с `./`), либо абсолютными (начинаться с `/`, разрешаться относительно корня проекта), либо псевдонимом пути (смотрите [параметр `resolve.alias`](/config/shared-options.md#resolve-alias)).
- Сопоставление универсальных объектов выполняется с помощью [`fast-glob`](https://github.com/mrmlnc/fast-glob) - ознакомьтесь с его документацией для [поддерживаемых глобальных шаблонов](https://github.com/mrmlnc/fast-glob#pattern-syntax).
- Вы также должны знать, что все аргументы в `import.meta.glob` должны быть **переданы как литералы**. Вы НЕ можете использовать в них переменные или выражения.

## Динамический импорт

Подобно [glob import](#glob-import), Vite также поддерживает динамический импорт с переменными.

```ts
const module = await import(`./dir/${file}.js`)
```

Обратите внимание, что переменные представляют имена файлов только на один уровень глубины. Если `file` это `'foo/bar'`, импорт завершится ошибкой. Для более продвинутого использования вы можете использовать функцию [glob import](#glob-import).

## Веб-сборка

Предварительно скомпилированные файлы `.wasm` можно импортировать с помощью `?init`.
Экспортом по умолчанию будет функция инициализации, которая возвращает промис [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Instance):

```js
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

Функция init также может принимать объект importObject, который передается в [`WebAssembly.instantiate`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiate) в качестве второго аргумента:

```js
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

В производственной сборке файлы `.wasm` размером меньше, чем `assetInlineLimit`, будут встроены как строки base64. В противном случае они будут рассматриваться как [статический ресурс](./assets) и извлекаться по требованию.

::: tip ПРИМЕЧАНИЕ
[Предложение по интеграции модуля ES для WebAssembly](https://github.com/WebAssembly/esm-integration) в настоящее время не поддерживается.
Для решения этой проблемы используйте [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) или другие плагины сообщества.
:::

### Доступ к модулю WebAssembly

Если вам нужен доступ к объекту `Module`, например, чтобы создать его экземпляр несколько раз, используйте [импорт явного URL-адреса](./assets#explicit-url-imports) для разрешения ресурса, а затем выполните создание экземпляра:

```js
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } = await WebAssembly.instantiateStreaming(
    responsePromise,
  )
  /* ... */
}

main()
```

### Fetching the module in Node.js

In SSR, the `fetch()` happening as part of the `?init` import, may fail with `TypeError: Invalid URL`.
See the issue [Support wasm in SSR](https://github.com/vitejs/vite/issues/8882).

Here is an alternative, assuming the project base is the current directory:

```js
import wasmUrl from 'foo.wasm?url'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const resolvedUrl = (await import('./test/boot.test.wasm?url')).default
  const buffer = await readFile('.' + resolvedUrl)
  const { instance } = await WebAssembly.instantiate(buffer, {
    /* ... */
  })
  /* ... */
}

main()
```

## Web Workers

### Импорт с помощью конструкторов

Сценарий веб-воркера можно импортировать с помощью [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) и [`new SharedWorker()`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker). По сравнению с рабочими суффиксами этот синтаксис ближе к стандартам и является **рекомендуемым** способом создания рабочих процессов.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

Конструктор воркеров также принимает параметры, которые можно использовать для создания "module" вокеров:

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

### Импорт с суффиксами запроса

Сценарий веб-воркера можно импортировать напрямую, добавив `?worker` или `?sharedworker` к запросу на импорт. Экспортом по умолчанию будет настраиваемый рабочий конструктор:

```js
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

Рабочий скрипт также может использовать операторы `import` ESM вместо `importScripts()`. **Примечание**: Во время разработки это зависит от [встроенной поддержки браузера](https://caniuse.com/?search=module%20worker), но для производственной сборки она компилируется отдельно.

По умолчанию рабочий скрипт будет выпущен как отдельный блок в производственной сборке. Если вы хотите встроить worker в виде строк base64, добавьте запрос `inline`:

```js
import MyWorker from './worker?worker&inline'
```

Если вы хотите получить работника как URL-адрес, добавьте запрос `url`:

```js
import MyWorker from './worker?worker&url'
```

Смотрите [Параметры работника](/config/worker-options.md) для получения подробной информации о настройке объединения всех вокеров.

## Оптимизация сборки

> Перечисленные ниже функции автоматически применяются как часть процесса сборки, и нет необходимости в явной настройке, если только вы не хотите их отключить.

### Разделение кода CSS

Vite автоматически извлекает CSS, используемый модулями, в асинхронный блок и создает для него отдельный файл. Файл CSS автоматически загружается с помощью тега `<link>` при загрузке связанного с ним асинхронного фрагмента, а асинхронный фрагмент гарантированно будет оцениваться только после загрузки CSS, чтобы избежать [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.).

Если вы предпочитаете, чтобы весь CSS был извлечен в один файл, вы можете отключить разделение кода CSS, установив для параметра [`build.cssCodeSplit`](/config/build-options.md#build-csscodesplit) значение `false`.

### Генерация директив предварительной загрузки

Vite автоматически генерирует директивы `<link rel="modulepreload">` для входных блоков и их прямого импорта во встроенный HTML.

### Оптимизация асинхронной загрузки чанков

В реальных приложениях Rollup часто генерирует "common" фрагменты — код, который используется двумя или более другими фрагментами. В сочетании с динамическим импортом довольно часто возникает следующий сценарий:

<script setup>
import graphSvg from '../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

В неоптимизированных сценариях, когда импортируется асинхронный блок `A`, браузер должен будет запросить и проанализировать `A` прежде чем он сможет понять, что ему также нужен общий блок `C`. Это приводит к дополнительному круговому обходу сети:

```
Entry ---> A ---> C
```

Vite автоматически переписывает вызовы динамического импорта с разделением кода с шагом предварительной загрузки, так что при запросе `A` извлекается `C` **параллельно**:

```
Entry ---> (A + C)
```

Для `C` возможен дальнейший импорт, что приведет к еще большему количеству обращений в оба конца в неоптимизированном сценарии. Оптимизация Vite будет отслеживать весь прямой импорт, чтобы полностью исключить двусторонние операции независимо от глубины импорта.
