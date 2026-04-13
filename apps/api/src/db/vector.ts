import { customType } from 'drizzle-orm/pg-core'

type VectorConfig = { dimensions: number }

export const vector = (name: string, options: VectorConfig) => {
  const vectorColumn = customType<{ data: number[]; driverData: string }>({
    dataType() {
      return `vector(${options.dimensions})`
    },
    toDriver(value) {
      return `[${value.join(',')}]`
    },
    fromDriver(value) {
      const trimmed = value.trim().replace(/^\[/, '').replace(/\]$/, '')
      if (!trimmed) {
        return []
      }

      return trimmed.split(',').map((part) => Number(part.trim()))
    }
  })

  return vectorColumn(name)
}
