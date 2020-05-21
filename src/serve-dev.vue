<script>
import Vue from 'vue';
import VueDrawingBoard from '@/vue-drawing-board.vue';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    VueDrawingBoard
  },
  data () {
    return {
      imgUrl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3173584241,3533290860&fm=26&gp=0.jpg',
      imgArray:[
        'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3173584241,3533290860&fm=26&gp=0.jpg',
        'https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1587717963&di=660ccffde8d7c5bd819b006d20a48055&src=http://e.hiphotos.baidu.com/zhidao/pic/item/d62a6059252dd42a1c362a29033b5bb5c9eab870.jpg'
      ]
    }
  },
  methods:{
    cusSaveFuc(base64Img){
      console.log(base64Img)
    },
    changeImgUrl(){
      this.imgUrl = this.imgArray[1]
    }
  }
});
</script>

<template>
  <div id="app">
    <button @click="changeImgUrl">更改</button>
    <div class="test">
      <vue-drawing-board :img-url="imgUrl" :width="420" :height="400" @save="cusSaveFuc"/>
    </div>
  </div>
</template>
<style lang="scss" scoped>
body{
  padding: 0;
  margin: 0;
  #app{
      min-height: 500px;
      width: 100%;
      margin: 20px;
      .test{
        padding: 50px;
      }
  }
}
</style>
