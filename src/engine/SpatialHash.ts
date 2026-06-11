export class SpatialHash {
  private cellSize: number
  private grid: Map<string, Set<number>> = new Map()

  constructor(cellSize: number) {
    this.cellSize = cellSize
  }

  private key(x: number, y: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`
  }

  clear() {
    this.grid.clear()
  }

  insert(id: number, x: number, y: number) {
    const k = this.key(x, y)
    let bucket = this.grid.get(k)
    if (!bucket) {
      bucket = new Set()
      this.grid.set(k, bucket)
    }
    bucket.add(id)
  }

  query(x: number, y: number, radius: number): number[] {
    const results: number[] = []
    const startCX = Math.floor((x - radius) / this.cellSize)
    const endCX = Math.floor((x + radius) / this.cellSize)
    const startCY = Math.floor((y - radius) / this.cellSize)
    const endCY = Math.floor((y + radius) / this.cellSize)

    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cy = startCY; cy <= endCY; cy++) {
        const bucket = this.grid.get(`${cx},${cy}`)
        if (bucket) {
          for (const id of bucket) {
            results.push(id)
          }
        }
      }
    }
    return results
  }
}
