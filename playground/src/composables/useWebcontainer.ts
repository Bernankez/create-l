import type { Awaitable } from "@vueuse/core";
import { WebContainer } from "@webcontainer/api";
import { onScopeDispose, ref, shallowRef } from "vue";

const currentWebContainer = shallowRef<WebContainer>();

export function destroyCurrentWebContainer() {
  currentWebContainer.value?.teardown();
  currentWebContainer.value = undefined;
}

export interface UseWebContainerOptions {
  /** Init immediately, defaults to true */
  immediate?: boolean;
  onBooted?: (webContainer: WebContainer) => Awaitable<void>;
}

export function useWebContainer(options?: UseWebContainerOptions) {
  const status = ref<"uninitialized" | "booted" | "destroyed">("uninitialized");
  const { immediate = true, onBooted } = options || {};

  // WebContainer must be singleton
  const webContainer = shallowRef<WebContainer>();

  async function init() {
    if (webContainer.value) {
      if (!currentWebContainer.value) {
        currentWebContainer.value = webContainer.value;
      }
      return;
    }
    if (currentWebContainer.value) {
      console.error("A WebContainer instance has been booted, new instance cannot be created until the current instance is destroyed");
      return;
    }
    const _webContainer = await WebContainer.boot();
    await onBooted?.(_webContainer);
    webContainer.value = _webContainer;
    status.value = "booted";
    currentWebContainer.value = webContainer.value;
  }

  function destroy() {
    // Only after teardown, a new WebContainer instance can be obtained
    webContainer.value?.teardown();
    webContainer.value = undefined;
    currentWebContainer.value = undefined;
    status.value = "destroyed";
  }

  onScopeDispose(() => {
    destroy();
  });

  if (immediate) {
    init();
  }

  return {
    webContainer,
    status,

    init,
    destroy,
  };
}
