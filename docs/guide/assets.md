# Обработка статических ресурсов

- Похожие: [Базовый публичный путь](./build#public-base-path)
- Похожие: [параметр конфигурации `assetsInclude`](/config/#assetsinclude)

## Импорт объекта как URL

Импорт статического ресурса вернет разрешенный общедоступный URL-адрес при его обслуживании:

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Например, `imgUrl` будет `/img.png` во время разработки и станет `/assets/img.2d8efhg.png` в производственной сборке.

Поведение похоже на `file-loader` из webpack. Разница в том, что импорт может осуществляться как с использованием абсолютных общедоступных путей (на основе корня проекта во время разработки), так и относительных путей.

- Ссылки `url()` в CSS обрабатываются таким же образом.

- При использовании плагина Vue ссылки на ресурсы в шаблонах Vue SFC автоматически преобразуются в импорт.

- Общие типы файлов изображений, мультимедиа и шрифтов автоматически определяются как ресурсы. Вы можете расширить внутренний список, используя [параметр `assetsInclude`](/config/#assetsinclude).

- Ресурсы, на которые ссылаются, включаются как часть графа ресурсов сборки, получают хешированные имена файлов и могут обрабатываться плагинами для оптимизации.

- Ресурсы меньше в байтах, чем [параметр `assetsInlineLimit`](/config/#build-assetsinlinelimit), будут встроены как URL-адреса данных base64.

### Явный импорт URL

Ресурсы, которые не включены во внутренний список или в `assetsInclude`, могут быть явно импортированы как URL-адрес с использованием суффикса `?url`. Это полезно, например, для импорта [Houdini Paint Worklets](https://houdini.how/usage).

```js
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Импорт ресурса в виде строки

Ресурсы можно импортировать в виде строк, используя суффикс `?raw`.

```js
import shaderString from './shader.glsl?raw'
```

### Импорт скрипта в качестве рабочего

Скрипты можно импортировать как веб-воркеры с суффиксом `?worker` или `?sharedworker`.

```js
// Separate chunk in the production build
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js
// sharedworker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js
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

Каталог по умолчанию `<root>/public`, но его можно настроить с помощью [параметра `publicDir`](/config/#publicdir).

Обратите внимание, что:

- Вы всегда должны ссылаться на `public` ресурсы, используя абсолютный корневой путь – например, `public/icon.png` следует указывать в исходном коде как `/icon.png`.
- Ресурсы в `public` нельзя импортировать из JavaScript.

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
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

Во время производственной сборки Vite выполнит необходимые преобразования, чтобы URL-адреса по-прежнему указывали на правильное местоположение даже после объединения и хеширования активов. Однако строка URL должна быть статической, чтобы ее можно было проанализировать, иначе код останется как есть, что может привести к ошибкам во время выполнения, если `build.target` не поддерживает `import.meta.url`

```js
// Vite will not transform this
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: warning Не работает с SSR
Этот шаблон не работает, если вы используете Vite для рендеринга на стороне сервера, поскольку семантика `import.meta.url` в браузерах отличается от семантики Node.js. Комплект сервера также не может заранее определить URL-адрес хоста клиента.
:::

::: warning Требуется конфиг Esbuild
Для этого шаблона необходимо, чтобы цель esbuild была установлена на `es2020` или выше. `vite@2.x` использует `es2019` в качестве цели по умолчанию. Установите для [build-target](https://vitejs.dev/config/#build-target) и [optimizedeps.esbuildoptions.target](https://vitejs.dev/config/#optimizedeps-esbuildoptions) значение `es2020` или выше, если вы собираетесь использовать эту часть.
:::
