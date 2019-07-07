<template>
  <div class="app">
    <h1>App</h1>
    <div id="nav">
      <router-link to="/home">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
    <div>
      <h2>sprites</h2>
      <ul>
        <li><span class="icon icon-a"></span></li>
        <li><span class="icon icon-b"></span></li>
        <li><span class="icon icon-c"></span></li>
        <li><span class="icon icon-d"></span></li>
      </ul>
    </div>
    <h1>HELLO</h1>
  </div>
</template>


<style lang="scss" scoped>
 @import './assets/scss/index.scss';
  h1{
   color:red;
 }
</style>

<script>

</script>
