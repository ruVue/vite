# Обработка статических ресурсов

- Связанный: [Общедоступный базовый путь](./build#public-base-path)
- Связанный: [Параметр конфигурации `assetsInclude`](/config/shared-options.md#assetsinclude)

## Импорт объекта как URL

Импорт статического ресурса вернет разрешенный общедоступный URL-адрес при его обслуживании:

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Например, `imgUrl` будет `/src/img.png` во время разработки и станет `/assets/img.2d8efhg.png` в производственной сборке.

Поведение похоже на `file-loader` из webpack. Разница в том, что импорт может осуществляться как с использованием абсолютных общедоступных путей (на основе корня проекта во время разработки), так и относительных путей.

- Ссылки `url()` в CSS обрабатываются таким же образом.

- При использовании плагина Vue ссылки на ресурсы в шаблонах Vue SFC автоматически преобразуются в импорт.

- Общие типы файлов изображений, мультимедиа и шрифтов автоматически определяются как активы. Вы можете расширить внутренний список, используя [параметр `assetsInclude` option](/config/shared-options.md#assetsinclude).

- Ресурсы, на которые ссылаются, включаются как часть графа ресурсов сборки, получают хешированные имена файлов и могут обрабатываться плагинами для оптимизации.

- Активы меньше в байтах, чем [параметр `assetsInlineLimit`](/config/build-options.md#build-assetsinlinelimit) будут встроены как URL-адреса данных base64.

- Заполнители Git LFS автоматически исключаются из встраивания, поскольку они не содержат содержимого файла, который они представляют. Чтобы получить встраивание, обязательно загрузите содержимое файла через Git LFS перед сборкой.

- TypeScript по умолчанию не распознает импорт статических ресурсов как допустимые модули. Чтобы это исправить, включите [`vite/client`](./features#client-types).

::: tip Встраивание SVG через `url()`
При передаче URL-адреса SVG в вручную созданный `url()` с помощью JS, переменную следует заключить в двойные кавычки.

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### Явный импорт URL

Ресурсы, которые не включены во внутренний список или в `assetsInclude`, могут быть явно импортированы как URL-адрес с использованием суффикса `?url`. Это полезно, например, для импорта [Houdini Paint Worklets](https://houdini.how/usage).

```js twoslash
import 'vite/client'
// ---cut---
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Явная встроенная обработка

Активы можно явно импортировать со встраиванием или без встраивания, используя суффикс `?inline` или `?no-inline` соответственно.

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### Импорт ресурса в виде строки

Ресурсы можно импортировать в виде строк, используя суффикс `?raw`.

```js twoslash
import 'vite/client'
// ---cut---
import shaderString from './shader.glsl?raw'
```

### Импорт скрипта в качестве рабочего

Скрипты можно импортировать как веб-воркеры с суффиксом `?worker` или `?sharedworker`.

```js twoslash
import 'vite/client'
// ---cut---
// Separate chunk in the production build
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
// ---cut---
// sharedworker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
// ---cut---
// Inlined as base64 strings
import InlineWorker from './shader.js?worker&inline'
```

Подробнее смотрите в [разделе Web Worker](./features.md#web-workers).

## Каталог `public`

Если у вас есть ресурсы, которые:

- Никогда не упоминается в исходном коде (например, `robots.txt`)
- Должно сохраняться точно такое же имя файла (без хеширования)
- ...или вы просто не хотите сначала импортировать ресурс, чтобы получить его URL-адрес

Затем вы можете поместить ресурс в специальный каталог `public` в корне вашего проекта. Ресурсы в этом каталоге будут обслуживаться по корневому пути `/` во время разработки и скопированы в корень каталога dist как есть.

По умолчанию используется каталог `<root>/public`, но его можно настроить с помощью [параметра `publicDir`](/config/shared-options.md#publicdir).

Обратите внимание, что вы всегда должны ссылаться на ресурсы `public`, используя абсолютный корневой путь — например, `public/icon.png` следует ссылаться в исходном коде как `/icon.png`.

## новый URL(url, import.meta.url)

[import.meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) — это собственная функция ESM, которая предоставляет URL-адрес текущего модуля. Объединив его с собственным [конструктором URL](https://developer.mozilla.org/en-US/docs/Web/API/URL), мы можем получить полный разрешенный URL-адрес статического ресурса, используя относительный путь из модуля JavaScript:

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

Это изначально работает в современных браузерах — на самом деле, Vite вообще не нужно обрабатывать этот код во время разработки!

Этот шаблон также поддерживает динамические URL-адреса через литералы шаблонов:

```js
function getImageUrl(name) {
  // note that this does not include files in subdirectories
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

Во время производственной сборки Vite выполнит необходимые преобразования, чтобы URL-адреса по-прежнему указывали на правильное местоположение даже после объединения и хеширования активов. Однако строка URL должна быть статической, чтобы ее можно было проанализировать, иначе код останется как есть, что может привести к ошибкам во время выполнения, если `build.target` не поддерживает `import.meta.url`.

```js
// Vite не изменит это
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details How it works

Vite преобразует функцию `getImageUrl` в:

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning Не работает с SSR
Этот шаблон не работает, если вы используете Vite для рендеринга на стороне сервера, поскольку `import.meta.url` имеет различную семантику в браузерах по сравнению с Node.js. Пакет сервера также не может заранее определить URL-адрес хоста клиента.
:::
