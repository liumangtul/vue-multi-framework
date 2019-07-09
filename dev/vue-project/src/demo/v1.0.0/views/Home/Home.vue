<template>
  <div class="home_page">
    <Header/>
    <h1>This is an HOME page</h1>
    <img src="@/assets/images/logo.png" alt="">
    <div class="bg-box"></div>
    <div class="box home">HOME style test</div>
    <h3>雪碧图-a-b-c-d</h3>
    <ul>
      <li><span class="sprite_home sprite_home-search"></span></li>
      <li><span class="sprite_home sprite_home-title"></span></li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
  @import "@/views/home/home.scss";
</style>

<script>

import Header from '@/components/Header.vue';

export default {
  components:{
    Header
  }
}
</script>
