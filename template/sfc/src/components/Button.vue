<template>
  <button class="btn" :class="{ 'btn-outline': variant === 'outline' }">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: "default" | "outline";
}>(), {
  variant: "default",
});
</script>

<style scoped>
.btn {
  --color: hsl(200deg 50% 50%);

  padding: 0.5em 0.75em;
  border: none;
  border-radius: 0.25em;
  color: white;
  font-size: 1rem;
  background: var(--color);
  cursor: pointer;
}

.btn:hover,
.btn:focus {
  background: hsl(200deg 50% 60%);
}

.btn.btn-outline {
  border: 1px solid var(--color);
  color: var(--color);
  background: none;
}

.btn.btn-outline:hover,
.btn.btn-outline:focus {
  background: hsl(200deg 50% 90%);
}

.btn + .btn {
  margin-left: 0.25rem;
}
</style>
