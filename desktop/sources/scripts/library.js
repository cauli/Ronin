function Library (ronin) {
  this.import = async (path, shape) => { // Imports a graphic file with format.
    const img = new Image()
    img.src = path
    return ronin.surface.draw(img, shape)
  }

  this.export = (path, format = 'image/png', quality = 1.0) => { // Exports a graphic file with format.
    if (!path) { console.warn('Missing export path'); return path }
    const dataUrl = ronin.surface.el.toDataURL(path.indexOf('.jpg') > -1 ? 'image/jpeg' : path.indexOf('.png') > -1 ? 'image/png' : format, quality)
    const data = dataUrl.replace(/^data:image\/png;base64,/, '').replace(/^data:image\/jpeg;base64,/, '')
    fs.writeFileSync(path, data, 'base64')
    return path
  }

  this.open = async (path, ratio = 1) => { // Imports a graphic file and resizes the frame.
    return ronin.surface.open(path, ratio)
  }

  // Transforms

  this.move = (x, y) => {
    ronin.surface.context.translate(x, y)
  }

  this.rotate = (angle) => {
    ronin.surface.context.rotate(angle)
  }

  this.scale = (x, y) => {
    ronin.surface.context.scale(x, y === undefined ? x : y)
  }

  this.transform = (a, b, c, d, e, f) => {
    // a:hscale b:hskew c:vskew d:vscale e:hmove f:vmove
    ronin.surface.context.transform(a, b, c, d, e, f)
  }

  this.setTransform = (a, b, c, d, e, f) => {
    ronin.surface.context.setTransform(a, b, c, d, e, f)
  }

  this.resetTransform = () => {
    ronin.surface.context.resetTransform()
  }

  this.pushTransform = () => {
    ronin.surface.context.save()
  }

  this.popTransform = () => {
    ronin.surface.context.restore()
  }

  // Shapes

  this.pos = (x = 0, y = 0) => { // Returns a position shape.
    return { x, y }
  }

  this.size = (w, h) => { // Returns a size shape.
    return { w, h }
  }

  this.rect = (x, y, w, h) => { // Returns a rect shape.
    return { x, y, w, h }
  }

  this.circle = (cx, cy, r) => { // Returns a circle shape.
    return { cx, cy, r }
  }

  this.line = (ax, ay, bx, by) => { // Returns a line shape.
    return { a: this.pos(ax, ay), b: this.pos(bx, by) }
  }

  this.text = (x, y, p, t, a = 'left', f = 'Arial') => { // Returns a text shape.
    return { x, y, p, t, a, f }
  }

  this.svg = (x, y, d) => { // Returns a svg shape.
    return { x, y, d }
  }

  this.color = (r, g, b, a = 1) => { // Returns a color object.
    const hex = '#' + ('0' + parseInt(r, 10).toString(16)).slice(-2) + ('0' + parseInt(g, 10).toString(16)).slice(-2) + ('0' + parseInt(b, 10).toString(16)).slice(-2)
    return { r, g, b, a, hex, toString: () => { return hex }, 0: r, 1: g, 2: b, 3: a }
  }

  this.offset = (a, b) => { // Offsets pos a with pos b, returns a.
    a.x += b.x
    a.y += b.y
    return a
  }

  // Actions

  this.stroke = (shape, color, thickness = 2) => { // Strokes a shape.
    ronin.surface.stroke(shape, color, thickness)
    return shape
  }

  this.fill = (rect = this.frame(), color) => { // Fills a shape.
    ronin.surface.fill(rect, color)
    return rect
  }

  this.gradient = (line, colors = ['white', 'black']) => { // Defines a gradient color.
    return ronin.surface.linearGradient(line.a.x, line.a.y, line.b.x, line.b.y, colors)
  }

  this.guide = (shape, color) => { // Draws a shape on the guide layer.
    ronin.surface.drawGuide(shape, color)
    return shape
  }

  this.clear = (rect = this.frame()) => { // Clears a rect.
    ronin.surface.clearGuide(rect)
    ronin.surface.clear(rect)
    return rect
  }

  // colors

  this.rgba = (r, g, b, a = 1) => { // Defines a color r, g, b values are from 0 to 255, a from 0 to 1
    return `rgba(${r},${g},${b},${a})`
  }

  this.hsla = (h, s, l, a = 1) => { // Defines a color h from 0 to 360, s and l from 0 to 100, a from 0 to 1
    return `hsla(${h},${s}%,${l}%,${a})`
  }

  // Frame

  this.frame = () => { // Returns a rect of the frame.
    return ronin.surface.getFrame()
  }

  this.center = () => { // Returns a position of the center of the frame.
    const rect = this.frame()
    return this.pos(rect.w / 2, rect.h / 2)
  }

  this.resize = async (w, h, fit = true) => { // Resizes the canvas to target w and h, returns the rect.
    const rect = { x: 0, y: 0, w, h }
    const a = document.createElement('img')
    const b = document.createElement('img')
    a.src = ronin.surface.el.toDataURL()
    await ronin.surface.resizeImage(a, b)
    ronin.surface.resize(rect, fit)
    return ronin.surface.draw(b, rect)
  }

  this.rescale = async (w, h) => { // Rescales the canvas to target ratio of w and h, returns the rect.
    const rect = { x: 0, y: 0, w: this.frame().w * w, h: this.frame().h * h }
    const a = document.createElement('img')
    const b = document.createElement('img')
    a.src = ronin.surface.el.toDataURL()
    await ronin.surface.resizeImage(a, b)
    ronin.surface.resize(rect, true)
    return ronin.surface.draw(b, rect)
  }

  this.crop = async (rect) => { // Crop canvas to rect.
    return ronin.surface.crop(rect)
  }

  this.clone = (a, b) => {
    ronin.surface.clone(a, b)
    return [a, b]
  }

  this.drag = (rect = this.frame(), line = this.line()) => { // Drag a part of the canvas.
    const pos = { x: line.b.x - line.a.x, y: line.b.y - line.a.y }
    const crop = ronin.surface.getCrop(rect)
    ronin.surface.clear(rect)
    this.guide({ a: { x: rect.x, y: rect.y }, b: { x: pos.x + rect.x, y: pos.y + rect.y } })
    this.guide(rect)
    this.guide(this.offset(rect, { x: pos.x, y: pos.y }))
    ronin.surface.context.drawImage(crop, rect.x, rect.y)
  }

  this.view = (a, b) => { // View a part of the canvas.
    this.guide({ a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y } })
    this.guide(a)
    this.guide(b)
    ronin.surface.context.drawImage(ronin.surface.getCrop(a), b.x, b.y, b.w, b.h)
  }

  this.pick = (shape) => { // Returns the color of a pixel at pos, or of the average of the pixels in rect.
    const rect = shape.w && shape.h ? shape : this.rect(shape.x, shape.y, 1, 1)
    const img = ronin.surface.context.getImageData(rect.x, rect.y, rect.w, rect.h)
    const sum = [0, 0, 0]
    const count = img.data.length / 4
    for (let i = 0, loop = img.data.length; i < loop; i += 4) {
      sum[0] += img.data[i]
      sum[1] += img.data[i + 1]
      sum[2] += img.data[i + 2]
    }
    return this.color(Math.floor(sum[0] / count), Math.floor(sum[1] / count), Math.floor(sum[2] / count))
  }

  this.theme = (variable, el = document.documentElement) => {
    // ex. (theme "f_main") -> :root { --f_main: "#fff" }
    return getComputedStyle(el).getPropertyValue(`--${variable}`)
  }

  // Pixels

  this.pixels = (rect, fn, q = 1) => {
    if (!fn) { console.warn('Unknown function'); return rect }
    const img = ronin.surface.context.getImageData(rect.x, rect.y, rect.w, rect.h)
    for (let i = 0, loop = img.data.length; i < loop; i += 4) {
      const pixel = [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]]
      const processed = fn(pixel, q)
      img.data[i] = this.clamp(parseInt(processed[0]), 0, 255)
      img.data[i + 1] = this.clamp(parseInt(processed[1]), 0, 255)
      img.data[i + 2] = this.clamp(parseInt(processed[2]), 0, 255)
      img.data[i + 3] = this.clamp(parseInt(processed[3]), 0, 255)
    }
    ronin.surface.context.putImageData(img, rect.x, rect.y)
    return rect
  }

  this.saturation = (pixel, q) => { // Change the saturation of pixels.
    const color = 0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2]
    return [(color * (1 - q)) + (pixel[0] * q), (color * (1 - q)) + (pixel[1] * q), (color * (1 - q)) + (pixel[2] * q), pixel[3]]
  }

  this.contrast = (pixel, q) => { // Change the contrast of pixels.
    const intercept = 128 * (1 - q)
    return [pixel[0] * q + intercept, pixel[1] * q + intercept, pixel[2] * q + intercept, pixel[3]]
  }

  this.brightness = (pixel, q) => { // Change the brightness of pixels.
    const range = 255 - -q
    return [((pixel[0] / 255) * range), ((pixel[1] / 255) * range), ((pixel[2] / 255) * range), pixel[3]]
  }

  this.additive = (pixel, q) => { // Condense the data of pixels.
    return [pixel[0] + q, pixel[1] + q, pixel[2] + q, pixel[3]]
  }

  this.multiply = (pixel, q) => { // Change the color balance of pixels.
    return [pixel[0] * q[0], pixel[1] * q[1], pixel[2] * q[2], pixel[3]]
  }

  this.normalize = (pixel, q) => { // Normalize the color of pixels with another color.
    const averaged = [128 - q.r + pixel[0], 128 - q.g + pixel[1], 128 - q.b + pixel[2], pixel[3]]
    const offset = this.luminance(pixel) - this.luminance(averaged)
    return this.additive(averaged, offset)
  }

  this.luminance = (color) => { // Get the luminance of a color.
    return 0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2]
  }

  // Strings

  this.concat = function (...items) { // Concat multiple strings.
    return items.reduce((acc, item) => { return `${acc}${item}` }, '')
  }

  this.split = function (string, char) { // Split string at character.
    return string.split(char)
  }

  // Math

  this.add = (...args) => { // Adds values.
    return args.reduce((sum, val) => sum + val)
  }

  this.sub = (...args) => { // Subtracts values.
    return args.reduce((sum, val) => sum - val)
  }

  this.mul = (...args) => { // Multiplies values.
    return args.reduce((sum, val) => sum * val)
  }

  this.div = (...args) => { // Divides values.
    return args.reduce((sum, val) => sum / val)
  }

  this.mod = (a, b) => { // Returns the modulo of a and b.
    return a % b
  }

  this.clamp = (val, min, max) => { // Clamps a value between min and max.
    return Math.min(max, Math.max(min, val))
  }

  this.step = (val, step) => {
    return Math.round(val / step) * step
  }

  this.min = Math.min // Clamp value from.

  this.max = Math.max // Clamp value at.

  this.ceil = Math.ceil // Round up to the nearest integer.

  this.floor = Math.floor // Round down to the nearest integer.

  this.sin = Math.sin

  this.cos = Math.cos

  this.log = Math.log // Caclulates on the base.

  this.pow = (a, b) => { // Calculates a^b.
    return Math.pow(a, b)
  }

  this.sqrt = Math.sqrt // Calculate the square root.

  this.sq = (a) => { // Calculate the square.
    return a * a
  }

  this.PI = Math.PI

  this.TWO_PI = Math.PI * 2

  this.random = (...args) => {
    if (args.length >= 2) {
      // (random start end)
      return args[0] + Math.random() * (args[1] - args[0])
    } else if (args.length === 1) {
      // (random max)
      return Math.random() * args[0]
    }
    return Math.random()
  }

  // Logic

  this.gt = (a, b) => { // Returns true if a is greater than b, else false.
    return a > b
  }

  this.lt = (a, b) => { // Returns true if a is less than b, else false.
    return a < b
  }

  this.eq = (a, b) => { // Returns true if a is equal to b, else false.
    return a === b
  }

  this.and = (a, b, ...rest) => { // Returns true if all conditions are true.
    let args = [a, b].concat(rest)
    for (let i = 0; i < args.length; i++) {
      if (!args[i]) {
        return args[i]
      }
    }
    return args[args.length - 1]
  }

  this.or = (a, b, ...rest) => { // Returns true if at least one condition is true.
    let args = [a, b].concat(rest)
    for (let i = 0; i < args.length; i++) {
      if (args[i]) {
        return args[i]
      }
    }
    return args[args.length - 1]
  }

  // Arrays

  this.each = async (arr, fn) => { // Run a function for each element in a list.
    for (let i = 0; i < arr.length; i++) {
      const arg = arr[i]
      await fn(arg)
    }
  }

  this.map = async (arr, fn) => { // Run a function on each element in a list.
    for (let i = 0; i < arr.length; i++) {
      const arg = arr[i]
      arr[i] = await fn(arg)
    }
  }

  this.filter = (arr, fn) => { // Remove from list, when function returns false.
    const list = Array.from(arr)
    return Promise.all(list.map((element, index) => fn(element, index, list)))
      .then(result => {
        return list.filter((_, index) => {
          return result[index]
        })
      })
  }

  this.reduce = async (arr, fn, acc) => {
    const length = arr.length
    let result = acc === undefined ? subject[0] : acc
    for (let i = acc === undefined ? 1 : 0; i < length; i++) {
      result = await fn(result, arr[i], i, arr)
    }
    return result
  }

  this.len = (item) => { // Returns the length of a list.
    return item.length
  }

  this.first = (arr) => { // Returns the first item of a list.
    return arr[0]
  }

  this.last = (arr) => { // Returns the last
    return arr[arr.length - 1]
  }

  this.rest = ([_, ...arr]) => {
    return arr
  }

  this.range = (start, end, step = 1) => {
    let arr = []
    if (step > 0) {
      for (let i = start; i <= end; i += step) {
        arr.push(i)
      }
    } else {
      for (let i = start; i >= end; i += step) {
        arr.push(i)
      }
    }
    return arr
  }

  // Objects

  this.get = (item, key) => { // Gets an object's parameter with name.
    return item[key]
  }

  this.set = (item, ...args) => { // Sets an object's parameter with name as value.
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i]
      const val = args[i + 1]
      item[key] = val
    }
    return item
  }

  this.of = (h, ...keys) => { // Gets object parameters with names.
    return keys.reduce((acc, key) => {
      return acc[key]
    }, h)
  }

  this.keys = (item) => { // Returns a list of the object's keys
    return Object.keys(item)
  }

  this.values = (item) => { // Returns a list of the object's values
    return Object.values(item)
  }

  // Convolve

  this.convolve = (rect, kernel) => {
    const sigma = kernel.flat().reduce((a, x) => (a + x))
    const kw = kernel[0].length; const kh = kernel.length
    const img = ronin.surface.context.getImageData(rect.x, rect.y, rect.w, rect.h)
    const out = new Uint8ClampedArray(rect.w * 4 * rect.h)
    for (let i = 0, outer = img.data.length; i < outer; i++) { // bytes
      const ix = Math.floor(i / 4) % rect.w; const iy = Math.floor((i / 4) / rect.w)
      let acc = 0.0
      for (let k = 0, inner = kw * kh; k < inner; k++) { // kernel
        const kx = (k % kw); const ky = (Math.floor(k / kw))
        const x = Math.ceil(ix + kx - kw / 2); const y = Math.ceil(iy + ky - kh / 2)
        if (x < 0 || x >= rect.w || y < 0 || y >= rect.h) continue // edge case
        acc += img.data[x * 4 + y * rect.w * 4 + i % 4] * kernel[kx][ky] / sigma
      }
      out[i] = acc
      if (i % 4 === 3) out[i] = 255
    }
    img.data.set(out, 0)
    ronin.surface.context.putImageData(img, rect.x, rect.y)
    return rect
  }

  this.blur = [[1, 2, 1],
    [2, 4, 2],
    [1, 2, 2]]

  this.sharpen = [[ 0, -1, 0],
    [-1, 5, -1],
    [ 0, -1, 0]]

  this.edge = [[-1, -1, -1],
    [-1, 9, -1],
    [-1, -1, -1]]

  // File System

  this.dir = (path = this.dirpath()) => { // Returns the content of a directory.
    return fs.existsSync(path) ? fs.readdirSync(path) : []
  }

  this.file = (path = this.filepath()) => { // Returns the content of a file.
    return fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : ''
  }

  this.dirpath = (path = this.filepath()) => { // Returns the path of a directory.
    return require('path').dirname(path)
  }

  this.filepath = (path = ronin.source.path) => { // Returns the path of a file.
    return path
  }

  this.exit = (force = false) => { // Exits Ronin.
    ronin.source.quit(force)
  }

  this.echo = (...args) => { // Print arguments to interface.
    ronin.log(args)
    return args
  }

  this.debug = (arg) => { // Print arguments to console.
    console.log(arg)
    return arg
  }

  this.time = (rate = 1) => { // Returns timestamp in milliseconds.
    return (Date.now() * rate)
  }

  this.js = () => { // Javascript interop.
    return window
  }

  this.on = (event, f) => { // Triggers on event.
    ronin.bind(event, f)
  }

  this.test = (name, a, b) => {
    if (`${a}` !== `${b}`) {
      console.warn('failed ' + name, a, b)
    } else {
      console.log('passed ' + name, a)
    }
    return a === b
  }

  this.benchmark = async (fn) => { // Logs time taken to execute a function.
    const start = Date.now()
    const result = await fn()
    console.log(`time taken: ${Date.now() - start}ms`)
    return result
  }
}
