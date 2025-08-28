<script lang="ts" setup>
defineProps<{
  title: 'Ingredients' | 'Tools';
  items: string[];
}>();
</script>

<template>
  <div class="rounded-4xl bg-white/50 p-10">
    <div class="flex flex-col md:gap-6">
      <span class="text-3xl leading-12 font-bold break-words text-gray-500">{{
        title
      }}</span>
      <ul
        class="flex flex-col divide-y lg:list-inside lg:list-disc lg:divide-y-0"
      >
        <li
          v-for="item in items"
          :key="item"
          class="py-2 md:leading-loose lg:py-0"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>
