function isPhone(str) {
  if (str.match(/[^0123456789\-]/)) {
    return false;
  }
  return true;
}

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

// 对象转数组
function obj2arr(obj) {
  let arr = [];
  for (let i in obj) {
    arr.push(obj[i]);
  }
  return arr;
}

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve();
    }, time)
  });
}

const regular = {
  phoneExp: /[0-9]([0-9]|-){6,}[0-9]/,
  mailExp: /([a-z0-9\-_\.]+@[a-z0-9]+\.[a-z0-9\-_\.]+)+/i
}

module.exports = {
  isPhone,
  uniqApp,
  obj2arr,
  sleep,
  regular
}