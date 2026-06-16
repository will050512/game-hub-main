export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void
  private maxSize: number

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 0, maxSize = 1000) {
    this.factory = factory
    this.reset = reset
    this.maxSize = maxSize
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory())
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.factory()
  }

  release(obj: T) {
    if (this.pool.length >= this.maxSize) return
    this.reset(obj)
    this.pool.push(obj)
  }

  get available(): number {
    return this.pool.length
  }
}
