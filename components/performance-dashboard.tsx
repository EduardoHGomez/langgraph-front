"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Zap, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface BenchmarkResult {
  id: number
  experimentId: string
  prompt: string
  timestamp: string
  native: {
    executionTime: number
    tokenCount: number
    memoryUsage: number
  }
  optimized: {
    executionTime: number
    tokenCount: number
    memoryUsage: number
  }
}

export function PerformanceDashboard() {
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [latestResult, setLatestResult] = useState<BenchmarkResult | null>(null)
  const [chartFilter, setChartFilter] = useState<"last5" | "last10" | "all">("last5")

  useEffect(() => {
    const loadResults = () => {
      const storedResults: BenchmarkResult[] = JSON.parse(localStorage.getItem("benchmark-results") || "[]")
      setResults(storedResults)
      if (storedResults.length > 0) {
        setLatestResult(storedResults[storedResults.length - 1])
      }
    }

    loadResults()

    // Refresh every 3 seconds
    const interval = setInterval(loadResults, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!latestResult) {
    return (
      <Card className="p-12 text-center border-border/50 shadow-sm">
        <div className="space-y-4">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-xl font-semibold">No Benchmark Results Yet</h3>
            <p className="text-muted-foreground mt-2">
              Run your first benchmark to see performance comparisons between Native and Optimized Kernels
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const metrics = [
    {
      id: "executionTime",
      label: "Execution Time",
      unit: "ms",
      native: latestResult.native.executionTime * 1000,
      optimized: latestResult.optimized.executionTime * 1000,
      lowerIsBetter: true,
      decimals: 0,
    },
    {
      id: "tokenCount",
      label: "Token Count",
      unit: "tokens",
      native: latestResult.native.tokenCount,
      optimized: latestResult.optimized.tokenCount,
      lowerIsBetter: true,
      decimals: 0,
    },
    {
      id: "memoryUsage",
      label: "Memory Usage",
      unit: "MB",
      native: latestResult.native.memoryUsage,
      optimized: latestResult.optimized.memoryUsage,
      lowerIsBetter: true,
      decimals: 1,
    },
  ]

  const getBetterValue = (nativeVal: number, optimizedVal: number, lowerIsBetter: boolean) => {
    if (lowerIsBetter) {
      return optimizedVal < nativeVal ? "optimized" : "native"
    }
    return optimizedVal > nativeVal ? "optimized" : "native"
  }

  const getFilteredResults = () => {
    if (chartFilter === "last5") return results.slice(-5)
    if (chartFilter === "last10") return results.slice(-10)
    return results
  }

  const chartData = getFilteredResults().map((result, index) => ({
    run: `Run ${index + 1}`,
    native: result.native.executionTime * 1000,
    optimized: result.optimized.executionTime * 1000,
  }))

  return (
    <div className="space-y-8">
      {results.length > 1 && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Benchmark History</h2>
              <p className="text-muted-foreground">Execution time comparison across multiple runs</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartFilter("last5")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  chartFilter === "last5"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                Last 5 Runs
              </button>
              <button
                onClick={() => setChartFilter("last10")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  chartFilter === "last10"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                Last 10 Runs
              </button>
              <button
                onClick={() => setChartFilter("all")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  chartFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                All Runs
              </button>
            </div>
          </div>

          <Card className="p-6 border-border/40 shadow-lg bg-card">
            <ChartContainer
              config={{
                native: {
                  label: "Native Kernel",
                  color: "hsl(var(--chart-1))",
                },
                optimized: {
                  label: "Optimized Kernel",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[220px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="run" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="native"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNative)"
                  />
                  <Area
                    type="monotone"
                    dataKey="optimized"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOptimized)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </div>
      )}

      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Performance Metrics</h2>
          <p className="text-muted-foreground">Detailed comparison of Native vs Optimized Kernel performance</p>
        </div>

        <Card className="overflow-hidden border-border/40 shadow-lg bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="text-left p-5 font-semibold text-sm text-foreground/90">Metric Name</th>
                  <th className="text-right p-5 font-semibold text-sm text-foreground/90">Native Kernel</th>
                  <th className="text-right p-5 font-semibold text-sm text-foreground/90">Optimized Kernel</th>
                  <th className="text-right p-5 font-semibold text-sm text-foreground/90">Improvement</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => {
                  const difference = metric.native - metric.optimized
                  const improvement = ((difference / metric.native) * 100).toFixed(1)
                  const winner = getBetterValue(metric.native, metric.optimized, metric.lowerIsBetter)
                  const isOptimizedBetter = winner === "optimized"

                  return (
                    <tr
                      key={metric.id}
                      className={cn(
                        "border-b border-border/40 hover:bg-muted/20 transition-colors",
                        index === metrics.length - 1 && "border-b-0",
                      )}
                    >
                      <td className="p-5">
                        <span className="font-medium text-[15px]">{metric.label}</span>
                      </td>
                      <td className="text-right p-5">
                        <div className="flex items-center justify-end gap-2">
                          {!isOptimizedBetter && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                          <span className={cn("font-medium text-[15px]", !isOptimizedBetter && "text-green-500")}>
                            {metric.native.toFixed(metric.decimals)} {metric.unit}
                          </span>
                        </div>
                      </td>
                      <td className="text-right p-5">
                        <div className="flex items-center justify-end gap-2">
                          {isOptimizedBetter && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                          <span className={cn("font-medium text-[15px]", isOptimizedBetter && "text-green-500")}>
                            {metric.optimized.toFixed(metric.decimals)} {metric.unit}
                          </span>
                        </div>
                      </td>
                      <td className="text-right p-5">
                        <span
                          className={cn(
                            "font-semibold text-base",
                            Number.parseFloat(improvement) > 0 ? "text-green-500" : "text-red-500",
                          )}
                        >
                          {Number.parseFloat(improvement) > 0 ? "+" : ""}
                          {improvement}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
