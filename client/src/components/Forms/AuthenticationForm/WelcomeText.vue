<template>
  <picture>
    <source
      srcset="@/assets/background-pictures/salad-bowl-large.webp"
      media="(min-width: 768px)"
    />
    <source
      srcset="@/assets/background-pictures/salad-bowl-small.webp"
      media="(max-width: 767px)"
    />
    <source
      srcset="@/assets/background-pictures/salad-bowl-large.png"
      media="(min-width: 768px)"
    />
    <source
      srcset="@/assets/background-pictures/salad-bowl-small.png"
      media="(max-width: 767px)"
    />

    <img
      class="absolute top-36 left-1/4 -z-1 size-48 bg-cover lg:right-6 lg:left-1/8 lg:h-72 lg:w-72 xl:left-1/12"
      src="@/assets/background-pictures/salad-bowl-small.png"
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
