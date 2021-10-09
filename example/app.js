/**
 * from https://github.com/koajs/generic-session/blob/master/example/app.js
 */ 

const session = require('koa-generic-session');
const SQLiteStore = require('..');
const Koa = require('koa');

const app = new Koa();
app.keys = ['keys', 'keykeys'];
app.use(session({
  store: new SQLiteStore('sqlite.db')
}));

app.use(async (ctx) => {
  switch (ctx.path) {
  case '/get':
    get(ctx);
    break;
  case '/remove':
    remove(ctx);
    break;
  case '/regenerate':
    await regenerate(ctx);
    break;
  }
});

function get(ctx) {
  const { session } = ctx
  session.count = session.count || 0;
  session.count++;
  ctx.body = session.count;
}

function remove(ctx) {
  ctx.session = null;
  ctx.body = 0;
}

async function regenerate(ctx) {
  get(ctx);
  await ctx.regenerateSession();
  get(ctx);
}

app.listen(8080);