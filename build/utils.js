// 数组去重
function uniqApp(array) {
  let temp = []; //一个新的临时数组
  for (let i = 0; i < array.length; i++) {
    let flag = true;
    for (let j = 0; j < temp.length; j++) {
      if (array[i].appName === temp[j].appName) {
        flag = false;
        break;
      }
    }
    if (flag) {
      temp.push(array[i]);
    }
  }
  return temp;
}

// 数组覆盖
function coverApp(origin, source) {
  for (let i = 0; i < source.length; i++) {
    let flag = true;
    for (let j = 0; j < origin.length; j++) {
      if (source[i].appName === origin[j].appName) {
        origin[j] = Object.assign({}, origin[j], source[i]);
        flag = false;
      }
    }
    if (flag) {
      origin.push(source[i]);
    }
  }
  return origin;
}

module.exports = {
  uniqApp,
  coverApp
}