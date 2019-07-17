<template>
    <div>
        <h1>index</h1>
    </div>
</template>

<style lang="scss" scoped>

</style>

<script>
    /* eslint-disable */
    import api from 'pages/index/api/api'
    export default {
        data(){
            return{

            }
        },
        mounted(){
            let params = {
                    city:'bj',
                    page:'2',
                    pagesize:'20',
                    top_ids:'6557037079153655172|6556835030168289136|6557053901416480190',
                    boxrow:'6'
            };

            api.fetchPost('/api/first/feednews',params)
                .then(data => {
                    console.log('success',data);
                })
                .catch(err => {
                    console.log('error',err);
                });
        }
    }
</script>