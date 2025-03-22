interface ConstraintPair {
  key: string
  value: string
}

export class FrequencyAllocator {
  private antennas: string[]
  private constraints: ConstraintPair[]
  private graph: Map<string, Set<string>>
  private colors: Map<string, number>

  constructor(antennas: string[], constraints: ConstraintPair[]) {
    this.antennas = antennas
    this.constraints = constraints
    this.graph = new Map()
    this.colors = new Map()

    // Initialize graph
    for (const antenna of antennas) {
      this.graph.set(antenna, new Set())
    }

    // Construct graph
    for (const constraint of constraints) {
      const u = constraint.key
      const v = constraint.value

      const uNeighbors = this.graph.get(u)
      const vNeighbors = this.graph.get(v)

      if (uNeighbors && vNeighbors) {
        uNeighbors.add(v)
        vNeighbors.add(u)
      }
    }
  }

  greedyColoring(): Record<string, number> {
    // Sort antennas by degree (most constrained first)
    const sortedAntennas = [...this.graph.keys()].sort((a, b) => {
      const aSize = this.graph.get(a)?.size || 0
      const bSize = this.graph.get(b)?.size || 0
      return bSize - aSize
    })

    for (const antenna of sortedAntennas) {
      // Find unavailable frequencies for this antenna
      const usedFrequencies = new Set<number>()
      const neighbors = this.graph.get(antenna)

      if (neighbors) {
        for (const neighbor of neighbors) {
          const neighborColor = this.colors.get(neighbor)
          if (neighborColor !== undefined) {
            usedFrequencies.add(neighborColor)
          }
        }
      }

      // Assign the lowest available frequency
      let frequency = 1
      while (usedFrequencies.has(frequency)) {
        frequency++
      }

      this.colors.set(antenna, frequency)
    }

    // Convert Map to plain object for easier use in React
    return Object.fromEntries(this.colors.entries())
  }

  getMinimumFrequencies(): number {
    if (this.colors.size === 0) return 0
    return Math.max(...this.colors.values())
  }
}

