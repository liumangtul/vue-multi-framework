<template>
  <div class="home">
    <Header/>
    <h1>This is an HOME page</h1>
    <img src="../assets/logo.png" alt="">
    <div class="bg-box"></div>
  </div>
</template>

<style lang="scss" scoped>
  .bg-box{
      width:rem(20);
      height:rem(20);
      background: url(../assets/logo.png) repeat;
    }
</style>

<script>
import Header from '../components/Header.vue'

export default {
  components:{
    Header
  }
}
</script>
