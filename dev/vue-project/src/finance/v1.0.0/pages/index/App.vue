<template>
  <div class="warp">
    <router-link to="/index">index</router-link>
    <br>
    <router-view></router-view>
  </div>
</template>

<style lang="scss" scoped>
  @import "./assets/scss/app.scss";
</style>
<script>
export default {
  data(){
    return{

    }
  }
}
</script>
