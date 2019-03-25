# koa-range &middot; [![npm](https://img.shields.io/npm/v/@minax/koa-range.svg)](https://www.npmjs.com/package/@minax/koa-range)
range request implementation for koa2

## Quick Overview

```
const Koa = require('koa')
const range = require('@minax/koa-range')

const app = new Koa()

app.use(async (ctx, next) => {
  await range(ctx, '/Users/admin/1.mp4')
})

app.listen(3000)
```
