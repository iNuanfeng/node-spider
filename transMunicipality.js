/**
 * 转换直辖市成三级联动的数据格式
 */
const fs = require('fs')
const data = require('./data.json')

const municipalityEnum = ['北京市', '天津市', '上海市', '重庆市']

data.forEach(province => {
  if (municipalityEnum.includes(province.name)) {
    province.children = [{
      code: province.code,
      name: province.name,
      children: province.children
    }]
  }
})

// 开始写入文件
console.log('数据生成完成，开始写入文件...')
fs.writeFileSync('dataTreeLevel.json', JSON.stringify(data));

// 文件生成完成
console.log('done!');
