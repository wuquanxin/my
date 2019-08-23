const MongoStore = require('./koa-token-store-mongo');

module.exports = (opts) => {

	let store = new MongoStore(opts);

	return async (ctx, next) => {

		let tokenID = ctx.headers['token'];

		if(!tokenID){
			ctx.session = {}
		}else{
			ctx.session = await store.get(tokenID, ctx);
			if(typeof ctx.session !== "object" || ctx.session === null) {
        ctx.session = {};
      }
		}

		let old = JSON.stringify(ctx.session);

		// 等待
		await next();

		let sess = JSON.stringify(ctx.session);

		// 未登录
		if(old == sess){
			return
		}

		// 状态从已登录 > 注销登录
		if(sess == '{}') {
      ctx.session = null;
    }

    // 注销
    if(tokenID && !ctx.session){
    	console.log(tokenID, ctx.session);
    	await store.destroy(tokenID, ctx);
 			return
    }

    // 更新，设置
    let sid = await store.set(ctx.session, {sid: tokenID || ctx.token});
    ctx.token = sid;

	}

}