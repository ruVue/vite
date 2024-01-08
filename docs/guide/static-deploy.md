# Развертывание статического сайта

Следующие руководства основаны на некоторых общих предположениях:

- Вы используете расположение вывода сборки по умолчанию (`dist`). Это расположение [можно изменить с помощью `build.outDir`](/config/build-options.md#build-outdir), и в этом случае вы можете экстраполировать инструкции из этих руководств.
- Вы используете npm. Вы можете использовать эквивалентные команды для запуска скриптов, если используете Yarn или другие менеджеры пакетов.
- Vite установлен как локальная зависимость разработчика в вашем проекте, и вы настроили следующие сценарии npm:

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Важно отметить, что `vite preview` предназначен для локального предварительного просмотра сборки, а не для рабочего сервера.

::: tip ПРИМЕЧАНИЕ
Эти руководства содержат инструкции по выполнению статического развертывания вашего сайта Vite. Vite также поддерживает рендеринг на стороне сервера. SSR относится к интерфейсным платформам, которые поддерживают запуск одного и того же приложения в Node.js, предварительный рендеринг его в HTML и, наконец, его гидратацию на клиенте. Ознакомьтесь с [Руководством по SSR](./ssr), чтобы узнать об этой функции. С другой стороны, если вам нужна интеграция с традиционными серверными фреймворками, ознакомьтесь с [Руководством по интеграции серверной части](./backend-integration).
:::

## Создание приложения

Вы можете запустить команду `npm run build`, чтобы собрать приложение.

```bash
$ npm run build
```

По умолчанию вывод сборки будет помещен в `dist`. Вы можете развернуть эту папку `dist` на любой из предпочитаемых вами платформ.

### Локальное тестирование приложения

После того, как вы создали приложение, вы можете протестировать его локально, выполнив команду `npm run preview`.

```bash
$ npm run build
$ npm run preview
```

Команда `vite preview` загрузит локальный статический веб-сервер, который обслуживает файлы из `dist` по адресу `http://localhost:4173`. Это простой способ проверить, нормально ли выглядит производственная сборка в вашей локальной среде.

Вы можете настроить порт сервера, передав флаг `--port` в качестве аргумента.

```json
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

Теперь команда `preview` запустит сервер по адресу `http://localhost:8080`.

## GitHub Pages

1. Установите правильный `base` в `vite.config.js`.

   Если вы выполняете развертывание на `https://<USERNAME>.github.io/` или на личном домене через страницы GitHub (например, `www.example.com`), установите для `base` значение `'/'`. В качестве альтернативы вы можете удалить `base` из конфигурации, поскольку по умолчанию он равен `'/'`.

   Если вы выполняете развертывание на `https://<USERNAME>.github.io/<REPO>/` (например, ваш репозиторий находится по адресу `https://github.com/<USERNAME>/<REPO>`), установите для `base` значение `'/<REPO>/'`.

2. Перейдите к конфигурации своих страниц GitHub на странице настроек репозитория и выберите источник развертывания как "GitHub Actions", это позволит вам создать рабочий процесс, который собирает и развертывает ваш проект, пример рабочего процесса, который устанавливает зависимости и выполняет сборку с использованием npm. предоставлен:

   ```yml
   # Simple workflow for deploying static content to GitHub Pages
   name: Deploy static content to Pages

   on:
     # Runs on pushes targeting the default branch
     push:
       branches: ['main']

     # Allows you to run this workflow manually from the Actions tab
     workflow_dispatch:

   # Sets the GITHUB_TOKEN permissions to allow deployment to GitHub Pages
   permissions:
     contents: read
     pages: write
     id-token: write

   # Allow one concurrent deployment
   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     # Single deploy job since we're just deploying
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
         - name: Set up Node
           uses: actions/setup-node@v3
           with:
             node-version: 18
             cache: 'npm'
         - name: Install dependencies
           run: npm install
         - name: Build
           run: npm run build
         - name: Setup Pages
           uses: actions/configure-pages@v3
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v2
           with:
             # Upload dist repository
             path: './dist'
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v2
   ```

## GitLab Pages и GitLab CI

1. Установите правильный `base` в `vite.config.js`.

   Если вы выполняете развертывание на `https://<USERNAME or GROUP>.gitlab.io/`, вы можете опустить `base`, так как по умолчанию это `'/'`.

   Если вы выполняете развертывание на `https://<USERNAME or GROUP>.gitlab.io/<REPO>/`, например, ваш репозиторий находится в `https://gitlab.com/<USERNAME>/<REPO>`, установите `base` в `'/<REPO>/'`.

2. Создайте файл с именем `.gitlab-ci.yml` в корне вашего проекта с содержимым, указанным ниже. Это будет создавать и развертывать ваш сайт всякий раз, когда вы вносите изменения в свой контент:

   ```yaml
   image: node:16.5.0
   pages:
     stage: deploy
     cache:
       key:
         files:
           - package-lock.json
         prefix: npm
       paths:
         - node_modules/
     script:
       - npm install
       - npm run build
       - cp -a dist/. public/
     artifacts:
       paths:
         - public
     rules:
       - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
   ```

## Netlify

### Netlify CLI

1. Установите [Netlify CLI](https://cli.netlify.com/).
2. Создайте новый сайт с помощью `ntl init`.
3. Разверните с помощью `ntl deploy`.

```bash
# Install the Netlify CLI
$ npm install -g netlify-cli

# Create a new site in Netlify
$ ntl init

# Deploy to a unique preview URL
$ ntl deploy
```

Netlify CLI предоставит вам URL-адрес предварительного просмотра для проверки. Когда вы будете готовы приступить к работе, используйте флаг `prod`:

```bash
# Deploy the site into production
$ ntl deploy --prod
```

### Netlify с Git

1. Отправьте свой код в репозиторий (GitHub, GitLab, BitBucket, Azure DevOps).
2. [Импортируйте проект](https://app.netlify.com/start) to Netlify.
3. Выберите ветвь, выходной каталог и настройте переменные среды, если это применимо.
4. Нажмите **Деплой**.
5. Ваше приложение Vite развернуто!

После того, как ваш проект будет импортирован и развернут, все последующие отправки в ветки, отличные от рабочей ветки, вместе с запросами на вытягивание будут генерировать [превью деплой](https://docs.netlify.com/site-deploys/deploy-previews/), и все изменения, внесенные в производственную ветку (обычно «основную»), приведут к [деплою продакшена](https://docs.netlify.com/site-deploys/overview/#definitions).

## Vercel

### Vercel CLI

1. Установите [Vercel CLI](https://vercel.com/cli) и запустите `vercel` для деплоя.
2. Vercel обнаружит, что вы используете Vite, и активирует правильные настройки для вашего развертывания.
3. Ваше приложение развернуто! (например, [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/))

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### Vercel для Git

1. Загрузите свой код в свой репозиторий git (GitHub, GitLab, Bitbucket).
2. [Импортируйте свой проект Vite](https://vercel.com/new) в Vercel.
3. Vercel обнаружит, что вы используете Vite, и активирует правильные настройки для вашего развертывания.
4. Ваше приложение развернуто! (например, [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/))

После импорта и развертывания вашего проекта все последующие отправки в ветки будут генерировать [Preview Deployments](https://vercel.com/docs/concepts/deployments/environments#preview), а все изменения, внесенные в производственную ветку (обычно «main») приведет к [Production Deployment](https://vercel.com/docs/concepts/deployments/environments#production).

Узнайте больше об [интеграции Vercel с Git](https://vercel.com/docs/concepts/git).

## Cloudflare Pages

### Cloudflare Pages через Wrangler

1. Установите [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/).
2. Аутентифицируйте Wrangler с помощью своей учетной записи Cloudflare, используя `wrangler login`.
3. Запустите команду сборки.
4. Разверните с помощью `npx wrangler pages deploy dist`.

```bash
# Install Wrangler CLI
$ npm install -g wrangler

# Login to Cloudflare account from CLI
$ wrangler login

# Run your build command
$ npm run build

# Create new deployment
$ npx wrangler pages deploy dist
```

После того, как ваши ресурсы будут загружены, Wrangler предоставит вам URL-адрес предварительного просмотра для проверки вашего сайта. Когда вы войдете в панель инструментов Cloudflare Pages, вы увидите свой новый проект.

### Cloudflare Pages с Git

1. Загрузите свой код в свой репозиторий git (GitHub, GitLab).
2. Войдите в панель инструментов Cloudflare и выберите свою учетную запись в **Главная страница учетной записи** > **Страницы**.
3. Выберите **Создать новый проект** и **Подключить Git**.
4. Выберите проект git, который хотите развернуть, и нажмите **Начать настройку**.
5. Выберите соответствующий пресет фреймворка в настройках сборки в зависимости от выбранного вами фреймворка Vite.
6. Затем сохраните и разверните!
7. Ваше приложение развернуто! (например, `https://<PROJECTNAME>.pages.dev/`)

После того, как ваш проект будет импортирован и развернут, все последующие отправки в ветки будут генерировать [Preview Deployments](https://developers.cloudflare.com/pages/platform/preview-deployments/), если не указано иное в ваших [элементах управления сборкой ветки](https://developers.cloudflare.com/pages/platform/branch-build-controls/). Все изменения в производственной ветке (обычно “main”) приведут к производственному развертыванию.

Вы также можете добавлять собственные домены и управлять пользовательскими настройками сборки на страницах. Узнайте больше об [интеграции Cloudflare Pages с Git](https://developers.cloudflare.com/pages/get-started/#manage-your-site).

## Google Firebase

1. Убедитесь, что у вас установлены [firebase-tools](https://www.npmjs.com/package/firebase-tools).

2. Создайте `firebase.json` и `.firebaserc` в корне вашего проекта со следующим содержимым:

   `firebase.json`:

   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": [],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

   `.firebaserc`:

   ```js
   {
     "projects": {
       "default": "<YOUR_FIREBASE_ID>"
     }
   }
   ```

3. После запуска `npm run build` выполните развертывание с помощью команды `firebase deploy`.

## Surge

1. Сначала установите [surge](https://www.npmjs.com/package/surge), если вы еще этого не сделали.

2. Запустите `npm run build`.

3. Выполните развертывание для surge, набрав `surge dist`.

Вы также можете выполнить развертывание в [пользовательском домене](http://surge.sh/help/adding-a-custom-domain), добавив `surge dist yourdomain.com`.

## Azure Static Web Apps

Вы можете быстро развернуть свое приложение Vite с помощью службы Microsoft Azure [статические веб-приложения](https://aka.ms/staticwebapps). Тебе нужно:

- Учетная запись Azure и ключ подписки. Вы можете создать [бесплатную учетную запись Azure здесь](https://azure.microsoft.com/free).
- Код вашего приложения отправлен на [GitHub](https://github.com).
- [Расширение SWA](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) в [Visual Studio Code](https://code.visualstudio.com).

Установите расширение в VS Code и перейдите в корень приложения. Откройте расширение «Статические веб-приложения», войдите в Azure и щелкните значок «+», чтобы создать новое статическое веб-приложение. Вам будет предложено указать, какой ключ подписки использовать.

Следуйте указаниям мастера, запущенного расширением, чтобы дать вашему приложению имя, выбрать предустановку фреймворка и указать корень приложения (обычно `/`) и местоположение созданного файла `/dist`. Мастер запустится и создаст действие GitHub в вашем репозитории в папке `.github`.

Действие будет работать для развертывания вашего приложения (следите за его ходом на вкладке «Действия» вашего репозитория), и после успешного завершения вы сможете просмотреть свое приложение по адресу, указанному в окне хода выполнения расширения, нажав кнопку «Обзор веб-сайта», которая появляется, когда Действие GitHub запущено.

## Render

Вы можете развернуть свое приложение Vite в качестве статического сайта на [Render](https://render.com/).

1. Создайте [учетную запись Render](https://dashboard.render.com/register).

2. В [Панель инструментов](https://dashboard.render.com/), нажмите кнопку **Создать** и выберите **Статический сайт**.

3. Подключите свою учетную запись GitHub/GitLab или используйте общедоступный репозиторий.

4. Укажите имя проекта и ветку.

   - **Команда сборки**: `npm run build`
   - **Каталог публикации**: `dist`

5. Нажмите **Создать статический сайт**.

   Ваше приложение должно быть развернуто на `https://<PROJECTNAME>.onrender.com/`.

По умолчанию любая новая фиксация, отправленная в указанную ветку, автоматически запускает новое развертывание. [Авторазвертывание](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service) можно настроить в настройках проекта.

Вы также можете добавить в свой проект [пользовательский домен](https://render.com/docs/custom-domains).

## Flightcontrol

Разверните свой статический сайт с помощью [Flightcontrol](https://www.flightcontrol.dev/?ref=docs-vite), следуя этим [инструкциям](https://www.flightcontrol.dev/docs/reference/examples/vite?ref=docs-vite)

## AWS Amplify Hosting

Разверните свой статический сайт с помощью [хостинга AWS Amplify](https://aws.amazon.com/amplify/hosting/), следуя этим [инструкциям](https://docs.amplify.aws/guides/hosting/vite/q/platform/js/)

## Kinsta Static Site Hosting

Вы можете развернуть свое приложение Vite в качестве статического сайта на [Kinsta](https://kinsta.com/static-site-hosting/), следуя этим [инструкциям](https://kinsta.com/docs/react-vite-example/).
