<template>
  <div class="app">
    <h1>App</h1>
    <div id="nav">
      <router-link to="/home">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>


<style lang="scss" scoped>
 @import 'pages/page1/assets/scss/index.scss';
  h1{
   color:red;
 }
</style>

<script>

</script>
