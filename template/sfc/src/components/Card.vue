<template>
  <div class="card">
    <div class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot name="body"></slot>
    </div>
    <div class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  backgroundColor?: string;
}>(), {
  backgroundColor: "white",
});
</script>

<style scoped>
.card {
  --padding: 1rem;

  border: 1px solid #777;
  border-radius: 0.25rem;
  overflow: hidden;
  background: v-bind(backgroundColor);
}

.card.card-shadow {
  border: none;
  box-shadow: 0 2px 5px 0 rgb(0 0 0 / 20%);
}

.card-header {
  margin-bottom: 0.5rem;
  padding: var(--padding);
  padding-bottom: 0;
  font-size: 1.5rem;
}

.card-header.card-image {
  padding: 0;
  overflow: hidden;
}

.card-header.card-image > img {
  display: block;
  width: 100%;
  max-height: 200px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: center;
  transition: 200ms transform ease-in-out;
}

.card:hover > .card-header.card-image > img {
  transform: scale(1.025);
}

.card-body {
  padding: 0 var(--padding);
  font-size: 0.9rem;
}

.card-footer {
  margin-top: 1rem;
  padding: var(--padding);
  padding-top: 0;
}
</style>
