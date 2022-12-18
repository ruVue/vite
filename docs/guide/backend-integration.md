# Интеграция с бекендом

:::tip Примечание
Если вы хотите обслуживать HTML с помощью традиционного бэкенда (например, Rails, Laravel), но использовать Vite для обслуживания ресурсов, проверьте наличие существующих интеграций, перечисленных в [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends).

Если вам нужна пользовательская интеграция, вы можете выполнить шаги, описанные в этом руководстве, чтобы настроить ее вручную.
:::

1. В конфигурации Vite настройте запись и включите манифест сборки:

   ```js
   // vite.config.js
   export default defineConfig({
     build: {
       // generate manifest.json in outDir
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

   Обратите внимание, если вы используете React с `@vitejs/plugin-react`, вам также необходимо добавить это перед приведенными выше сценариями, поскольку плагин не может изменять HTML, который вы обслуживаете:

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. Для производства: после запуска `vite build` будет создан файл `manifest.json` вместе с другими файлами активов. Пример файла манифеста выглядит так:

   ```json
   {
     "main.js": {
       "file": "assets/main.4889e940.js",
       "src": "main.js",
       "isEntry": true,
       "dynamicImports": ["views/foo.js"],
       "css": ["assets/main.b82dbe22.css"],
       "assets": ["assets/asset.0ab0f9cd.png"]
     },
     "views/foo.js": {
       "file": "assets/foo.869aea0d.js",
       "src": "views/foo.js",
       "isDynamicEntry": true,
       "imports": ["_shared.83069a53.js"]
     },
     "_shared.83069a53.js": {
       "file": "assets/shared.83069a53.js"
     }
   }
   ```

   - Манифест имеет структуру `Record<name, chunk>`.
   - Для входных или динамических входных фрагментов ключом является относительный путь src от корня проекта.
   - Для фрагментов, не являющихся входными, ключ представляет собой базовое имя сгенерированного файла с префиксом `_`.
   - Чанки будут содержать информацию о его статическом и динамическом импорте (оба являются ключами, которые сопоставляются с соответствующим фрагментом в манифесте), а также о соответствующих файлах CSS и ресурсов (если они есть).

   Вы можете использовать этот файл для отображения ссылок или директив предварительной загрузки с хэшированными именами файлов (примечание: приведенный здесь синтаксис предназначен только для пояснения, замените его языком шаблонов вашего сервера):

   ```html
   <!-- if production -->
   <link rel="stylesheet" href="/assets/{{ manifest['main.js'].css }}" />
   <script type="module" src="/assets/{{ manifest['main.js'].file }}"></script>
   ```
