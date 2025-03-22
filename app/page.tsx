"use client"

import { useState } from "react"
import { PlusCircle, Trash2, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AntennaGraph } from "@/components/antenna-graph"
import { FrequencyAllocator } from "@/lib/frequency-allocator"

export default function Home() {
  const [antennas, setAntennas] = useState<string[]>([])
  const [newAntenna, setNewAntenna] = useState("")
  const [constraints, setConstraints] = useState<Array<[string, string]>>([])
  const [antenna1, setAntenna1] = useState("")
  const [antenna2, setAntenna2] = useState("")
  const [frequencyAssignment, setFrequencyAssignment] = useState<Record<string, number>>({})
  const [minFrequencies, setMinFrequencies] = useState<number>(0)

  const addAntenna = () => {
    if (newAntenna && !antennas.includes(newAntenna)) {
      setAntennas([...antennas, newAntenna])
      setNewAntenna("")
    }
  }

  const removeAntenna = (antenna: string) => {
    setAntennas(antennas.filter((a) => a !== antenna))
    setConstraints(constraints.filter(([a1, a2]) => a1 !== antenna && a2 !== antenna))
  }

  const addConstraint = () => {
    if (antenna1 && antenna2 && antenna1 !== antenna2) {
      const constraintExists = constraints.some(
        ([a1, a2]) => (a1 === antenna1 && a2 === antenna2) || (a1 === antenna2 && a2 === antenna1),
      )

      if (!constraintExists) {
        setConstraints([...constraints, [antenna1, antenna2]])
      }
    }
  }

  const removeConstraint = (index: number) => {
    setConstraints(constraints.filter((_, i) => i !== index))
  }

  const allocateFrequencies = () => {
    if (antennas.length === 0) return

    // Convert constraints to the format expected by the allocator
    const constraintPairs = constraints.map(([key, value]) => ({ key, value }))

    const allocator = new FrequencyAllocator(antennas, constraintPairs)
    const result = allocator.greedyColoring()

    setFrequencyAssignment(result)
    setMinFrequencies(allocator.getMinimumFrequencies())
  }

  const getColorForFrequency = (frequency: number) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-cyan-500",
    ]
    return colors[(frequency - 1) % colors.length]
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Antenna Frequency Allocator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Antenna Input */}
          <Card>
            <CardHeader>
              <CardTitle>Antennas</CardTitle>
              <CardDescription>Add antennas to the network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Antenna name"
                  value={newAntenna}
                  onChange={(e) => setNewAntenna(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAntenna()}
                />
                <Button onClick={addAntenna} variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {antennas.map((antenna) => (
                  <Badge key={antenna} variant="outline" className="flex items-center gap-1 px-3 py-1">
                    {antenna}
                    <button
                      onClick={() => removeAntenna(antenna)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Constraints Input */}
          <Card>
            <CardHeader>
              <CardTitle>Interference Constraints</CardTitle>
              <CardDescription>Define which antennas interfere with each other</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-2">
                  <Select value={antenna1} onValueChange={setAntenna1}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select antenna 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {antennas.map((antenna) => (
                        <SelectItem key={antenna} value={antenna}>
                          {antenna}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={antenna2} onValueChange={setAntenna2}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select antenna 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {antennas.map((antenna) => (
                        <SelectItem key={antenna} value={antenna}>
                          {antenna}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button onClick={addConstraint} variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {constraints.map(([a1, a2], index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                      <span>
                        {a1} ↔ {a2}
                      </span>
                      <button
                        onClick={() => removeConstraint(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={allocateFrequencies} className="w-full" disabled={antennas.length === 0}>
            <Play className="h-4 w-4 mr-2" />
            Allocate Frequencies
          </Button>
        </div>

        <div className="space-y-8">
          {/* Graph Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Network Visualization</CardTitle>
              <CardDescription>Visual representation of antennas and constraints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 h-[300px] flex items-center justify-center">
                {antennas.length > 0 ? (
                  <AntennaGraph antennas={antennas} constraints={constraints} frequencies={frequencyAssignment} />
                ) : (
                  <p className="text-muted-foreground">Add antennas to visualize the network</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Frequency Allocation Results</CardTitle>
              <CardDescription>Assigned frequencies for each antenna</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(frequencyAssignment).length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {Object.entries(frequencyAssignment).map(([antenna, frequency]) => (
                      <div key={antenna} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${getColorForFrequency(frequency)}`}></div>
                        <span>
                          {antenna}: Frequency {frequency}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold">Minimum Frequencies Used: {minFrequencies}</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Run the algorithm to see results</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

