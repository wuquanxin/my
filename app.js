const Koa = require('koa')
const app = new Koa()
const koaRouter = require('koa-router')
const koaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser')
const tokenStore = require('./tools/token/koa-token-store');

// 路由中间件
const routerWeb = require('./router/router-web');


app.use(koaStatic(__dirname + '/static'));
app.use(bodyParser());

app.use(tokenStore({
	userName: 'blog_admin',
  passWord: 'blog_admin',
  host: '127.0.0.1',
  port: '27017',
  dbName: 'blog',
  collection: 'session'
}))

app.use(routerWeb.routes());

app.use(async (ctx,next) => {

	next();
})
app.listen(8899,() => {
	console.log("程序启动！");
})