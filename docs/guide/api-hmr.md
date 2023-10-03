# HMR API

:::tip Примечание
Это клиентский HMR API. Для обработки обновления HMR в плагинах смотрите [handleHotUpdate](./api-plugin#handlehotupdate).

Ручной HMR API в первую очередь предназначен для авторов фреймворков и инструментов. Как конечный пользователь, HMR, скорее всего, уже обрабатывается для вас в начальных шаблонах конкретной платформы.
:::

Vite предоставляет свой ручной HMR API через специальный объект `import.meta.hot`:

```ts
interface ImportMeta {
  readonly hot?: ViteHotContext
}

type ModuleNamespace = Record<string, any> & {
  [Symbol.toStringTag]: 'Module'
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void

  dispose(cb: (data: any) => void): void
  prune(cb: (data: any) => void): void
  invalidate(message?: string): void

  // `InferCustomEventPayload` provides types for built-in Vite events
  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<T extends string>(event: T, data?: InferCustomEventPayload<T>): void
}
```

## Требуемая условная защита

Прежде всего, обязательно защитите все использование HMR API с помощью условного блока, чтобы код можно было встряхивать в процессе продакшена:

```js
if (import.meta.hot) {
  // HMR code
}
```

## IntelliSense for TypeScript

Vite provides type definitions for `import.meta.hot` in [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts). You can create an `env.d.ts` in the `src` directory so TypeScript picks up the type definitions:

```ts
/// <reference types="vite/client" />
```

## `hot.accept(cb)`

Чтобы модуль принимался самостоятельно, используйте `import.meta.hot.accept` с обратным вызовом, который получает обновленный модуль:

```js
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // newModule is undefined when SyntaxError happened
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

Модуль, который «принимает» горячие обновления, считается **границей HMR**.

HMR Vite фактически не заменяет первоначально импортированный модуль: если граничный модуль HMR реэкспортирует импорт из хранилища, то он отвечает за обновление этого реэкспорта (и этот экспорт должен использовать `let`). Кроме того, импортеры, находящиеся выше по цепочке от пограничного модуля, не будут уведомлены об изменении. Этой упрощенной реализации HMR достаточно для большинства случаев использования разработчиками, позволяя нам пропустить дорогостоящую работу по созданию прокси-модулей.

Vite требует, чтобы вызов этой функции отображался как `import.meta.hot.accept(` (с учетом пробелов) в исходном коде, чтобы модуль мог принять обновление. Это требование статического анализа, который Vite выполняет для включить поддержку HMR для модуля.

## `hot.accept(deps, cb)`

Модуль также может принимать обновления от прямых зависимостей без перезагрузки:

```js
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // the callback receives the updated './foo.js' module
    newFoo?.foo()
  })

  // Can also accept an array of dep modules:
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // The callback receives an array where only the updated module is
      // non null. If the update was not successful (syntax error for ex.),
      // the array is empty
    },
  )
}
```

## `hot.dispose(cb)`

Самопринимающий модуль или модуль, который ожидает принятия другими, может использовать `hot.dispose` для очистки любых постоянных побочных эффектов, созданных его обновленной копией:

```js
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // cleanup side effect
  })
}
```

## `hot.prune(cb)`

Зарегистрируйте обратный вызов, который будет вызываться, когда модуль больше не импортируется на страницу. По сравнению с `hot.dispose`, это можно использовать, если исходный код сам очищает побочные эффекты при обновлениях, и вам нужно очищать только тогда, когда он удаляется со страницы. В настоящее время Vite использует это для импорта `.css`.

```js
function setupOrReuseSideEffect() {}

setupOrReuseSideEffect()

if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // cleanup side effect
  })
}
```

## `hot.data`

Объект `import.meta.hot.data` сохраняется в разных экземплярах одного и того же обновленного модуля. Его можно использовать для передачи информации от предыдущей версии модуля к следующей.

## `hot.decline()`

В настоящее время это noop и существует для обратной совместимости. Это может измениться в будущем, если для него появится новое использование. Чтобы указать, что модуль не поддерживает горячее обновление, используйте `hot.invalidate()`.

## `hot.invalidate(message?: string)`

Самоподдерживающийся модуль может понять во время выполнения, что он не может обработать обновление HMR, и поэтому обновление необходимо принудительно распространить среди импортеров. Вызывая `import.meta.hot.invalidate()`, сервер HMR аннулирует импортеры вызывающей стороны, как если бы вызывающая сторона не принимала себя. Это зарегистрирует сообщение как в консоли браузера, так и в терминале. Вы можете передать сообщение, чтобы дать некоторый контекст о том, почему произошла недействительность.

Обратите внимание, что вы всегда должны вызывать `import.meta.hot.accept`, даже если вы планируете вызывать `invalidate` сразу после этого, иначе клиент HMR не будет прослушивать будущие изменения в самопринимающемся модуле. Чтобы четко сообщить о ваших намерениях, мы рекомендуем вызывать `invalidate` в обратном вызове `accept` следующим образом:

```js
import.meta.hot.accept((module) => {
  // You may use the new module instance to decide whether to invalidate.
  if (cannotHandleUpdate(module)) {
    import.meta.hot.invalidate()
  }
})
```

## `hot.on(event, cb)`

Прослушайте событие HMR.

Следующие события HMR автоматически отправляются Vite:

- `'vite:beforeUpdate'`, когда должно быть применено обновление (например, модуль будет заменен)
- `'vite:afterUpdate'`, когда обновление только что было применено (например, был заменен модуль)
- `'vite:beforeFullReload'`, когда должна произойти полная перезагрузка
- `'vite:beforePrune'`, когда модули, которые больше не нужны, собираются быть удалены
- `'vite:invalidate'`, когда модуль становится недействительным с помощью `import.meta.hot.invalidate()`
- `'vite:error'` при возникновении ошибки (например, синтаксической ошибки)
- `'vite:ws:disconnect'`, когда соединение WebSocket потеряно
- `'vite:ws:connect'`, когда соединение WebSocket (повторно) установлено

Пользовательские события HMR также можно отправлять из плагинов. Дополнительные сведения смотрите в разделе [handleHotUpdate](./api-plugin#handlehotupdate).

## `hot.send(event, data)`

Отправлять пользовательские события обратно на сервер разработки Vite.

При вызове перед подключением данные будут помещены в буфер и отправлены после установления соединения.

Дополнительные сведения см. в разделе [Связь клиент-сервер](/guide/api-plugin.html#client-server-communication).
