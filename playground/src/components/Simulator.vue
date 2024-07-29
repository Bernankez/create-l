<script setup lang="ts">
withDefaults(defineProps<{
  title?: string | number;
  value?: string | number;
  titleClass?: any;
  valueClass?: any;
  window?: boolean;
}>(), {
  window: true,
});

const emit = defineEmits<{
  ref: [el: HTMLDivElement];
}>();
</script>

<template>
  <div v-if="window" class="overflow-hidden rounded-xl">
    <div :class="[titleClass]" class="relative box-border flex select-none items-center bg-#171717 px-5 py-4 text-#ffffffbf font-bold">
      <div class="flex items-center gap-2">
        <div class="h-3 w-3 rounded-full bg-#ed695e"></div>
        <div class="h-3 w-3 rounded-full bg-#f4be4f"></div>
        <div class="h-3 w-3 rounded-full bg-#61c454"></div>
      </div>
      <div class="absolute left-50% -translate-x-50%">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
    </div>
    <div :ref="el => emit('ref', el as HTMLDivElement)" :class="[valueClass]" class="px-4 py-2">
      <slot>{{ value }}</slot>
    </div>
  </div>
  <div v-else :ref="el => emit('ref', el as HTMLDivElement)" :class="[valueClass]" class="px-4 py-2" v-bind="$attrs">
    <slot>{{ value }}</slot>
  </div>
</template>
