<template>
  <div class="old-document">
    <p>
      Эта документация охватывает Vite 5 <strong>(старая версия)</strong>. Для
      последней версии смотрите
      <a href="https://vitejs.ru" class="new-document-link">https://vitejs.ru</a
      >.
    </p>
  </div>
</template>

<style>
:root {
  --vp-layout-top-height: 96px;

  @media (min-width: 455px) {
    --vp-layout-top-height: 64px;
  }

  @media (min-width: 960px) {
    --vp-layout-top-height: 32px;
  }
}

.old-document {
  position: fixed;
  display: flex;
  height: var(--vp-layout-top-height);
  width: 100%;
  padding: 4px 32px;
  justify-content: center;
  align-items: center;
  color: var(--vp-c-text-1);
  background: var(--vp-c-brand-lightest);
  z-index: var(--vp-z-index-layout-top);

  .new-document-link {
    text-decoration: underline;
    color: var(--vp-c-text-1);

    &:hover {
      color: var(--vp-c-text-2);
    }
  }
}

.dark {
  .old-document {
    background: var(--vp-c-brand-darker);
  }
}
</style>
