

export const toString = Object.prototype.toString;
export const nativeIsArray = Array.isArray;

export const assert = (condition, msg) => {
  if (!condition)
    throw new Error(`assert failed, ${msg}`);
}

export const isString = target => typeof target === 'string';

export const isObject = obj => obj && typeof obj === 'object';

export const isArray = nativeIsArray || ((obj) => toString.call(obj) === '[object Array]');

export const isEmpty = obj => [Array, Object].includes((obj || {}).constructor) && !Object.keys(obj).length;

export const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(_ => {
      fn.apply(this, arguments);
    }, delay);
  }
};


// loading iconfont远程资源
export const loadStyle = url => {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    const head = document.getElementsByTagName('head')[0];
    head.appendChild(link);
}

// 十六进颜色转RGBA

export const colorRgba = (sHex, alpha = 1) => {
  // 十六进制颜色值的正则表达式
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  /* 16进制颜色转为RGB格式 */
  let sColor = sHex.toLowerCase()
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      var sColorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
      }
      sColor = sColorNew
    }
    //  处理六位的颜色值
    var sColorChange = []
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
    }
    // return sColorChange.join(',')
    // 或
    return 'rgba(' + sColorChange.join(',') + ',' + alpha + ')'
  } else {
    return sColor
  }
}

//SVG Path Arrow 转换

export const exchangeArrowSVGPath = (fromX, fromY, toX, toY, theta, headlen)=>{
  theta = typeof theta != "undefined" ? theta : 30;
  headlen = typeof theta != "undefined" ? headlen : 10;
  // 计算各角度和对应的P2,P3坐标
  let angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
    angle1 = (angle + theta) * Math.PI / 180,
    angle2 = (angle - theta) * Math.PI / 180,
    topX = headlen * Math.cos(angle1),
    topY = headlen * Math.sin(angle1),
    botX = headlen * Math.cos(angle2),
    botY = headlen * Math.sin(angle2);
  let arrowX = fromX - topX,
    arrowY = fromY - topY;
  let path = " M " + fromX + " " + fromY;
  path += " L " + toX + " " + toY;
  arrowX = toX + topX;
  arrowY = toY + topY;
  path += " M " + arrowX + " " + arrowY;
  path += " L " + toX + " " + toY;
  arrowX = toX + botX;
  arrowY = toY + botY;
  path += " L " + arrowX + " " + arrowY;
  return path;
}