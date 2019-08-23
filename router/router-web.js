const Router = require('koa-router');
let route = new Router();
let getDB = require('../tools/baseConnect');
const crypto = require('crypto');
const ObjectID = require('mongodb').ObjectID;


route.prefix('/web');


// 登录
route.post('/login', async(ctx, next) => {
  let createTokenID = (length) => {
    return crypto.randomBytes(length).toString('hex');
  };
  let { username, password } = ctx.request.body;
  if (username == '' && password == '') {
    ctx.body = {
      code: 500,
      text: '用户名和密码不能为空！'
    }
  } else {
    let coll = getDB().collection('user');
    let result = await coll.findOne({ username, password });
    if (result) {
      if (JSON.stringify(ctx.session) === "{}") {
        let saveToken = createTokenID(16);
        ctx.token = saveToken;
        ctx.session.user = {
          '_id': result._id,
          'userName': username,
          'sex': 1
        }

        ctx.body = {
          code: 200,
          token: saveToken
        }
      } else {
        ctx.body = {
          code: 202,
          text: '已经登录'
        }
      }

    } else {
      ctx.body = {
        code: 500,
        text: '登录失败'
      }
    }
  }

});
// 获取用户信息
route.post('/getUser', async(ctx, next) => {
  let coll = getDB().collection('user');
  let uid = ctx.session.user._id;
  let result = await coll.findOne({ _id: uid });
  ctx.body = {
    code: 200,
    information: { name: result.name, headImg: 'https://avatar-static.segmentfault.com/236/913/2369136975-5b620466b27c1_big64' }
  }
});
// 用户登出
route.post('/loginOut', async(ctx, next) => {
  ctx.session = {}
  ctx.body = {
    code: 200,
    text: '成功注销！'
  }
});
// 添加标签
route.post('/tagAdd', async(ctx, next) => {
    let { tagname, tagdesc } = ctx.request.body;
    if (tagname != '' && tagdesc != '') {
      let coll = getDB().collection('tag');
      await coll.insertOne({
        'tagname': tagname,
        'tagdesc': tagdesc
      });
      ctx.body = {
        code: 200,
        tagtext: {
          'tagname': tagname,
          'tagdesc': tagdesc
        }
      }
    } else {
      ctx.body = {
        code: 500,
        text: '数据不能为空！'
      }
    }
  })
  // 查询获取所有标签
route.post('/tagFind', async(ctx, next) => {
  let coll = getDB().collection('tag');
  let tag = await coll.find();
  let findtag = await tag.toArray();
  ctx.body = {
    code: 200,
    taggroup: findtag
  }
})

// 添加文章
route.post('/articleAdd', async(ctx, next) => {
    let { name, desc, content, tagid } = ctx.request.body;
    if (name != '' && desc != '' && content != '' && tagid != '') {
      let coll = getDB().collection('article');
      await coll.insertOne({
        'articlename': name,
        'articledesc': desc,
        'articlecontent': content,
        'tagid': new ObjectID(tagid)
      });
      ctx.body = {
        code: 200,
        msg: '添加文章成功！'
      }
    } else {
      ctx.body = {
        code: 500,
        text: '数据不能为空！'
      }
    }
  })
  // 查询获取文章列表
route.post('/articleList', async(ctx, next) => {
  let coll = getDB().collection('article');
  let arcts = coll.aggregate([{
    $lookup: { // 左连接a
      from: "tag", // 关联到tag表
      localField: 'tagid', // article 表关联的字段  数据类型统一
      foreignField: "_id", // tag 表关联的字段  数据类型统一
      as: "tags"
    }
  }, {
    $unwind: { // 拆分子数组
      path: "$tags"
    }
  },{
    $group: { // 分组查询
      _id: "$_id",
      articlename: { $first: "$articlename" },
      articledesc: { $first: "$articledesc" },
      tagname: { $first: "$tags.tagname" },
      // articlecontent: { $first: "$articlecontent" }
    }
  }]);
  let findtag = await arcts.toArray();
  ctx.body = {
    code: 200,
    taggroup: findtag
  }
})

module.exports = route
