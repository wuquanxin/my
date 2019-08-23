const mongodb = require('mongodb'),
MongoClient = mongodb.MongoClient;
let DB = null;

let connectUrl = "mongodb://blog_admin:blog_admin@127.0.0.1:27017/"

let client = MongoClient.connect(connectUrl, { useNewUrlParser: true });

client.then((db) => {

	DB = db.db('blog');
	console.log('数据库连接成功！');

}).catch((err) => {

	console.log('数据库连接失败！');

})

module.exports = () => {
	return DB
}