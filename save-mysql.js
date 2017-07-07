//连接数据库
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: '192.168.10.38',
  user: 'root',
  password: 'mspj',
  database: 'sprider_db'
});

connection.connect();

var usr = { car_brand_id: '1', name: '牛逼' };
connection.query('insert into autohome_car set ?', usr, function(err, result) {
  if (err) throw err;

  console.log('inserted 牛逼');
  console.log(result);
  console.log('\n');
});

//关闭连接
connection.end();
