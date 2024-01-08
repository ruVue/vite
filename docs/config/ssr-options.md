# Параметры SSR

## ssr.external

- **Тип:** `string[]`
- **Связанный:** [SSR Externals](/guide/ssr#ssr-externals)

Принудительно экстернализовать зависимости для SSR.

## ssr.noExternal

- **Тип:** `string | RegExp | (string | RegExp)[] | true`
- **Связанный:** [SSR Externals](/guide/ssr#ssr-externals)

Запретить экстернализацию перечисленных зависимостей для SSR. Если `true`, никакие зависимости не выносятся наружу.

## ssr.target

- **Тип:** `'node' | 'webworker'`
- **По умолчанию:** `node`

Создайте цель для сервера SSR.

## ssr.resolve.conditions

По умолчанию используется корень [`resolve.conditions`](./shared-options.md#resolve-conditions).

Эти условия используются в конвейере плагинов и влияют только на неэкстернализованные зависимости во время сборки SSR. Используйте `ssr.resolve.externalConditions`, чтобы повлиять на внешний импорт.

## ssr.resolve.externalConditions

- **Тип:** `string[]`
- **По умолчанию:** `[]`

Условия, которые используются во время импорта ssr (включая `ssrLoadModule`) внешних зависимостей.
