const dataNew = require('./data.json')
const dataOld = require('./olddata.json')

const dataNewArr = []
const dataOldArr = []

for (let province of dataNew) {
  dataNewArr.push(province.code)
  for (let city of province.children) {
    dataNewArr.push(city.code)
    for (let area of city.children) {
      dataNewArr.push(area.code)
    }
  }
}

for (let province of dataOld) {
  dataOldArr.push(province.code)
  for (let city of province.children) {
    dataOldArr.push(city.code)
    for (let area of city.children) {
      dataOldArr.push(area.code)
    }
  }
}

let countAdd = 0
for (let item of dataNewArr) {
  if (!dataOldArr.includes(item)) {
    console.log(item)
    countAdd++
  }
}
console.log('共增加' + countAdd)


let countDel = 0
for (let item of dataOldArr) {
  if (!dataNewArr.includes(item)) {
    console.log(item)
    countDel++
  }
}
console.log('共删除' + countDel)
