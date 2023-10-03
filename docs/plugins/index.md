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

### [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)

- Provides Vue 2.7 Single File Components support.

### [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

- Provides Vue 2.7 JSX support (via [dedicated Babel transform](https://github.com/vuejs/jsx-vue2/)).

### [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

- Использует esbuild и Babel, обеспечивая быстрый HMR при небольшом объеме пакета и гибкости, позволяющей использовать конвейер преобразования Babel. Без дополнительных плагинов Babel при сборке используется только esbuild.

### [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)

- Заменяет Babel на SWC во время разработки. Во время сборки SWC+esbuild используется при использовании плагинов, а esbuild — только в противном случае. Для больших проектов, которые не требуют нестандартных расширений React, холодный запуск и горячая замена модулей (HMR) могут быть значительно быстрее.

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- Обеспечивает поддержку устаревших браузеров для производственной сборки.

## Плагины сообщества

Проверьте [awesome-vite](https://github.com/vitejs/awesome-vite#plugins) - вы также можете отправить PR, чтобы перечислить там свои плагины.

## Плагины Rollup

[Плагины Vite](../guide/api-plugin) являются расширением интерфейса плагинов Rollup. Дополнительную информацию смотрите в разделе [Совместимость подключаемых модулей объединения](../guide/api-plugin#rollup-plugin-compatibility).
