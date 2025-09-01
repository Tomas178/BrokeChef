<template>
  <picture>
    <source
      srcset="@/assets/background-pictures/salad-bowl-large.webp"
      type="image/webp"
    />
    <source
      srcset="@/assets/background-pictures/salad-bowl-small.webp"
      type="image/webp"
    />
    <source
      srcset="@/assets/background-pictures/salad-bowl-large.png"
      type="image/png"
    />
    <source
      srcset="@/assets/background-pictures/salad-bowl-small.png"
      type="image/png"
    />
    <img
      class="absolute top-36 right-6 left-1/8 -z-1 size-48 h-72 w-72 bg-cover"
      src="@/assets/background-pictures/salad-bowl-large.png"
      alt="Salad bowl"
    />
  </picture>
  <div class="mx-4 mt-7 justify-center text-3xl lg:mt-24 lg:text-5xl">
    <span
      class="font-primary text-welcome-dark leading-10 font-bold lg:font-extrabold"
      >Never Worry About<br /></span
    ><span
      class="font-primary from-primary-green to-tertiary-green bg-gradient-to-b bg-clip-text leading-10 font-bold text-transparent md:font-extrabold"
      >What To Cook <br />Again!</span
    >
  </div>
</template>
