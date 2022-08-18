---
layout: page
title: Знакомство с командой
description: Разработкой Vite руководит международная команда.
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamPageSection,
  VPTeamMembers
} from 'vitepress/theme'
import { core, emeriti } from './_data/team'
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Знакомство с командой</template>
    <template #lead>
      Разработкой Vite руководит международная команда,
      некоторые из которых выбрали для того, чтобы быть представленными ниже.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="core" />
  <VPTeamPageSection>
    <template #title>Почётная команда</template>
    <template #lead>
      Здесь мы чествуем некоторых уже неактивных членов команды,
      которые внесли ценный в прошлом.
    </template>
    <template #members>
      <VPTeamMembers size="small" :members="emeriti" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
