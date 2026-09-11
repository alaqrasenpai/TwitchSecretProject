<template>
  <div class="w-screen h-screen overflow-hidden bg-transparent select-none obs-canvas-mode font-sans">
    <slot />
  </div>
</template>

<style>
html, body {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  overflow: hidden;
}
</style>
