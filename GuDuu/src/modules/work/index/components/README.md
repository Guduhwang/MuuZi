# `components/` [Directory](https://nuxt.com/docs/getting-started/views#components)

Most components are reusable pieces of the user interface, like buttons and menus. In Nuxt, you can create these components in the `components/` directory, and they will be automatically available across your application without having to explicitly import them.

_app.vue_

```html
<template>
  <div>
    <h1>Welcome to the homepage</h1>
    <AppAlert> This is an auto-imported component. </AppAlert>
  </div>
</template>
```

_components/AppAlert.vue_

```html
<template>
  <span>
    <slot />
  </span>
</template>
```
