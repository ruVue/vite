# Развертывание статического сайта

Следующие руководства основаны на некоторых общих предположениях:

- Вы используете расположение вывода сборки по умолчанию (`dist`). Это местоположение [можно изменить с помощью `build.outDir`](https://vitejs.dev/config/#build-outdir), и в этом случае вы можете экстраполировать инструкции из этих руководств.
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
Эти руководства содержат инструкции по выполнению статического развертывания вашего сайта Vite. Vite также имеет экспериментальную поддержку рендеринга на стороне сервера. SSR относится к интерфейсным платформам, которые поддерживают запуск одного и того же приложения в Node.js, предварительный рендеринг его в HTML и, наконец, его гидратацию на клиенте. Ознакомьтесь с [Руководством по SSR](./ssr), чтобы узнать об этой функции. С другой стороны, если вам нужна интеграция с традиционными серверными фреймворками, ознакомьтесь с [Руководством по интеграции серверной части](./backend-integration).
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

Вы можете настроить порт сервера py, передав флаг `--port` в качестве аргумента.

```json
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

Теперь метод `preview` запустит сервер по адресу `http://localhost:8080`.

## GitHub Pages

1. Установите правильный `base` в `vite.config.js`.

   Если вы выполняете развертывание на `https://<USERNAME>.github.io/`, вы можете опустить `base`, так как по умолчанию это `'/'`.

   Если вы выполняете развертывание на `https://<USERNAME>.github.io/<REPO>/`, например, ваш репозиторий находится в `https://github.com/<USERNAME>/<REPO>`, установите `base` в `'/<REPO>/'`.

2. Внутри вашего проекта создайте `deploy.sh` со следующим содержимым (с выделенными строками, раскомментированными соответствующим образом) и запустите его для развертывания:

   ```bash{13,20,23}
   #!/usr/bin/env sh

   # abort on errors
   set -e

   # build
   npm run build

   # navigate into the build output directory
   cd dist

   # if you are deploying to a custom domain
   # echo 'www.example.com' > CNAME

   git init
   git add -A
   git commit -m 'deploy'

   # if you are deploying to https://<USERNAME>.github.io
   # git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git main

   # if you are deploying to https://<USERNAME>.github.io/<REPO>
   # git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages

   cd -
   ```

::: tip
Вы также можете запустить приведенный выше сценарий в настройках CI, чтобы включить автоматическое развертывание при каждом нажатии.
:::

### GitHub Pages и Travis CI

1. Установите правильный `base` в `vite.config.js`.

   Если вы выполняете развертывание на `https://<USERNAME or GROUP>.github.io/`, вы можете опустить `base`, так как по умолчанию это `'/'`.

   Если вы выполняете развертывание на `https://<USERNAME or GROUP>.github.io/<REPO>/`, например, ваш репозиторий находится в `https://github.com/<USERNAME>/<REPO>`, установите `base` в `'/<REPO>/'`.

2. Создайте файл с именем `.travis.yml` в корне вашего проекта.

3. Запустите `npm install` локально и зафиксируйте сгенерированный файл блокировки (`package-lock.json`).

4. Используйте шаблон поставщика развертывания GitHub Pages и следуйте [документации Travis CI](https://docs.travis-ci.com/user/deployment/pages/).

   ```yaml
   language: node_js
   node_js:
     - lts/*
   install:
     - npm ci
   script:
     - npm run build
   deploy:
     provider: pages
     skip_cleanup: true
     local_dir: dist
     # A token generated on GitHub allowing Travis to push code on you repository.
     # Set in the Travis settings page of your repository, as a secure variable.
     github_token: $GITHUB_TOKEN
     keep_history: true
     on:
       branch: main
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

## Heroku

1. Установите [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).

2. Создайте учетную запись Heroku, [зарегистрировавшись](https://signup.heroku.com).

3. Запустите `heroku login` и введите свои учетные данные Heroku:

   ```bash
   $ heroku login
   ```

4. Создайте файл с именем `static.json` в корне вашего проекта со следующим содержимым:

   `static.json`:

   ```json
   {
     "root": "./dist"
   }
   ```

   Это конфигурация вашего сайта; читайте больше на [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static).

5. Настройте свой Heroku git remote:

   ```bash
   # version change
   $ git init
   $ git add .
   $ git commit -m "My site ready for deployment."

   # creates a new app with a specified name
   $ heroku apps:create example

   # set buildpack for static sites
   $ heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static.git
   ```

6. Разверните свой сайт:

   ```bash
   # publish site
   $ git push heroku main

   # opens a browser to view the Dashboard version of Heroku CI
   $ heroku open
   ```

## Vercel

### Vercel CLI

1. Установите [Vercel CLI](https://vercel.com/cli) и запустите `vercel` для развертывания.
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

1. Отправьте свой код в свой репозиторий git (GitHub, GitLab, BitBucket).
2. [Импортируйте свой проект Vite](https://vercel.com/new) в Vercel.
3. Vercel обнаружит, что вы используете Vite, и активирует правильные настройки для вашего развертывания.
4. Ваше приложение развернуто! (например, [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/))

После того, как ваш проект будет импортирован и развернут, все последующие отправки в ветки будут генерировать [предварительные развертывания](https://vercel.com/docs/concepts/deployments/environments#preview), а все изменения, внесенные в производственную ветку (обычно “main”) приведет к [Производственному развертыванию](https://vercel.com/docs/concepts/deployments/environments#production).

Узнайте больше об Vercel [интеграции Git](https://vercel.com/docs/concepts/git).

## Статические веб-приложения Azure

Вы можете быстро развернуть свое приложение Vite с помощью службы Microsoft Azure [статические веб-приложения](https://aka.ms/staticwebapps). Тебе нужно:

- Учетная запись Azure и ключ подписки. Вы можете создать [бесплатную учетную запись Azure здесь](https://azure.microsoft.com/free).
- Код вашего приложения отправлен на [GitHub](https://github.com).
- [Расширение SWA](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) в [Visual Studio Code](https://code.visualstudio.com).

Установите расширение в VS Code и перейдите в корень приложения. Откройте расширение «Статические веб-приложения», войдите в Azure и щелкните значок «+», чтобы создать новое статическое веб-приложение. Вам будет предложено указать, какой ключ подписки использовать.

Следуйте указаниям мастера, запущенного расширением, чтобы дать вашему приложению имя, выбрать предустановку фреймворка и указать корень приложения (обычно `/`) и местоположение созданного файла `/dist`. Мастер запустится и создаст действие GitHub в вашем репозитории в папке `.github`.

Действие будет работать для развертывания вашего приложения (следите за его ходом на вкладке «Действия» вашего репозитория), и после успешного завершения вы сможете просмотреть свое приложение по адресу, указанному в окне хода выполнения расширения, нажав кнопку «Обзор веб-сайта», которая появляется, когда Действие GitHub запущено.
