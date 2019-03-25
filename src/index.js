const fs = require('fs')
const path = require('path')

const MIME = {
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4'
}

function getMimeName (filePath) {
  const ext = path.extname(filePath)
  var result = MIME[ext.toLowerCase()]

  if (!result) {
    result = 'application/octet-stream'
  }

  return result
}

function readRangeHeader (range, totalLength) {
  if (!range) {
    return null
  }

  const array = range.split(/bytes=([0-9]*)-([0-9]*)/)
  const start = parseInt(array[1])
  const end = parseInt(array[2])
  const result = {
    start: isNaN(start) ? 0 : start,
    end: isNaN(end) ? (totalLength - 1) : end
  }

  if (!isNaN(start) && isNaN(end)) {
    result.start = start
    result.end = totalLength - 1
  }

  if (isNaN(start) && !isNaN(end)) {
    result.start = totalLength - end
    result.end = totalLength - 1
  }

  return result
}

module.exports = async (ctx, filePath) => {
  if (!fs.existsSync(filePath)) {
    ctx.status = 404
    ctx.body = '404 NOT FOUND'
    return
  }

  const stat = fs.statSync(filePath)
  const rangeRequest = readRangeHeader(ctx.header['range'], stat.size)

  if (rangeRequest === null) {
    ctx.status = 200
    ctx.set({
      'Content-Type': getMimeName(filePath),
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes'
    })
    let stream = fs.createReadStream(filePath, { autoClose: true })
    ctx.body = stream
  } else {
    const { start, end } = rangeRequest
    if (start >= stat.size || end >= stat.size) {
      ctx.status = 416
      ctx.set({
        'Content-Range': 'bytes */' + stat.size
      })
    } else {
      ctx.status = 206
      ctx.set({
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Content-Length': start === end ? 0 : (end - start + 1),
        'Content-Type': getMimeName(filePath),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache'
      })
      let stream = fs.createReadStream(filePath, { start, end, autoClose: true })
      ctx.body = stream
    }
  }
}
