const fs = require('fs');
const path = require('path');

function writeFile(url, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(url, data, error => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    })
  })
}

function readFile(url) {
  return new Promise((resolve, reject) => {
    fs.readFile(url, 'utf-8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    })
  })
}

function exists(url) {
  return fs.existsSync(url)
}

async function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

async function deleteFile(path) {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach((file) => {
      const curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        deleteFile(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

module.exports = {
  writeFile,
  readFile,
  mkdirsSync,
  deleteFile,
  exists
}
