<script lang="ts" setup>
import { FwbHeading, FwbInput, FwbButton } from 'flowbite-vue';
import { ref } from 'vue';

const props = defineProps<{
  heading: string;
  formLabel: string;
  placeholder: string;
}>();

const inputs = ref<string[]>([]);

function addInput() {
  inputs.value.push('');
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <FwbHeading tag="h2">{{ heading }}</FwbHeading>
    <div class="rounded-4xl bg-white">
      <div class="m-16 flex flex-col gap-4">
        <div v-for="(input, index) in inputs" :key="index">
          <FwbInput
            v-model="inputs[index]"
            :placeholder="`${props.placeholder} #${index + 1}`"
            wrapper-class=" bg-white"
          />
        </div>
        <FwbButton
          class="border-primary-green mt-6 border-2"
          @click="addInput"
          color="light"
        >
          <template #prefix>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19"
                stroke="#556987"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M5 12H19"
                stroke="#556987"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
          Add {{ heading.toLowerCase() }}
        </FwbButton>
      </div>
    </div>
  </div>
</template>
