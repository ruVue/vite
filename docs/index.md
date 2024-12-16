---
layout: home

title: Vite
titleTemplate: Интерфейсные инструменты нового поколения

hero:
  name: Vite
  text: Интерфейсные инструменты нового поколения
  tagline: Приготовьтесь к среде разработки, которая, наконец, сможет вас догнать.
  image:
    src: /logo-with-shadow.png
    alt: Vite
  actions:
    - theme: brand
      text: Начало работы
      link: /guide/
    - theme: alt
      text: Почему Vite?
      link: /guide/why
    - theme: alt
      text: Посмотреть на GitHub
      link: https://github.com/vitejs/vite
    - theme: brand
      text: ⚡ ViteConf 24!
      link: https://viteconf.org/?utm=vite-homepage

features:
  - icon: 💡
    title: Мгновенный запуск сервера
    details: Подача файлов по запросу через встроенный ESM, не требуется связывание!
  - icon: ⚡️
    title: Молниеносный HMR
    details: Горячая замена модуля (HMR), которая остается быстрой независимо от размера приложения.
  - icon: 🛠️
    title: Богатые возможности
    details: Встроенная поддержка TypeScript, JSX, CSS и других.
  - icon: 📦
    title: Оптимизированная сборка
    details: Предварительно сконфигурированная сборка Rollup с поддержкой многостраничного режима и режима библиотеки.
  - icon: 🔩
    title: Универсальные плагины
    details: Интерфейс плагина Rollup-superset используется совместно разработчиком и билдом.
  - icon: 🔑
    title: Полностью типизированные API
    details: Гибкие программные API с полной типизацией TypeScript.
---

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('uwu') != null) {
    const img = document.querySelector('.VPHero .VPImage.image-src')
    img.src = '/logo-uwu.png'
    img.alt = 'Vite Kawaii Logo by @icarusgkx'
  }
})
</script>
