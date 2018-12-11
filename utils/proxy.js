const axios = require('axios');

const getSpiderProxy = async () => {
  let url = 'http://api.ip.data5u.com/dynamic/get.html?order=b323ab32e6ca1be6b803291943d47b62&type&sep=3';

  let res = await axios.get(url);

  return res.data;
}

module.exports = {
  getSpiderProxy
}