# Функции

На самом базовом уровне разработка с использованием Vite не сильно отличается от использования статического файлового сервера. Тем не менее, Vite предоставляет множество улучшений по сравнению с собственным импортом ESM для поддержки различных функций, которые обычно используются в настройках на основе сборщиков.

## Разрешение зависимостей NPM и предварительное связывание

Собственный импорт ES не поддерживает импорт голых модулей, например:

```js
import { someMethod } from 'my-dep'
```

Приведенное выше вызовет ошибку в браузере. Vite обнаружит такой импорт голых модулей во всех обслуживаемых исходных файлах и выполнит следующее:

1. [Pre-bundle](./dep-pre-bundling) их для повышения скорости загрузки страницы и преобразования модулей CommonJS / UMD в ESM. Этап предварительной сборки выполняется с помощью [esbuild](http://esbuild.github.io/) и значительно ускоряет время холодного запуска Vite по сравнению с любым сборщиком на основе JavaScript.

2. Перепишите импорт на действительные URL-адреса, такие как `/node_modules/.vite/my-dep.js?v=f3sf2ebd`, чтобы браузер мог их правильно импортировать.

**Зависимости сильно кэшируются**

Vite кэширует запросы зависимостей через заголовки HTTP, поэтому, если вы хотите локально отредактировать/отладить зависимость, выполните шаги [здесь](./dep-pre-bundling#browser-cache).

## Горячая Замена Модуля (HMR)

Vite предоставляет [HMR API](./api-hmr) поверх собственного ESM. Платформы с возможностями HMR могут использовать API для предоставления мгновенных и точных обновлений без перезагрузки страницы или стирания состояния приложения. Vite предоставляет сторонние интеграции HMR для [Vue Single File Components](https://github.com/vitejs/vite/tree/main/packages/plugin-vue) и [React Fast Refresh](https://github.com/vitejs/vite/tree/main/packages/plugin-react). Также существуют официальные интеграции для Preact через [@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite).

Обратите внимание, что вам не нужно настраивать их вручную — когда вы [создаете приложение с помощью `create-vite`](./), в выбранных шаблонах они уже будут предварительно настроены для вас.

## TypeScript

Vite поддерживает импорт файлов `.ts` из коробки.

Vite выполняет транспиляцию только для файлов `.ts` и **НЕ** выполняет проверку типов. Предполагается, что о проверке типов заботится ваша IDE и процесс сборки (вы можете запустить `tsc --noEmit` в сценарии сборки или установить `vue-tsc` и запустить `vue-tsc --noEmit`, чтобы также проверить свой тип файлов `*.vue`).

Vite использует [esbuild](https://github.com/evanw/esbuild) для преобразования TypeScript в JavaScript, что примерно в 20–30 раз быстрее, чем ванильный `tsc`, а обновления HMR могут отображаться в браузере менее чем за 50 мс.

Используйте синтаксис импорта и экспорта только для типа [Type-Only Imports and Export](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export), чтобы избежать потенциальных проблем, таких как неправильный пакет импорта только для типа. Например:

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

However, some libraries (e.g. [`vue`](https://github.com/vuejs/core/issues/1228)) don't work well with `"isolatedModules": true`. You can use `"skipLibCheck": true` to temporarily suppress the errors until it is fixed upstream.

#### `useDefineForClassFields`

Начиная с Vite 2.5.0, значением по умолчанию будет `true`, если целью TypeScript является `ESNext`. Это соответствует [поведению `tsc` 4.3.2 и более поздних версий](https://github.com/microsoft/TypeScript/pull/42663). Это также стандартное поведение среды выполнения ECMAScript.

Но это может быть нелогичным для тех, кто работает с другими языками программирования или более старыми версиями TypeScript.
Подробнее о переходе можно прочитать в [примечаниях к выпуску TypeScript 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier).

Если вы используете библиотеку, которая сильно зависит от полей класса, будьте осторожны с ее предполагаемым использованием библиотекой.

Большинство библиотек ожидают `"useDefineForClassFields": true`, например [MobX](https://mobx.js.org/installation.html#use-spec-compliant-transpilation-for-class-properties), [Компоненты класса Vue 8.x](https://github.com/vuejs/vue-class-component/issues/465), и т. д.

Но несколько библиотек еще не перешли на это новое значение по умолчанию, в том числе [`lit-element`](https://github.com/lit/lit-element/issues/1030). В этих случаях явно установите для `useDefineForClassFields` значение `false`.

#### Другие параметры компилятора, влияющие на результат сборки

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)

Если перенос вашей кодовой базы на `"isolatedModules": true` является непреодолимым усилием, вы можете обойти это с помощью стороннего плагина, такого как [rollup-plugin-friendly-type-imports](https://www.npmjs.com/package/rollup-plugin-friendly-type-imports). Однако этот подход официально не поддерживается Vite.

### Клиентские типы

Типы Vite по умолчанию предназначены для его API Node.js. Чтобы изменить среду кода на стороне клиента в приложении Vite, добавьте файл объявления `d.ts`:

```typescript
/// <reference types="vite/client" />
```

Кроме того, вы можете добавить `vite/client` в `compilerOptions.types` вашего `tsconfig`:

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

## Vue

Vite обеспечивает первоклассную поддержку Vue:

- Поддержка Vue 3 SFC через [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)
- Поддержка Vue 3 JSX через [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx)
- Поддержка Vue 2 через [underfin/vite-plugin-vue2](https://github.com/underfin/vite-plugin-vue2)

## JSX

Файлы `.jsx` и `.tsx` также поддерживаются по умолчанию. Транспиляция JSX также обрабатывается через [esbuild](https://esbuild.github.io) и по умолчанию использует разновидность React 16. Поддержка JSX в стиле React 17 в esbuild отслеживается [здесь](https://github.com/evanw/esbuild/issues/334).

Пользователи Vue должны использовать официальный плагин [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx), который предоставляет специальные функции Vue 3, включая HMR, глобальное разрешение компонентов, директивы и слоты.

Если JSX не используется с React или Vue, пользовательские `jsxFactory` и `jsxFragment` можно настроить с помощью [параметра `esbuild`](/config/#esbuild). Например, для Preact:

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
})
```

Подробнее в [документации esbuild](https://esbuild.github.io/content-types/#jsx).

Вы можете внедрить помощники JSX с помощью `jsxInject` (это опция только для Vite), чтобы избежать ручного импорта:

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`
  }
})
```

## CSS

При импорте файлов `.css` их содержимое будет внедрено на страницу с помощью тега `<style>` с поддержкой HMR. Вы также можете получить обработанный CSS в виде строки в качестве экспорта модуля по умолчанию.

### `@import` Inlining и Rebasing

Vite предварительно настроен для поддержки встраивания CSS `@import` через `postcss-import`. Псевдонимы Vite также учитываются для CSS `@import`. Кроме того, все ссылки CSS `url()`, даже если импортированные файлы находятся в разных каталогах, всегда автоматически переустанавливаются для обеспечения корректности.

Псевдонимы `@import` и перебазирование URL-адресов также поддерживаются для файлов Sass и Less (смотрите [Препроцессоры CSS](#css-pre-processors)).

### PostCSS

Если проект содержит допустимую конфигурацию PostCSS (любой формат, поддерживаемый [postcss-load-config](https://github.com/postcss/postcss-load-config), например, `postcss.config.js`), он будет автоматически применяется ко всем импортированным CSS.

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

Поведение модулей CSS можно настроить с помощью [опции `css.modules`](/config/#css-modules).

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
  './dir/bar.js': () => import('./dir/bar.js')
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

Совпадающие файлы по умолчанию лениво загружаются с помощью динамического импорта и будут разделены на отдельные фрагменты во время сборки. Если вы предпочитаете импортировать все модули напрямую (например, полагаясь на то, что побочные эффекты в этих модулях будут применены в первую очередь), вы можете вместо этого использовать `import.meta.globEager`:

```js
const modules = import.meta.globEager('./dir/*.js')
```

Вышеупомянутое будет преобразовано в следующее:

```js
// code produced by vite
import * as __glob__0_0 from './dir/foo.js'
import * as __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1
}
```

`import.meta.glob` и `import.meta.globEager` также поддерживают импорт файлов в виде строк (аналогично [Импорту ассета как строки](https://vitejs.dev/guide/assets.html#importing-asset-as-string)) с синтаксисом [Import Reflection](https://github.com/tc39/proposal-import-reflection):

```js
const modules = import.meta.glob('./dir/*.js', { as: 'raw' })
```

Вышеупомянутое будет преобразовано в следующее:

```js
// code produced by vite
const modules = {
  './dir/foo.js': '{\n  "msg": "foo"\n}\n',
  './dir/bar.js': '{\n  "msg": "bar"\n}\n'
}
```

Обратите внимание, что:

- Это функция только для Vite и не является стандартом для Интернета или ES.
- Шаблоны glob обрабатываются как спецификаторы импорта: они должны быть либо относительными (начинаться с `./`), либо абсолютными (начинаться с `/`, разрешаться относительно корня проекта), либо псевдонимом пути (смотрите [`resolve.alias` option](/config/#resolve-alias)).
- Сопоставление glob выполняется с помощью `fast-glob` - ознакомьтесь с его документацией для [поддерживаемых глобальных шаблонов](https://github.com/mrmlnc/fast-glob#pattern-syntax).
- Вы также должны знать, что глобальный импорт не принимает переменные, вам нужно напрямую передать шаблон строки.
- Шаблоны glob не могут содержать ту же строку кавычек (т. е. `'`, `"`, `` ` ``), что и внешние кавычки, например, `'/Tom\'s files/**'`, используйте `"/Tom's files/**"` вместо этого.

## Веб-сборка

Предварительно скомпилированные файлы `.wasm` можно импортировать напрямую — экспортом по умолчанию будет функция инициализации, которая возвращает Promise объекта экспорта экземпляра wasm:

```js
import init from './example.wasm'

init().then((exports) => {
  exports.test()
})
```

Функция инициализации также может принимать объект `imports`, который передается `WebAssembly.instantiate` в качестве второго аргумента:

```js
init({
  imports: {
    someFunc: () => {
      /* ... */
    }
  }
}).then(() => {
  /* ... */
})
```

В производственной сборке файлы `.wasm` меньше, чем `assetInlineLimit`, будут встроены как строки base64. В противном случае они будут скопированы в каталог dist как ресурс и извлечены по запросу.

## Веб-воркеры

### Импорт с помощью конструкторов

Сценарий веб-воркера можно импортировать с помощью [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) и [`new SharedWorker()`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker). По сравнению с рабочими суффиксами этот синтаксис ближе к стандартам и является **рекомендуемым** способом создания рабочих процессов.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

Конструктор воркеров также принимает параметры, которые можно использовать для создания рабочих "module":

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module'
})
```

### Импорт с суффиксами запроса

Сценарий веб-воркера можно импортировать напрямую, добавив `?worker` или `?sharedworker` к запросу на импорт. Экспортом по умолчанию будет настраиваемый рабочий конструктор:

```js
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

Рабочий скрипт также может использовать операторы `import` вместо `importScripts()` - обратите внимание, что во время разработки это зависит от встроенной поддержки браузера и в настоящее время работает только в Chrome, но для рабочей сборки он скомпилирован.

По умолчанию рабочий скрипт будет выпущен как отдельный блок в производственной сборке. Если вы хотите встроить worker в виде строк base64, добавьте запрос `inline`:

```js
import MyWorker from './worker?worker&inline'
```

Смотрите [Параметры рабочего процесса](/config/#worker-options) для получения подробной информации о настройке объединения всех рабочих процессов.

## Оптимизация сборки

> Перечисленные ниже функции автоматически применяются как часть процесса сборки, и нет необходимости в явной настройке, если только вы не хотите их отключить.

### Разделение кода CSS

Vite автоматически извлекает CSS, используемый модулями, в асинхронный блок и создает для него отдельный файл. Файл CSS автоматически загружается с помощью тега `<link>` при загрузке связанного с ним асинхронного фрагмента, а асинхронный фрагмент гарантированно будет оцениваться только после загрузки CSS, чтобы избежать [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.).

Если вы предпочитаете извлекать весь CSS-код в один файл, вы можете отключить разделение кода CSS, установив для параметра [`build.cssCodeSplit`](/config/#build-csscodesplit) значение `false`.

### Генерация директив предварительной загрузки

Vite автоматически генерирует директивы `<link rel="modulepreload">` для входных блоков и их прямого импорта во встроенный HTML.

### Оптимизация асинхронной загрузки чанков

В реальных приложениях Rollup часто генерирует "common" фрагменты — код, который используется двумя или более другими фрагментами. В сочетании с динамическим импортом довольно часто возникает следующий сценарий:

![graph](/images/graph.png)

В неоптимизированных сценариях, когда импортируется асинхронный блок `A`, браузер должен будет запросить и проанализировать `A` прежде чем он сможет понять, что ему также нужен общий блок `C`. Это приводит к дополнительному круговому обходу сети:

```
Entry ---> A ---> C
```

Vite автоматически переписывает вызовы динамического импорта с разделением кода с шагом предварительной загрузки, так что при запросе `A` извлекается `C` **параллельно**:

```
Entry ---> (A + C)
```

Для `C` возможен дальнейший импорт, что приведет к еще большему количеству обращений в оба конца в неоптимизированном сценарии. Оптимизация Vite будет отслеживать весь прямой импорт, чтобы полностью исключить двусторонние операции независимо от глубины импорта.
