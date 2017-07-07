/** 配置并链接MongoDB **/
var mongoose = require('mongoose');
var uri = 'mongodb://localhost/cnblogs';

mongoose.connect(uri);

/** 创建Schema、创建Model **/
var UserSchema = new mongoose.Schema({
  name: String,
  age: String,
  fans: Number,
  fork: Number
});

mongoose.model('User', UserSchema);

/** 获取Model，创建User的实例 **/
var User = mongoose.model('User');
