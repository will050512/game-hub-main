/** Polyfill CanvasRenderingContext2D for Happy-DOM (constructor may be missing entirely) */
if (typeof CanvasRenderingContext2D === 'undefined') {
  class CanvasRenderingContext2DShim {
    private _path: Array<{ type: string; args?: any[] }> = []
    private _fillStyle = '#000'
    private _strokeStyle = '#000'
    private _lineWidth = 1
    private _font = '12px sans-serif'
    private _textAlign: CanvasTextAlign = 'start'
    private _textBaseline: CanvasTextBaseline = 'alphabetic'
    private _globalAlpha = 1
    private _shadowColor = 'transparent'
    private _shadowBlur = 0
    private _shadowOffsetX = 0
    private _shadowOffsetY = 0
    private _lineCap: CanvasLineCap = 'butt'
    private _lineJoin: CanvasLineJoin = 'miter'
    private _miterLimit = 10
    private _lineDash: number[] = []
    private _lineDashOffset = 0

    get fillStyle() { return this._fillStyle }
    set fillStyle(v: string) { this._fillStyle = v }
    get strokeStyle() { return this._strokeStyle }
    set strokeStyle(v: string) { this._strokeStyle = v }
    get lineWidth() { return this._lineWidth }
    set lineWidth(v: number) { this._lineWidth = v }
    get lineCap() { return this._lineCap }
    set lineCap(v: CanvasLineCap) { this._lineCap = v }
    get lineJoin() { return this._lineJoin }
    set lineJoin(v: CanvasLineJoin) { this._lineJoin = v }
    get miterLimit() { return this._miterLimit }
    set miterLimit(v: number) { this._miterLimit = v }
    get lineDashOffset() { return this._lineDashOffset }
    set lineDashOffset(v: number) { this._lineDashOffset = v }
    get lineDash() { return this._lineDash }
    get font() { return this._font }
    set font(v: string) { this._font = v }
    get textAlign() { return this._textAlign }
    set textAlign(v: CanvasTextAlign) { this._textAlign = v }
    get textBaseline() { return this._textBaseline }
    set textBaseline(v: CanvasTextBaseline) { this._textBaseline = v }
    get globalAlpha() { return this._globalAlpha }
    set globalAlpha(v: number) { this._globalAlpha = v }
    get shadowColor() { return this._shadowColor }
    set shadowColor(v: string) { this._shadowColor = v }
    get shadowBlur() { return this._shadowBlur }
    set shadowBlur(v: number) { this._shadowBlur = v }
    get shadowOffsetX() { return this._shadowOffsetX }
    set shadowOffsetX(v: number) { this._shadowOffsetX = v }
    get shadowOffsetY() { return this._shadowOffsetY }
    set shadowOffsetY(v: number) { this._shadowOffsetY = v }

    beginPath(): void { this._path = [] }
    closePath(): void { this._path.push({ type: 'close' }) }
    moveTo(x: number, y: number): void { this._path.push({ type: 'moveTo', args: [x, y] }) }
    lineTo(x: number, y: number): void { this._path.push({ type: 'lineTo', args: [x, y] }) }
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
      this._path.push({ type: 'quadraticCurveTo', args: [cpx, cpy, x, y] })
    }
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
      this._path.push({ type: 'bezierCurveTo', args: [cp1x, cp1y, cp2x, cp2y, x, y] })
    }
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
      this._path.push({ type: 'arcTo', args: [x1, y1, x2, y2, radius] })
    }
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
      this._path.push({ type: 'arc', args: [x, y, radius, startAngle, endAngle, counterclockwise] })
    }
    rect(x: number, y: number, w: number, h: number): void {
      this._path.push({ type: 'rect', args: [x, y, w, h] })
    }
    roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit[]): void {
      const r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? (radii[0] as number) ?? 0 : 0)
      this._path.push({ type: 'roundRect', args: [x, y, w, h, r] })
    }
    isPointInPath(x: number, y: number): boolean { return false }
    isPointInStroke(x: number, y: number): boolean { return false }

    fill(fillStyle?: string | CanvasGradient | CanvasPattern): void {}
    stroke(strokeStyle?: string | CanvasGradient | CanvasPattern): void {}
    fillRect(x: number, y: number, w: number, h: number): void {}
    strokeRect(x: number, y: number, w: number, h: number): void {}
    clearRect(x: number, y: number, w: number, h: number): void {}

    fillText(text: string, x: number, y: number, maxWidth?: number): void {}
    strokeText(text: string, x: number, y: number, maxWidth?: number): void {}
    measureText(text: string): TextMetrics {
      return {
        actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0,
        actualBoundingBoxLeft: 0, actualBoundingBoxRight: 0,
        fontBoundingBoxAscent: 0, fontBoundingBoxDescent: 0,
        hangingOffset: 0, ideographicOffset: 0, lineGap: 0,
        width: text.length * 10,
      } as unknown as TextMetrics
    }

    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {}
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void {}
    getTransform(): DOMMatrix { return new DOMMatrix() }
    scale(x: number, y: number): void {}
    rotate(angle: number): void {}
    translate(x: number, y: number): void {}
    resetTransform(): void {}
    save(): void {}
    restore(): void {}

    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
      return { addColorStop(offset: number, color: string): void {} } as unknown as CanvasGradient
    }
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
      return { addColorStop(offset: number, color: string): void {} } as unknown as CanvasGradient
    }
    createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null { return null }

    createImageData(swOrData: number | ImageData, sh?: number, settings?: ImageDataSettings): ImageData {
      if (typeof swOrData === 'number') {
        return { data: new Uint8ClampedArray(swOrData * (sh ?? 0) * 4), width: swOrData, height: sh ?? 0 }
      }
      return swOrData
    }
    putImageData(imageData: ImageData, x: number, y: number, dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number): void {}
    getImageData(sx: number, sy: number, sw: number, sh: number, options?: ImageDataSettings): ImageData {
      return { data: new Uint8ClampedArray(sw * sh * 4), width: sw, height: sh }
    }

    drawImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | CanvasImageSource, dx: number, dy: number, dw?: number, dh?: number, sx?: number, sy?: number, sw?: number, sh?: number): void {}

    getLineDash(): number[] { return this._lineDash }
    setLineDash(segments: number[]): void { this._lineDash = segments }

    clip(fillRuleOrPath?: CanvasFillRule | Path2D, fillRule?: CanvasFillRule): void {}

    scrollPathIntoView(): void {}
    getCompositingMode(): string { return 'source-over' }
  }

  // Register as global constructor
  const Ctor = CanvasRenderingContext2DShim as unknown as typeof CanvasRenderingContext2D
  // @ts-expect-error -- polyfill
  globalThis.CanvasRenderingContext2D = Ctor

  // Apply roundRect polyfill on the constructor prototype
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (
      x: number, y: number, w: number, h: number, radii: number | number[] = 0
    ) {
      const r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] ?? 0 : 0)
      this.beginPath()
      this.moveTo(x + r, y)
      this.lineTo(x + w - r, y)
      this.quadraticCurveTo(x + w, y, x + w, y + r)
      this.lineTo(x + w, y + h - r)
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      this.lineTo(x + r, y + h)
      this.quadraticCurveTo(x, y + h, x, y + h - r)
      this.lineTo(x, y + r)
      this.quadraticCurveTo(x, y, x + r, y)
      this.closePath()
      return this as unknown as Path2D
    }
  }
}

/** Polyfill createImageBitmap for tests */
if (typeof createImageBitmap === 'undefined') {
  globalThis.createImageBitmap = async () => ({
    width: 0,
    height: 0,
    close: () => {},
  } as unknown as ImageBitmap)
}
