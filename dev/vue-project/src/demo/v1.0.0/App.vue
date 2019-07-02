<template>
  <div class="app">
    <h1>App</h1>
    <div id="nav">
      <router-link to="/home">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
    <h1>HELLO</h1>
  </div>
</template>

<style>
 h1{
   color:red;
 }
</style>
