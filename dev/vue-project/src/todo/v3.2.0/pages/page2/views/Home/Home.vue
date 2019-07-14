<template>
  <div class="home_page">
    <Header/>
    <h1>This is an HOME page</h1>
    <img src="@/pages/page2/assets/images/logo.png" alt="">
    <div class="bg-box"></div>
    <div class="box home">HOME style test</div>
    <h3>雪碧图-a-b-c-d</h3>
    <ul>
      <li><span class="sprite_page2_home sprite_page2_home-search">111</span></li>
      <li><span class="sprite_page2_home sprite_page2_home-title">2222</span></li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
  @import "@/pages/page2/views/home/home.scss";
</style>

<script>

import Header from '@/pages/page2/components/Header.vue';

export default {
  components:{
    Header
  }
}
</script>
