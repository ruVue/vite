# Плагины

:::tip ПРИМЕЧАНИЕ
Vite стремится обеспечить готовую поддержку распространенных шаблонов веб-разработки. Прежде чем искать плагин Vite или Compatible Rollup, ознакомьтесь с [Руководством по функциям](../guide/features.md). Многие случаи, когда в проекте Rollup потребуется плагин, уже описаны в Vite.
:::

Ознакомьтесь с [Использование плагинов](../guide/using-plugins) для получения информации о том, как использовать плагины.

## Официальные плагины

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

- Обеспечивает поддержку отдельных файловых компонентов Vue 3.

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

- Обеспечивает поддержку Vue 3 JSX (через [специальное преобразование Babel](https://github.com/vuejs/jsx-next)).

### [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

- Использует esbuild и Babel, обеспечивая быстрый HMR с небольшим размером пакета и гибкостью, позволяющей использовать конвейер преобразования Babel.

### [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)

- Использует esbuild во время сборки, но заменяет Babel на SWC во время разработки. Для больших проектов, не требующих нестандартных расширений React, холодный запуск и замена горячего модуля (HMR) могут быть значительно быстрее.

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- Обеспечивает поддержку устаревших браузеров для производственной сборки.

## Плагины сообщества

Проверьте [awesome-vite](https://github.com/vitejs/awesome-vite#plugins) - вы также можете отправить PR, чтобы перечислить там свои плагины.

## Плагины Rollup

[Плагины Vite](../guide/api-plugin) являются расширением интерфейса плагинов Rollup. Дополнительную информацию смотрите в разделе [Совместимость подключаемых модулей объединения](../guide/api-plugin#rollup-plugin-compatibility).
