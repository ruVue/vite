# Начало работы

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## Обзор

Vite (французское слово для «быстрого», произносится `/vit/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button>, как и "veet") — это инструмент сборки, цель которого — обеспечить более быструю и экономичную разработку современных веб-проектов. Он состоит из двух основных частей:

- Сервер разработки, который предоставляет [многочисленные улучшения функций](./features) по сравнению с [нативными модулями ES](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), например чрезвычайно быстрая [горячая замена модуля (Hot Module Replacement) (HMR)](./features#hot-module-replacement).

- Команда сборки, которая связывает ваш код с [Rollup](https://rollupjs.org), предварительно настроенным для вывода высокооптимизированных статических ресурсов для продакшена.

Vite упрям и поставляется с разумными настройками по умолчанию. О возможностях читайте в [Руководстве по функциям](./features). Поддержка фреймворков или интеграция с другими инструментами возможна через [Плагины](./using-plugins). В [Разделе конфигурации](../config/) объясняется, как при необходимости адаптировать Vite к вашему проекту.

Vite также обладает широкими возможностями расширения благодаря [API плагинов](./api-plugin) и [JavaScript API](./api-javascript) с полной поддержкой типизации.

Вы можете узнать больше об обосновании проекта в разделе [Почему Vite](./why).

## Поддержка браузера

Во время разработки Vite устанавливает [`esnext` в качестве цели преобразования](https://esbuild.github.io/api/#target), поскольку мы предполагаем, что используется современный браузер, поддерживающий все новейшие функции JavaScript и CSS. . Это предотвращает снижение синтаксиса, позволяя Vite обслуживать модули как можно ближе к исходному исходному коду.

Для производственной сборки по умолчанию Vite ориентирован на браузеры, которые поддерживают [нативные ES Modules](https://caniuse.com/es6-module), [нативный динамический импорт ESM](https://caniuse.com/es6-module-dynamic-import), и [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta). Устаревшие браузеры могут поддерживаться через официальный [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy). Дополнительные сведения смотрите в разделе [Сборка для производства](./build) section for more details.

## Попробуйте Vite онлайн

Вы можете попробовать Vite онлайн на [StackBlitz](https://vite.new/). Он запускает установку сборки на основе Vite непосредственно в браузере, поэтому она почти идентична локальной установке, но не требует установки чего-либо на вашем компьютере. Вы можете перейти к `vite.new/{template}`, чтобы выбрать, какой фреймворк использовать.

Поддерживаемые пресеты шаблонов:

|             JavaScript              |                TypeScript                 |
| :---------------------------------: | :---------------------------------------: |
| [vanilla](https://vite.new/vanilla) | [vanilla-ts](https://vite.new/vanilla-ts) |
|     [vue](https://vite.new/vue)     |     [vue-ts](https://vite.new/vue-ts)     |
|   [react](https://vite.new/react)   |   [react-ts](https://vite.new/react-ts)   |
|  [preact](https://vite.new/preact)  |  [preact-ts](https://vite.new/preact-ts)  |
|     [lit](https://vite.new/lit)     |     [lit-ts](https://vite.new/lit-ts)     |
|  [svelte](https://vite.new/svelte)  |  [svelte-ts](https://vite.new/svelte-ts)  |
|   [solid](https://vite.new/solid)   |   [solid-ts](https://vite.new/solid-ts)   |
|    [qwik](https://vite.new/qwik)    |    [qwik-ts](https://vite.new/qwik-ts)    |

## Создание вашего первого проекта Vite

::: tip Примечание о совместимости
Vite требует [Node.js](https://nodejs.org/en/) версии 18+ или 20+. Однако для работы некоторых шаблонов требуется более высокая версия Node.js, пожалуйста, обновите, если ваш менеджер пакетов предупредит об этом.
:::

::: code-group

```bash [NPM]
$ npm create vite@latest
```

```bash [Yarn]
$ yarn create vite
```

```bash [PNPM]
$ pnpm create vite
```

```bash [Bun]
$ bun create vite
```

:::

Тогда следуйте подсказкам!

Вы также можете напрямую указать имя проекта и шаблон, который хотите использовать, с помощью дополнительных параметров командной строки. Например, чтобы создать проект Vite + Vue, запустите:

::: code-group

```bash [NPM]
# npm 7+, extra double-dash is needed:
$ npm create vite@latest my-vue-app -- --template vue
```

```bash [Yarn]
$ yarn create vite my-vue-app --template vue
```

```bash [PNPM]
$ pnpm create vite my-vue-app --template vue
```

```bash [Bun]
$ bun create vite my-vue-app --template vue
```

:::

Смотрите [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) для получения более подробной информации о каждом поддерживаемом шаблоне: `vanilla`, `vanilla-ts`, `vue`, `vue-ts`, `react`, `react-ts`, `react-swc`, `react-swc-ts`, `preact`, `preact-ts`, `lit`, `lit-ts`, `svelte`, `svelte-ts`, `solid`, `solid-ts`, `qwik`, `qwik-ts`.

Вы можете использовать `.` для имени проекта для создания шаблонов в текущем каталоге.

## Шаблоны сообщества

create-vite — инструмент для быстрого запуска проекта из базового шаблона для популярных фреймворков. Посетите Awesome Vite, чтобы найти [шаблоны, поддерживаемые сообществом](https://github.com/vitejs/awesome-vite#templates), которые включают в себя другие инструменты или ориентированы на другие платформы.

Шаблон `https://github.com/user/project` можно опробовать в Интернете, используя `https://github.stackblitz.com/user/project` (добавив `.stackblitz` после `github` на URL-адрес проекта).

Вы также можете использовать такой инструмент, как [degit](https://github.com/Rich-Harris/degit), чтобы собрать свой проект с помощью одного из шаблонов. Предполагая, что проект находится на GitHub и использует `main` в качестве ветки по умолчанию, вы можете создать локальную копию, используя:

```bash
npx degit user/project#main my-project
cd my-project

npm install
npm run dev
```

## Ручная установка

В вашем проекте вы можете установить CLI `vite` с помощью:

::: code-group

```bash [NPM]
$ npm install -D vite
```

```bash [Yarn]
$ yarn add -D vite
```

```bash [PNPM]
$ pnpm add -D vite
```

```bash [Bun]
$ bun add -D vite
```

:::

И создайте файл `index.html` следующим образом:

```html
<p>Hello Vite!</p>
```

Затем запустите CLI `vite` в терминале:

```bash
vite
```

`index.html` будет обслуживаться по адресу `http://localhost:5173`.

## `index.html` и корень проекта

Одна вещь, которую вы, возможно, заметили, это то, что в проекте Vite `index.html` является передним и центральным, а не спрятанным внутри `public`. Это сделано намеренно: во время разработки Vite является сервером, а `index.html` — точкой входа в ваше приложение.

Vite рассматривает `index.html` как исходный код и часть графа модуля. Он разрешает `<script type="module" src="...">`, который ссылается на ваш исходный код JavaScript. Даже встроенный `<script type="module">` и CSS, на который ссылается `<link href>`, также используют функции, специфичные для Vite. Кроме того, URL-адреса внутри `index.html` автоматически перебазируются, поэтому нет необходимости в специальных заполнителях `%PUBLIC_URL%`.

Подобно статическим http-серверам, Vite имеет концепцию «корневого каталога», из которого обслуживаются ваши файлы. В остальных документах вы увидите, что он упоминается как `<root>`. Абсолютные URL-адреса в вашем исходном коде будут разрешены с использованием корня проекта в качестве основы, поэтому вы можете писать код, как если бы вы работали с обычным статическим файловым сервером (за исключением того, что он намного мощнее!). Vite также способен обрабатывать зависимости, которые разрешаются в расположении вне корневой файловой системы, что делает его пригодным для использования даже в установке на основе монорепозитория.

Vite также поддерживает [многостраничные приложения](./build#multi-page-app) с несколькими точками входа `.html`.

#### Указание альтернативного корня

Запуск `vite` запускает сервер разработки, используя текущий рабочий каталог в качестве root. Вы можете указать альтернативный корень с помощью `vite serve some/sub/dir`.
Обратите внимание, что Vite также разрешит [свой файл конфигурации (т. е. `vite.config.js`)](/config/#configuring-vite) внутри корня проекта, поэтому вам придется переместить его, если корень будет изменен.

## Интерфейс командной строки (CLI)

В проекте, где установлен Vite, вы можете использовать двоичный файл `vite` в своих сценариях npm или запускать его напрямую с `npx vite`. Вот сценарии npm по умолчанию в созданном проекте Vite:

<!-- prettier-ignore -->
```json
{
  "scripts": {
    "dev": "vite", // start dev server, aliases: `vite dev`, `vite serve`
    "build": "vite build", // build for production
    "preview": "vite preview" // locally preview production build
  }
}
```

Вы можете указать дополнительные параметры CLI, например `--port` или `--open`. Чтобы просмотреть полный список параметров CLI, запустите в своем проекте `npx vite --help`.

Узнайте больше об [интерфейсе командной строки](./cli.md)

## Использование невыпущенных коммитов

Если вы не можете дождаться нового выпуска для тестирования новейших функций, вам нужно будет клонировать [репозиторий vite](https://github.com/vitejs/vite) на свой локальный компьютер, а затем собрать и связать его самостоятельно ([pnpm](https://pnpm.io/) обязателен):

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # use your preferred package manager for this step
```

Затем перейдите в свой проект на основе Vite и запустите `pnpm link --global vite` (или менеджер пакетов, который вы использовали для глобальной ссылки на `vite`). Теперь перезапустите сервер разработки, чтобы идти в ногу со временем!

## Сообщество

Если у вас есть вопросы или вам нужна помощь, свяжитесь с сообществом в [Discord](https://chat.vite.dev) и [GitHub Discussions](https://github.com/vitejs/vite/discussions).
