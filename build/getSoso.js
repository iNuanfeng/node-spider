const {
  readFile,
  writeFile
} = require('../utils/fs');
const path = require('path');
const { uniqApp } = require('../utils');

let categoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 27];
// let categoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let data = [];

const getSoso = async () => {
  for (let i = 0; i < categoryIds.length; i++) {
    let fileDatas = await readFile(path.join(__dirname, `../data/sosoData_${categoryIds[i]}.json`));
    fileDatas = JSON.parse(fileDatas);
    let dataArr = fileDatas[`category_${categoryIds[i]}`].data;

    dataArr.forEach(item => {
      data.push(item);
    });

  }

  data = uniqApp(data);
  
  return data
}

module.exports = getSoso