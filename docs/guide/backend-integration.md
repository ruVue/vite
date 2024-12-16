# Интеграция с бекендом

:::tip Примечание
Если вы хотите обслуживать HTML с помощью традиционного бэкенда (например, Rails, Laravel), но использовать Vite для обслуживания ресурсов, проверьте наличие существующих интеграций, перечисленных в [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends).

Если вам нужна пользовательская интеграция, вы можете выполнить шаги, описанные в этом руководстве, чтобы настроить ее вручную.
:::

1. В конфигурации Vite настройте запись и включите манифест сборки:

   ```js twoslash
   import { defineConfig } from 'vite'
   // ---cut---
   // vite.config.js
   export default defineConfig({
     build: {
       // generate .vite/manifest.json in outDir
       manifest: true,
       rollupOptions: {
         // overwrite default .html entry
         input: '/path/to/main.js',
       },
     },
   })
   ```

   Если вы не отключили [модуль полифилл предварительной загрузки](/config/build-options.md#build-polyfillmodulepreload), вам также необходимо импортировать полифил в свою запись.

   ```js
   // add the beginning of your app entry
   import 'vite/modulepreload-polyfill'
   ```

2. Для разработки добавьте следующее в HTML-шаблон вашего сервера (замените `http://localhost:5173` на локальный URL-адрес, по которому работает Vite):

   ```html
   <!-- if development -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   Чтобы правильно обслуживать активы, у вас есть два варианта:

   - Убедитесь, что сервер настроен на прокси-запросы статических ресурсов на сервер Vite
   - Установите [`server.origin`](/config/server-options.md#server-origin) , чтобы сгенерированные URL-адреса ресурсов разрешались с использованием URL-адреса внутреннего сервера вместо относительного пути

   Это необходимо для правильной загрузки таких ресурсов, как изображения.

   Обратите внимание, что если вы используете React с `@vitejs/plugin-react`, вам также необходимо добавить это перед приведенными выше скриптами, поскольку плагин не может изменять HTML-код, который вы обслуживаете (замените `http://localhost:5173` с локальным URL-адресом, по которому работает Vite):

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. Для производства: после запуска `vite build` файл `.vite/manifest.json` будет создан вместе с другими файлами ресурсов. Пример файла манифеста выглядит следующим образом:

   ```json
   {
     "_shared-!~{003}~.js": {
       "file": "assets/shared-ChJ_j-JJ.css",
       "src": "_shared-!~{003}~.js"
     },
     "_shared-B7PI925R.js": {
       "file": "assets/shared-B7PI925R.js",
       "name": "shared",
       "css": ["assets/shared-ChJ_j-JJ.css"]
     },
     "baz.js": {
       "file": "assets/baz-B2H3sXNv.js",
       "name": "baz",
       "src": "baz.js",
       "isDynamicEntry": true
     },
     "views/bar.js": {
       "file": "assets/bar-gkvgaI9m.js",
       "name": "bar",
       "src": "views/bar.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "dynamicImports": ["baz.js"]
     },
     "views/foo.js": {
       "file": "assets/foo-BRBmoGS9.js",
       "name": "foo",
       "src": "views/foo.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "css": ["assets/foo-5UjPuW-k.css"]
     }
   }
   ```

   - Манифест имеет структуру `Record<name, chunk>`.
   - Для входных или динамических входных фрагментов ключом является относительный путь src от корня проекта.
   - Для фрагментов, не являющихся входными, ключ представляет собой базовое имя сгенерированного файла с префиксом `_`.
   - Чанки будут содержать информацию о его статическом и динамическом импорте (оба являются ключами, которые сопоставляются с соответствующим фрагментом в манифесте), а также о соответствующих файлах CSS и ресурсов (если они есть).

4. Этот файл можно использовать для отображения ссылок или предварительной загрузки директив с хешированными именами файлов.

   Вот пример HTML-шаблона для отображения правильных ссылок. Синтаксис здесь только для пояснения,
   замените на язык шаблонов вашего сервера. Функция `importedChunks` приведена
   для иллюстрации и не предоставляется Vite.

   ```html
   <!-- if production -->

   <!-- for cssFile of manifest[name].css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <!-- for chunk of importedChunks(manifest, name) -->
   <!-- for cssFile of chunk.css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <script type="module" src="/{{ manifest[name].file }}"></script>

   <!-- for chunk of importedChunks(manifest, name) -->
   <link rel="modulepreload" href="/{{ chunk.file }}" />
   ```

   Specifically, a backend generating HTML should include the following tags given a manifest
   file and an entry point:

   - A `<link rel="stylesheet">` tag for each file in the entry point chunk's `css` list
   - Recursively follow all chunks in the entry point's `imports` list and include a
     `<link rel="stylesheet">` tag for each CSS file of each imported chunk.
   - A tag for the `file` key of the entry point chunk (`<script type="module">` for JavaScript,
     or `<link rel="stylesheet">` for CSS)
   - Optionally, `<link rel="modulepreload">` tag for the `file` of each imported JavaScript
     chunk, again recursively following the imports starting from the entry point chunk.

   Following the above example manifest, for the entry point `views/foo.js` the following tags should be included in production:

   ```html
   <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/foo-BRBmoGS9.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   While the following should be included for the entry point `views/bar.js`:

   ```html
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/bar-gkvgaI9m.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```
