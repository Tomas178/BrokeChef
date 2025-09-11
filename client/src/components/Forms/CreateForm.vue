<script lang="ts" setup>
import { FwbHeading, FwbInput, FwbButton } from 'flowbite-vue';

const inputs = defineModel<string[]>({ required: true });

export type TestId = 'ingredients' | 'kitchen-equipment' | 'steps';

const props = defineProps<{
  heading: 'Ingredients' | 'Kitchen Equipment' | 'Steps';
  testId: TestId;
  placeholder: string;
}>();

defineEmits<{
  submit: [];
}>();

function addInput() {
  inputs.value.push('');
}

function removeInput(index: number) {
  if (inputs.value.length > 1) {
    inputs.value.splice(index, 1);
  } else {
    inputs.value[index] = '';
  }
}
</script>

<template>
  <div :data-testid="testId" class="flex flex-col gap-6 md:flex-1">
    <FwbHeading tag="h2">{{ heading }}</FwbHeading>
    <div class="rounded-4xl bg-white">
      <div class="m-4 flex flex-col gap-4 md:m-16">
        <div
          v-for="(_input, index) in inputs"
          :key="index"
          class="animate-zoomin animate-duration-300 flex items-center gap-2"
        >
          <FwbInput
            :data-testid="`input-${index}`"
            type="text"
            v-model="inputs[index]"
            :placeholder="`${props.placeholder} #${index + 1}`"
            class="bg-white"
            wrapper-class="flex-1"
            :minlength="1"
            :maxlength="props.heading !== 'Steps' ? 100 : undefined"
            :required="true"
          />
          <FwbButton
            data-testid="add-button"
            v-if="inputs.length > 1"
            type="button"
            @click="removeInput(index)"
            color="light"
            class="cursor-pointer"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H5H21"
                stroke="#556987"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6"
                stroke="#556987"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </FwbButton>
        </div>
        <FwbButton
          type="button"
          class="border-primary-green mt-6 cursor-pointer border-2"
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
