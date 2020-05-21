
<template>
  <div class="vue-drawing-board">
    <div class="main-container" ref="mainCont">
      <div class="cut-box" v-show="cutBoxShow">
        <div class="op-mask"></div>
        <div class="select-cut-box" :style="{'top': mouseFrom.y + 'px','left': mouseFrom.x + 'px', 'height': (mouseTo.y -mouseFrom.y) + 'px','width': (mouseTo.x -mouseFrom.x) + 'px'}">
          <div 
            v-text="(mouseTo.x -mouseFrom.x) + 'x' + (mouseTo.y -mouseFrom.y) "
            class="text-px">
          </div>
          <div class="cut-tools-box" v-show="cutBoxDone">
            <span @click="downloadCutImgFuc" v-if="false">
              <i class="iconfont icon-save"></i>
            </span>
            <span @click="closeCutBoxFuc">
              <i class="iconfont icon-guanbi1"></i>
            </span>
            |
            <span @click="saveCutImgDataFuc">
              <i class="iconfont icon-duigou"></i>
              完成
            </span>
          </div>
        </div>
      </div>
      <div class="cut-box" v-show="cutResultShow">
        <div class="op-mask-cutResult"></div>
        <div class="r-drawer-box" style="display: block;">
            <div class="img-title">预览</div>
            <div class="img-box">
              <img :src="cutResultImg" alt="">
            </div>
            <div class="bottom-box">
                <button class="btn" @click="closeCutBox">
                  <span>取消</span>
                </button>
                <button class="btn" @click="emitSaveCutImgFuc">
                    <span>确定</span>
                </button>
            </div>
        </div>
      </div>
      <canvas id="canvas" ref="canvas"></canvas>
    </div>
    <div class="tools">
      <div class="container">
        <div
          @click="changeToolNav(idx, toolItem)"
          :title="toolItem.cn"
          :class="[toolActiveIdx ==idx?'toolClass active':'toolClass' ]"
          :key="idx" 
          v-for="(toolItem,idx) in toolsAttr">
          <i :class="'iconfont ' + toolItem.icon"></i>
          <div
            v-show="menuBoxShow && toolItem.name==='Draw'" 
            class="menuBox">
              <i 
                @click.stop="closeMenuBox"
                class="iconfont icon-guanbi">
              </i>
              <p>画笔大小</p>
              <div class="size-box">
                  <span class="dot-box">
                    <span class="circle-dot" :style="{'transform':'scale('+ sizeRangeVal +')'}"></span>
                  </span>
                  <input type="range" v-model="sizeRangeVal" :max="10" :min="1" :step="1" @change="changePencilSize" />
                  <!-- <el-slider 
                    @change="changePencilSize"
                    v-model="sizeRangeVal" 
                    :show-tooltip="false"
                    :max="10" 
                    :min="1">
                  </el-slider> -->
              </div> 
              <p>画笔颜色</p>
              <div class="color-box">
                  <div
                    @click.stop="changePencilColor(colorIdx)"
                    :style="{'background-color':curColorVal}"
                    :key='colorIdx'
                    v-for="(curColorVal, colorIdx) in colorList" 
                    :class="[activeColorIdx==colorIdx?'action':'']"
                    class="color-item">
                  </div>
              </div>
              <p >画笔透明度</p>
              <div class="size-box">
                  <span class="dot-box">
                    <i class="opacity-dot" :style="{'opacity':  (11 - opacityRangeVal) / 10 }"></i>
                  </span>
                  <input type="range" v-model="opacityRangeVal" :max="10" :min="1" :step="1" @change="changePencilOpcity" />
                  <!-- <el-slider 
                    @change="changePencilOpcity"
                    :show-tooltip="false"
                    v-model="opacityRangeVal" 
                    :max="10" 
                    :min="1">
                  </el-slider> -->
              </div>
          </div>
        </div>
        <input type="file" ref="uploadFile" style="display:none" accept="image/gif, image/jpeg" @change="uploadFileFuc">
      </div>
    </div>
    
  </div>
</template>

<script>
import { fabric } from 'fabric'
import toolsPanel from './config/iconList.json'
import { colorRgba } from './util/util.js'
import shapesDraw from './util/shape.js'
// import defaultImgUrl from './assets/img/2.png'
// import defaultImgUrl from './assets/img/1.png'
import defaultImgUrl from './assets/img/sunshine.png'

import {
  iconfontUrl,
  iconfontVersion
} from './config/env';
import {
  loadStyle
} from './util/util'
iconfontVersion.forEach(ele => {
  loadStyle(iconfontUrl.replace('$key', ele));
})

export default {
  name: 'VueDrawingBoard', // vue component name
  data() {
    return {
      toolsAttr:toolsPanel,
      toolActiveIdx: 1,
      sizeRangeVal: 1,
      opacityRangeVal: 1,
      colorList:['#000000', '#FF3333', '#99CC00', '#0066FF', '#FFFF33', '#33CC66'],
      activeColorIdx:0,
      menuBoxShow:false,
      fabricObj:{}, // 整体画布对象
      penAttibutes:{ // 铅笔对象
        width : 2,
        lineCap : "round",
        lineJoin : "round",
        strokeStyle: "#000",
        fillStyle: "#000",
        globalCompositeOperation: "source-over",
        globalAlpha : 1
      },
      testImgUrl:defaultImgUrl,
      isDrawing:false,
      drawingObject:{},
      mouseFrom:{
        x:0,
        y:0
      },
      mouseTo:{
        x:0,
        y:0
      },
      textboxObj:{},
      toolsMap:{
        Image:this.addImgFuc,
        Move:'',
        Draw:this.pencilDrawFuc,
        Line:'',
        Arrow:'',
        Circle:'',
        Rectangular:'',
        Triangle:'',
        Text:'',
        Select:this.cutAction,
        Rubber:'',
        PreStep:this.canvasUndo,
        NextStep:this.canvasRedo,
        Save:this.downLoadImage,
        Delete:this.clearAll
      },
      preStepArray:[], // 保存新增元素 主要是操作撤销和还原使用
      mods:0,
      cutBoxShow:false,
      cutBoxDone:false,
      cutResultShow:false,
      toolHeight:60,
      cutResultImg:'',
    };
  },
  props:{
    imgUrl:{
      type:String
    },
    width:{
      type:Number,
    },
    height:{
      type:Number
    }
  },
  computed: {
    curImgUrl(){
      return this.imgUrl ||  this.testImgUrl
    },
    canvasWidth(){
      return  this.width || window.innerWidth || document.body.clientWidth
    },
    canvasHeight(){
      return (this.height + this.toolHeight) || window.innerHeight || document.body.clientHeight 
    },
    isFreeDrawing(){
      return ['Line', 'Arrow', 'Circle', 'Rectangular', 'Triangle', 'Text'].indexOf(this.toolsAttr[this.toolActiveIdx].name)>-1 && true
    },
    drawInfo(){
      return {
        lineColor:this.penAttibutes.fillStyle,
        lineWidth:this.penAttibutes.width,
        mouseFrom:this.mouseFrom,
        mouseTo:this.mouseTo
      }
    }
  },
  mounted(){
    this.initCanvas();
  },
  destory(){},
  methods: {
    initCanvas(){
      this.fabricObj = new fabric.Canvas('canvas',{
        isDrawingMode:false,
        selectable:true,
        selection:false,
        devicePixelRatio:true,
        // backgroundColor:'#333',
        HOVER_CURSOR:'pointer'
      })
      console.log(this.fabricObj)
      this.fabricObj.preserveObjectStacking = true;
      // 自由绘制
      this.fabricObj.freeDrawingBrush.color = this.penAttibutes.fillStyle
      this.fabricObj.freeDrawingBrush.width = this.penAttibutes.width;
      // 设置画布的长宽
      this.fabricObj.setWidth(this.canvasWidth)
      this.fabricObj.setHeight(this.canvasHeight)

      // 初始加载初始图片 后期换成动态图片
      // this.addImgAction(this.curImgUrl)
      this.addBackgroundAction(this.curImgUrl);

      this.initCanvasEvent()
    },
    drawing(){
      if(this.drawingObject){
        this.fabricObj.remove(this.drawingObject)
      }
      let curType = this.toolsAttr[this.toolActiveIdx].name
      const element = shapesDraw(this.drawInfo, curType);
      if(element){
        this.fabricObj.add(element)
        if(curType=='Text'){
          this.textObject = element;
          this.textObject.enterEditing();
          this.textObject.hiddenTextarea.focus();
        }
        this.drawingObject = element;
        this.fabricObj.setActiveObject(element)
      }
    },
    setMousePosition({ offsetX, offsetY }, type){
      const mouse = type === 'to' ? 'mouseTo' : 'mouseFrom';
      this[mouse]={ x: offsetX, y: offsetY };
    },
    judgeCutBoxShow(){
      return (this.mouseTo.x - this.mouseFrom.x>0) && (this.mouseTo.y - this.mouseFrom.y>0)
    },
    mouseDown({e}){
      console.log(e)
      if(this.menuBoxShow){
        this.closeMenuBox()
      }
      this.setMousePosition(e, 'from');
      this.cutBoxShow = false;
      this.cutBoxDone = false;
      this.isDrawing = true;
    },
    mouseUp({e}){
      this.setMousePosition(e, 'to');
      this.isDrawing = false;
      this.drawingObject = null;
      if(this.toolsAttr[this.toolActiveIdx].name=='Select'){
        this.cutBoxDone = true; 
      }
      this.preStepArray.push(JSON.stringify(this.fabricObj));
    },
    mouseMove({e}){
      if(!this.isDrawing) return;
      this.setMousePosition(e, 'to')
      this.isFreeDrawing && this.drawing();
       if(this.toolsAttr[this.toolActiveIdx].name=='Select'){
        this.cutBoxShow = this.judgeCutBoxShow(); 
      }
    },
    initCanvasEvent(){
      this.fabricObj.on({
        'mouse:down': this.mouseDown,
        'mouse:up': this.mouseUp,
        'mouse:move': this.mouseMove,
        'object:added': this.objectAdded,
        'object:rotating': this.objectRotating,
        'object:scaling': this.objectScaling,
        'object:moving': this.objectMoving,
        'object:modified': this.objectModified,
        'selection:created': this.selectionCreated
      })
    },
    addImgFuc(){
      // this.$refs.uploadFile.click();
      // 防止冒泡问题解决方案
      const clickEvent = document.createEvent('MouseEvents');
      clickEvent.initEvent('click', false, false);
      this.$refs.uploadFile.dispatchEvent(clickEvent)
    },
    pencilDrawFuc(){
      this.fabricObj.isDrawingMode = true;
      this.menuBoxShow = true;
    },
    navInit(){
      this.menuBoxShow = false;
      this.cutBoxShow = false;
      this.cutBoxDone = false
      this.resetCanvas()
    },
    cutAction(){
      this.fabricObj.isDrawingMode = false;
      this.fabricObj.skipTargetFind = true; // 画板元素不能被选
    },
    changeToolNav(idx, toolItem){
      this.navInit()
      this.toolActiveIdx = idx;
      const handler = this.toolsMap[toolItem.name]
      handler && handler();
    },
    changePencilColor(idx){
      this.activeColorIdx = idx;
      this.penAttibutes.fillStyle = colorRgba(this.colorList[idx])
      console.log(this.penAttibutes.fillStyle)
      this.fabricObj.freeDrawingBrush.color = this.penAttibutes.fillStyle
    },
    closeMenuBox(){
      this.menuBoxShow = false;
    },
    changePencilOpcity(){
      this.penAttibutes.fillStyle = colorRgba(this.colorList[this.activeColorIdx], ( (11-this.opacityRangeVal) / 10))
      this.fabricObj.freeDrawingBrush.color = this.penAttibutes.fillStyle
    },
    changePencilSize(){
      this.penAttibutes.width = this.sizeRangeVal;
      this.fabricObj.freeDrawingBrush.width = this.penAttibutes.width
    },
    hanlderScaleVal(curImgObj){
      let result = 0.5;
      if(this.fabricObj){
        let baseVal = Math.min(this.fabricObj.height, this.fabricObj.width);
        let curVal = Math.max(curImgObj.width, curImgObj.height) 
        result = (baseVal/curVal) > 1 ? (baseVal/curVal) : (baseVal/ (curVal * 5 ));
      }
      return result
    },
    addImgAction(data){
      const imgObj = new Image();
      imgObj.src = data;
      imgObj.onload = ()=>{
        let curScaleVal = this.hanlderScaleVal(imgObj) 
        const image = new fabric.Image(imgObj,{
          scaleX:this.fabricObj.width/imgObj.width,
          scaleY:this.fabricObj.height/imgObj.height
        });
        this.fabricObj.centerObject(image);
        this.fabricObj.add(image);
        // this.fabricObj.setActiveObject(image);
        this.fabricObj.renderAll();
      }
    },
    addBackgroundAction(data){
      fabric.Image.fromURL(data, (img)=>{
        this.fabricObj.setBackgroundImage(img, this.fabricObj.renderAll.bind(this.fabricObj), {
          scaleX:this.fabricObj.width / img.width,
          scaleY:this.fabricObj.height / img.height
        })
      })
      // fabric.Image.fromURL(
      //   e.target.src,
      //   img => {
      //     img.set({
      //       scaleX: card.width / img.width,
      //       scaleY: card.height / img.height
      //     });
      //     card.setBackgroundImage(img, card.renderAll.bind(card));
      //     card.requestRenderAll();
      //     this.saveState();
      //   },
      //   { crossOrigin: "anonymous" }
      // );
    },
    uploadFileFuc(e){
      console.log(e);
      // 设置图片
      let type = '';

      const reader = new FileReader();
      reader.onload = (event)=>{
        const data = event.target.result;
        (type=='background' ? this.addBackgroundAction : this.addImgAction)(data);
      }
      reader.readAsDataURL(e.target.files[0]);
    },
    objectRotating(){
      this.isDrawing = false;
    },
    objectScaling(){
      this.isDrawing = false;
    },
    objectMoving(o){
      this.isDrawing = false;
    },
    objectAdded(){
      // this.preStepArray.push(JSON.stringify(this.fabricObj));
    },
    objectModified(){
      this.preStepArray.push(JSON.stringify(this.fabricObj));
    },
    selectionCreated(o){
      let curType = this.toolsAttr[this.toolActiveIdx].name
      if (curType !== 'Rubber') return;
      if (o.target._objects) { // 框选
        o.target._objects.forEach(item => {
          this.fabricObj.remove(item);
        })
      } else {
        this.fabricObj.remove(o.target); // 单选
      }
      this.fabricObj.discardActiveObject(); // 取消当前选中
    },
    updateModifications(savehistory){
      if(savehistory==true) {
        this.preStepArray.push(JSON.stringify(this.fabricObj))
      }
    },
    resetCanvas() {
      // this.fabricObj.skipTargetFind = true; // 画板元素不能被选中
      this.fabricObj.isDrawingMode = false;
      this.fabricObj.selectable = true;
      this.fabricObj.selection = false; // 画板显示选中
      // 退出编辑模式
      if (this.textObject) {
        this.textObject.exitEditing();
        this.textObject = null;
      }
    },
    canvasUndo(){
      // 撤销操作 -- 上一步
      let state = this.preStepArray
      if(this.mods < state.length) {
        this.fabricObj.clear().renderAll();
        this.fabricObj.loadFromJSON(state[state.length - 1 - this.mods - 1]);
        this.fabricObj.renderAll();
        this.mods += 1;
      }
    },
    canvasRedo(){
      // 重做 -- 下一步
      let state = this.preStepArray
      if (this.mods > 0) {
        this.fabricObj.clear().renderAll();
        this.fabricObj.loadFromJSON(state[state.length - 1 - this.mods + 1]);
        this.fabricObj.renderAll();
        this.mods -= 1;
      }
    },
    clearAll(){
      this.fabricObj.remove(this.fabricObj.getActiveObject());
      // this.fabricObj.clear()
    },
    closeCutBoxFuc(){
      this.cutBoxShow = false;
      this.cutBoxDone = false;
    },
    downLoadImage(){
      let base64URl = this.fabricObj.toDataURL({
        formart: 'png',
        multiplier: 1
      })
      let saveImg =  document.createElement('a');
      document.body.appendChild(saveImg);
      saveImg.href = base64URl
      saveImg.download = 'vue-drawing-board' + new Date().getTime();
      saveImg.target = '_blank'
      saveImg.click()
    },
    downloadCutImgFuc(){
      this.getCurCutImg()
      if(this.cutResultImg){
        let saveImg =  document.createElement('a');
        document.body.appendChild(saveImg);
        saveImg.href = this.cutResultImg
        saveImg.download = 'vue-drawing-board' + new Date().getTime();
        saveImg.target = '_blank'
        saveImg.click()
      }
    },
    saveCutImgDataFuc(){
      this.getCurCutImg()
      this.cutBoxShow = false;
      this.cutResultShow =  true;
    },
    getCurCutImg(){
      let base64URl = this.fabricObj.toDataURL({
        formart: 'png',
        multiplier: 1
      })
      let canvasCutSava = document.createElement('canvas')
      // let canvasCutSava = document.getElementById('test')
      let curCtx = canvasCutSava.getContext('2d')
      canvasCutSava.width = this.canvasWidth
      canvasCutSava.height = this.canvasHeight
      let imgObj = new Image();
      imgObj.src = base64URl
      imgObj.onload = ()=>{
        curCtx.drawImage(imgObj,0,0)
        curCtx.save();
        let curImageData = curCtx.getImageData(this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x -this.mouseFrom.x, this.mouseTo.y -this.mouseFrom.y)
        canvasCutSava.width = this.mouseTo.x -this.mouseFrom.x
        canvasCutSava.height = this.mouseTo.y -this.mouseFrom.y
        curCtx.putImageData(curImageData,0,0)
        let cutImgResult = canvasCutSava.toDataURL('image/png')
        // console.log(cutImgResult)
        this.cutResultImg = cutImgResult
        return cutImgResult
      }
    },
    getCurCutImgSecond(){
      let ctx = this.fabricObj.getContext('2d');
      console.log(this.mouseTo.x -this.mouseFrom.x)
      console.log(this.mouseTo.y -this.mouseFrom.y)
      let curImgData = ctx.getImageData(this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x -this.mouseFrom.x, this.mouseTo.y -this.mouseFrom.y)
      console.log(curImgData)
      let canvasCutSava = document.createElement('canvas')
      canvasCutSava.width = this.mouseTo.x -this.mouseFrom.x
      canvasCutSava.height = this.mouseTo.y -this.mouseFrom.y
      let cutSaveCtx= canvasCutSava.getContext('2d')
      cutSaveCtx.putImageData(curImgData, 0, 0);
      let cutSaveDataBase64 = canvasCutSava.toDataURL('image/png')
      let saveImg =  document.createElement('a');
      document.body.appendChild(saveImg);
      saveImg.href = cutSaveDataBase64
      saveImg.download = 'vue-drawing-board' + new Date().getTime();
      saveImg.target = '_blank'
      saveImg.click()
      // ctx.putImageData(curImgData, 0,0)
      // let imgEl = new Image()
      // let imgUrl = this.fabricObj.toDataURL()
      // imgEl.src = imgUrl
    },
    closeCutBox(){
      this.cutBoxShow=false
      this.cutBoxDone=false
      this.cutResultShow=false
    },
    emitSaveCutImgFuc(){
      this.closeCutBox()
      this.$emit('save', this.cutResultImg);
    },
  },
};
</script>



<style scoped lang="scss">
  .vue-drawing-board {
    text-align: center;
    position: relative;
    .main-container{
      margin: 0 auto;
      display: inline-block;
      border: 1px dotted darkorange;
      position: relative;
    }
    .tools {
      position: absolute;
      left: 0;
      bottom: -60px;
      width: 100%;
      height: 50px;
      display: flex;
      justify-content: center;
      @media screen and ( max-width:  768px ) {
        left: 12px;
        display: flex;
        justify-content: flex-start;
        top: 0;
        height: auto;
        width: 16px;
      }
      .container{
        padding: 8px 20px;
        border-radius: 40px;
        box-shadow: 0 1px 2px 0 rgba(32,33,36,0.28);
        background: #fff;
        display: flex;
        align-items: center;
        cursor: pointer;
        @media screen and ( max-width:  768px ) {
          flex-direction: column;
          width: 3px;
          margin: auto 0;
        }
        .toolClass{
          padding: 2px 4px;
          font-size: 20px;
          margin: 6px;
          transition: 0.4s;
          border: 2px solid transparent;
          position: relative;
          @media screen and ( max-width:  768px ) {
            padding: 2px 4px;
            font-size: 16px;
            margin: 4px;
            transition: 0.4s;
            border: 2px solid transparent;
          }
          .menuBox{
              position: absolute;
              bottom: 50px;
              left: -50px;
              width: 250px;
              border: 1px solid rgb(100, 100, 100);
              background-color: #fff;
              border-radius: 8px;
              cursor: default;
              padding: 18px;
              @media screen and ( max-width:  768px ) {
                position: absolute;
                top: 0px;
                left: 45px;
                width: 250px;
                border: 1px solid rgb(100, 100, 100);
                background-color: #fff;
                border-radius: 8px;
                cursor: default;
                padding: 18px;
                height: fit-content;
              }
              p {
                padding: 7px 0px;
                font-size: 14px;
                font-weight: 550;
                color: rgb(100, 100, 100);
                margin: 0;
              }
              .size-box{
                display: flex;
                height: 24px;
                align-items: center;
                justify-content: space-between;
                .dot-box{
                  width: 40px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  .circle-dot{
                    display: inline-block;
                    background: #000;
                    border-radius: 50%;
                    width: 2px;
                    height: 2px;
                  }
                  .opacity-dot{
                    display: inline-block;
                    background: #000;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    opacity: 1;
                  }
                }
                .el-slider{
                  width: calc( 100% - 60px );
                }
              }
              
              .icon-guanbi{
                position: absolute;
                right: 0;
                top: 0;
                font-size: 28px;
                cursor: pointer;
                color: rgb(100, 100, 100);
                margin: 6px;
              } 
              .color-box{
                display: flex;
                justify-content: space-around;
                align-items: center;
                .color-item{
                  width: 30px;
                  height: 30px;
                  border-radius: 50%;
                  position: relative;
                  cursor: pointer;
                }
              }
              .action::before{
                content: "";
                position: absolute;
                width: 16px;
                height: 16px;
                top: 4px;
                left: 4px;
                border-radius: 50%;
                border: 3px solid #fff;
              }
          }
        }
        .active{
          border-radius: 4px;
          border: 2px solid rgb(43, 106, 240);
        }
      }
    }
    .cut-box{
      .op-mask{
        position: fixed;
        width: 100vw;
        height: 100vh;
        z-index: 20;
      }
      .select-cut-box{
        position: absolute;
        border: 1px dashed #999999;
        cursor: move;
        z-index: 21;
        box-shadow: 0 0 0 9999px rgba(0, 0,0,0.5);
        .text-px{
          position: absolute;
          top: -30px;
          left: 0;
          height: 30px;
          text-align: left;
          padding: 0 8px;
          line-height: 30px;
          letter-spacing: 1px;
          color: #ffffff;
          background-color: rgba(39,39,39,0.7);
        }
        .cut-tools-box{
          position: absolute;
          bottom: -34px;
          right: 0px;
          height: 30px;
          width: 150px;
          background-color: rgb(221, 221, 221);
          display: flex;
          align-items: center;
          justify-content: space-around;
          color: #666;
          border-radius: 2px;
          span{
              padding: 2px 4px;
              margin: 0px 4px;
              border-radius: 4px;
              cursor: pointer;
              border: 1px solid transparent;
              transition: .5s;
          }
        }
      }
      .op-mask-cutResult{
        position: absolute;
        width: 100%;
        height: 100%;
        background-color:rgba(0, 0,0,0.5);
        z-index: 7;
      }
      .r-drawer-box {
        position: absolute;
        height: 300px;
        width: 300px;
        background-color: #fff;
        top: 50%;
        left: 50%;
        margin-top: -150px;
        margin-left: -150px;
        display: none;
        border-radius: 8px;
        z-index: 10;
        .img-title{
          padding-top: 10px;
        }
        .img-box {
          height: 25vh;
          text-align: center;
          margin: 10px;
          img {
              height: 22vh;
              border: 1px dashed #888;
              border-radius: 6px;
          }
        }
        .bottom-box {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 5vh;
          display: flex;
          align-items: center;
          justify-content: center;
          .btn {
              outline: none;
              border: 1px solid #999;
              background-color: #fff;
              padding: 4px 10px;
              display: flex;
              justify-content: space-around;
              align-items: baseline;
              border-radius: 8px;
              color: #333;
              margin: 0px 4px;
              cursor: pointer;
              width: 77px;
          }
        }
      }
    }
  }
</style>
