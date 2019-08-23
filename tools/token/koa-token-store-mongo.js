const { MongoClient } = require('mongodb');
// const { randomBytes } = require('crypto');
const log = console.log;

class MongoStore {
  constructor (opts) {
    this.init(opts)
  }

  async init ({
    userName,
    passWord,
    dbName,
    options = { useNewUrlParser: true },
    host,
    port = 27017,
    collection = 'koa__session',
    maxAge = 86400000
  }) {
    try {
      const connectUrl = `mongodb://${userName}:${passWord}@${host}:${port}/admin`
      const client = await MongoClient.connect(connectUrl, options)
      const db = client.db(dbName);

      console.log('token 数据库连接成功！');

      this.coll = await db.createCollection(collection)
      const isExist = await this.coll.indexExists(['session__idx'])

      if (!isExist) {
        this.coll.createIndex(
          { lastAccess: 1 },
          { name: 'session_idx', expireAfterSeconds: maxAge }
        )
      }
    } catch (e) {
      log(e.message)
    }
  }

  getID(length) {
    return randomBytes(length).toString('hex');
  }

  async get (sid) {
    try {
      let doc = await this.coll.findOne({ sid: sid })
      return doc ? doc.session : undefined
    } catch (e) {
      log(e.message)
    }
  }

  async set (session, { sid }) {    // sid = this.getID(24)
    try {
      await this.coll.updateOne(
        { sid: sid },
        {
          $set: {
            sid: sid,
            session: session,
            lastAccess: new Date()
          }
        },
        { upsert: true }
      )
    } catch (e) {
      log(e.message)
    }
    return sid
  }

  async destroy (sid) {
    try {
      await this.coll.deleteOne({ sid: sid })
    } catch (e) {
      log(e.message)
    }
  }
}

module.exports = MongoStore