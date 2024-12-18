<script setup lang="ts">
import CommunityCard, { Testimonial } from './CommunityCard.vue'
import placeholderAvatar from '/images/community/placeholder.jpg'

const testimonials: Testimonial[] = [
  {
    name: 'Ryan Carniato',
    handle: '@RyanCarniato',
    avatar:
      'https://pbs.twimg.com/profile_images/1810837163447308292/8Piov0f6_400x400.jpg',
    comment: [
      `Мне нравится то, что позволяет Vite. Мы обнаружили, что при создании SolidStart это не столько метафреймворк, сколько система симбиотических плагинов Vite. Хотя они и созданы с учетом SolidJS, они должны масштабироваться от нашего простейшего шаблона до самоуверенного стартера. Мы создаем экосистему на Vite.`,
    ],
  },
  {
    name: 'Rich Harris',
    handle: '@Rich_Harris',
    avatar:
      'https://pbs.twimg.com/profile_images/557940120184041473/bFyXy8Pu_400x400.jpeg',
    comment: [
      `Vite — это, по сути, объединенные нации JavaScript на данный момент. Я буду там как представитель Sveltelandia`,
    ],
  },
  {
    name: 'David East',
    handle: '@_davideast',
    avatar:
      'https://pbs.twimg.com/profile_images/1691627325794725888/voQFcYjY_400x400.jpg',
    comment: [
      'Каждый раз, когда я использую Vite, я испытываю настоящее чувство чистой и безудержной радости.',
    ],
  },
  {
    name: 'Mark Dalgleish',
    handle: '@markdalgleish',
    avatar:
      'https://pbs.twimg.com/profile_images/754886061872979968/BzaOWhs1_400x400.jpg',
    comment: [
      `Это также отличная платформа для создания фреймворка, поскольку она предоставляет подключаемую среду разработки.`,
      `Сообщество тоже потрясающее.`,
    ],
  },
  {
    name: 'Jason Miller',
    handle: '@_developit',
    avatar:
      'https://pbs.twimg.com/profile_images/1374778373239681025/Sc9ehtAr_400x400.jpg',
    comment: [
      `Каждый раз, когда я подозреваю, что достиг предела возможностей Vite, я оказываюсь неправ.`,
    ],
  },
  {
    name: 'David Cramer',
    handle: '@zeeg',
    avatar:
      'https://pbs.twimg.com/profile_images/1706891973553168384/zdAPOznc_400x400.jpg',
    comment: ['Vite изменил правила игры в отрасли.'],
  },
  {
    name: 'Dion Almaer',
    handle: '@dalmaer',
    avatar:
      'https://pbs.twimg.com/profile_images/3380865881/f73b3687ff39b795db05fcaf35972270_400x400.jpeg',
    comment: [
      'Я так рад видеть, как столько замечательных фреймворков объединяются на базе vite. Так много людей получат пользу. ❤️ команде vite.',
    ],
  },
  {
    name: 'Christoph Nakazawa',
    handle: '@cpojer',
    avatar:
      'https://pbs.twimg.com/profile_images/1854151427595407360/4GyUCgEH_400x400.jpg',
    comment: ['Vite собирается съесть мир (JavaScript).'],
  },
  {
    name: 'Nikolaj',
    handle: '@lopugit',
    avatar: 'https://avatars.githubusercontent.com/u/13629190?v=4',
    comment: [
      'Ух ты, ух ты, ух ты, ух ты, ух ты, ух ты, Vite это... Vite это.... Ух ты 🤤🤯🙏',
    ],
  },
]
</script>

<template>
  <section class="community-section">
    <h2>Любимец сообщества</h2>
    <h3>
      Не верьте нам на слово — послушайте, что говорят члены сообщества Vite.
    </h3>
    <div class="community-grid-container">
      <div class="community-grid">
        <CommunityCard
          :testimonial="testimonial"
          v-for="testimonial in testimonials"
          :key="testimonial.name"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.community-section {
  margin-top: 140px;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }

  h2 {
    background: linear-gradient(0deg, #fff 0%, rgba(255, 255, 255, 0.76) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 auto 10px;
    text-align: center;
  }

  h3 {
    width: 455px;
    max-width: 100%;
    margin: 0 auto;
    text-align: center;
  }

  .community-grid-container {
    position: relative;
  }

  .community-grid {
    column-count: 2;
    column-gap: 25px;
    width: calc(100% - 50px);
    margin: 40px auto 0;

    @media (min-width: 1150px) {
      column-count: 3;
      width: 1100px;
    }
  }
}
</style>
