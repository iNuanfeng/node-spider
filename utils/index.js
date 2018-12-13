function isPhone(str) {
  if (str.match(/[^0123456789\-]/)) {
    return false;
  }
  return true;
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
    setTimeout(function () {
      resolve();
    }, time)
  });
}

const regular = {
  phoneExp: /[0-9]([0-9]|-){6,}[0-9]/,
  mailExp: /([a-z0-9\-_\.]+@[a-z0-9]+\.[a-z0-9\-_\.]+)+/i
}

function contains(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return true;
    }
  }
  return false;
}

module.exports = {
  isPhone,
  obj2arr,
  sleep,
  regular,
  contains
}