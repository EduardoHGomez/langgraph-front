"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Zap, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface BenchmarkRun {
  id: number
  experimentId: string
  prompt: string
  timestamp: string
  kernelType: "Native" | "Optimized"
  tokensPerSecond: number
  validationAccuracy: number
  peakGpuMemoryMb: number
  runToRunVariance: number
  throughputPerDollar: number
}

export function PerformanceDashboard() {
  const [runs, setRuns] = useState<BenchmarkRun[]>([])

  useEffect(() => {
    const loadRuns = () => {
      const storedRuns: BenchmarkRun[] = JSON.parse(localStorage.getItem("benchmark-runs") || "[]")
      setRuns(storedRuns)
    }

    loadRuns()

    // Refresh every 3 seconds
    const interval = setInterval(loadRuns, 3000)
    return () => clearInterval(interval)
  }, [])

  if (runs.length === 0) {
    return (
      <Card className="p-12 text-center border-border/50 shadow-sm">
        <div className="space-y-4">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-xl font-semibold">No Benchmark Results Yet</h3>
            <p className="text-muted-foreground mt-2">
              Run your first benchmark to see performance comparisons between Native Code and Optimized Code
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const lastNativeRun = [...runs].reverse().find((run) => run.kernelType === "Native")
  const lastOptimizedRun = [...runs].reverse().find((run) => run.kernelType === "Optimized")

  const chartData = []
  if (lastNativeRun && lastOptimizedRun) {
    // Normalize values to 0-100 scale for better visualization
    const normalizeSpeed = (val: number) => Math.min((val / 300) * 100, 100)
    const normalizeAccuracy = (val: number) => val * 100
    const normalizeMemory = (val: number) => Math.max(100 - (val / 1500) * 100, 0) // Inverted: lower is better
    const normalizeStability = (val: number) => Math.max(100 - (val / 0.2) * 100, 0) // Inverted: lower is better
    const normalizeCost = (val: number) => Math.min((val / 100) * 100, 100)

    chartData.push(
      {
        metric: "Speed",
        Native: normalizeSpeed(lastNativeRun.tokensPerSecond),
        Optimized: normalizeSpeed(lastOptimizedRun.tokensPerSecond),
      },
      {
        metric: "Accuracy",
        Native: normalizeAccuracy(lastNativeRun.validationAccuracy),
        Optimized: normalizeAccuracy(lastOptimizedRun.validationAccuracy),
      },
      {
        metric: "Memory Efficiency",
        Native: normalizeMemory(lastNativeRun.peakGpuMemoryMb),
        Optimized: normalizeMemory(lastOptimizedRun.peakGpuMemoryMb),
      },
      {
        metric: "Stability",
        Native: normalizeStability(lastNativeRun.runToRunVariance),
        Optimized: normalizeStability(lastOptimizedRun.runToRunVariance),
      },
      {
        metric: "Cost Efficiency",
        Native: normalizeCost(lastNativeRun.throughputPerDollar),
        Optimized: normalizeCost(lastOptimizedRun.throughputPerDollar),
      },
    )
  }

  const metricsComparison = []
  if (lastNativeRun && lastOptimizedRun) {
    metricsComparison.push(
      {
        name: "Speed",
        technicalName: "tokens_per_second",
        nativeValue: lastNativeRun.tokensPerSecond,
        optimizedValue: lastOptimizedRun.tokensPerSecond,
        unit: "",
        higherIsBetter: true,
        format: (val: number) => val.toFixed(1),
      },
      {
        name: "Accuracy",
        technicalName: "validation_accuracy",
        nativeValue: lastNativeRun.validationAccuracy,
        optimizedValue: lastOptimizedRun.validationAccuracy,
        unit: "%",
        higherIsBetter: true,
        format: (val: number) => (val * 100).toFixed(2),
      },
      {
        name: "Memory Efficiency",
        technicalName: "peak_gpu_memory_mb",
        nativeValue: lastNativeRun.peakGpuMemoryMb,
        optimizedValue: lastOptimizedRun.peakGpuMemoryMb,
        unit: " MB",
        higherIsBetter: false,
        format: (val: number) => val.toFixed(1),
      },
      {
        name: "Stability",
        technicalName: "run_to_run_variance",
        nativeValue: lastNativeRun.runToRunVariance,
        optimizedValue: lastOptimizedRun.runToRunVariance,
        unit: "",
        higherIsBetter: false,
        format: (val: number) => val.toFixed(4),
      },
      {
        name: "Cost Efficiency",
        technicalName: "throughput_per_dollar",
        nativeValue: lastNativeRun.throughputPerDollar,
        optimizedValue: lastOptimizedRun.throughputPerDollar,
        unit: "",
        higherIsBetter: true,
        format: (val: number) => val.toFixed(1),
      },
    )
  }

  const getBetterCode = (metric: (typeof metricsComparison)[0]) => {
    if (metric.higherIsBetter) {
      return metric.optimizedValue > metric.nativeValue ? "Optimized" : "Native"
    } else {
      return metric.optimizedValue < metric.nativeValue ? "Optimized" : "Native"
    }
  }

  const calculateImprovement = (metric: (typeof metricsComparison)[0]) => {
    const { nativeValue, optimizedValue, higherIsBetter } = metric
    if (higherIsBetter) {
      return ((optimizedValue - nativeValue) / nativeValue) * 100
    } else {
      return ((nativeValue - optimizedValue) / nativeValue) * 100
    }
  }

  return (
    <div className="space-y-8">
      {runs.length > 1 && chartData.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Code Performance Overview</h2>
            <p className="text-muted-foreground">Last Run Comparison</p>
          </div>

          <Card className="p-6 border-border/40 shadow-lg bg-card">
            <ChartContainer
              config={{
                Native: {
                  label: "Native Code",
                  color: "hsl(var(--chart-1))",
                },
                Optimized: {
                  label: "Optimized Code",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[220px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="metric" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="Native" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Optimized" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </div>
      )}

      {metricsComparison.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Advanced Metrics Summary</h2>
            <p className="text-muted-foreground">Direct comparison of Native Code vs Optimized Code performance</p>
          </div>

          <Card className="overflow-hidden border-border/40 shadow-lg bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40">
                    <th className="text-left p-4 font-semibold text-sm text-foreground/90">Metric Name</th>
                    <th className="text-right p-4 font-semibold text-sm text-foreground/90">Native Code</th>
                    <th className="text-right p-4 font-semibold text-sm text-foreground/90">Optimized Code</th>
                    <th className="text-right p-4 font-semibold text-sm text-foreground/90">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {metricsComparison.map((metric, index) => {
                    const betterCode = getBetterCode(metric)
                    const improvement = calculateImprovement(metric)
                    const improvementColor = improvement > 0 ? "text-green-500" : "text-red-500"

                    return (
                      <tr
                        key={metric.name}
                        className={cn(
                          "border-b border-border/40 hover:bg-muted/20 transition-colors",
                          index === metricsComparison.length - 1 && "border-b-0",
                        )}
                      >
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[15px]">{metric.name}</span>
                            <span className="text-xs font-mono text-muted-foreground">{metric.technicalName}</span>
                          </div>
                        </td>
                        <td className="text-right p-4">
                          <div className="flex items-center justify-end gap-2">
                            {betterCode === "Native" && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
                            <span className="font-medium text-[15px]">
                              {metric.format(metric.nativeValue)}
                              {metric.unit}
                            </span>
                          </div>
                        </td>
                        <td className="text-right p-4">
                          <div className="flex items-center justify-end gap-2">
                            {betterCode === "Optimized" && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
                            <span className="font-medium text-[15px]">
                              {metric.format(metric.optimizedValue)}
                              {metric.unit}
                            </span>
                          </div>
                        </td>
                        <td className="text-right p-4">
                          <span className={cn("font-semibold text-[15px]", improvementColor)}>
                            {improvement > 0 ? "+" : ""}
                            {improvement.toFixed(2)}%
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
      )}
    </div>
  )
}
