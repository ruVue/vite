# Параметры работника

Options related to Web Workers.

## worker.format

- **Тип:** `'es' | 'iife'`
- **По умолчанию:** `iife`

Выходной формат для пакета рабочего.

## worker.plugins

- **Тип:** [`(Plugin | Plugin[])[]`](./shared-options#plugins)

Плагины Vite, которые применяются к рабочему пакету. Обратите внимание, что [config.plugins](./shared-options#plugins) не применяется к рабочим процессам, вместо этого его следует настроить здесь.

## worker.rollupOptions

- **Тип:** [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

Rollup для создания рабочего пакета.
