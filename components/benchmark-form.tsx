"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, ArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"

const EXAMPLE_PROMPTS = [
  "measures perf (latency, tokens/s, VRAM)",
  "runs unit/eval set checks; flags regressions",
  "proposes memory-safe tweaks (batch size, grad checkpointing, dtype)",
  "proposes PyTorch-level optimizations (torch.compile, amp, schedulers)",
  "merges best suggestions into a single next candidate",
]

export function BenchmarkForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [isRunning, setIsRunning] = useState(false)

  const maxChars = 2000
  const usagePercentage = Math.round((prompt.length / maxChars) * 100)

  const handleExampleClick = (example: string) => {
    setPrompt(example)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to benchmark",
        variant: "destructive",
      })
      return
    }

    setIsRunning(true)

    // Simulate benchmark execution (2-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Speed: tokens_per_second (higher is better)
    const nativeTokensPerSecond = 150 + Math.random() * 100
    const optimizedTokensPerSecond = nativeTokensPerSecond * (1.3 + Math.random() * 0.5)

    // Accuracy: validation_accuracy (0-1 scale, higher is better)
    const nativeAccuracy = 0.85 + Math.random() * 0.1
    const optimizedAccuracy = Math.min(0.99, nativeAccuracy + Math.random() * 0.05)

    // Memory Efficiency: peak_gpu_memory_mb (lower is better)
    const nativeMemory = 800 + Math.random() * 400
    const optimizedMemory = nativeMemory * (0.6 + Math.random() * 0.2)

    // Stability: run_to_run_variance (lower is better)
    const nativeVariance = 0.05 + Math.random() * 0.1
    const optimizedVariance = nativeVariance * (0.4 + Math.random() * 0.3)

    // Cost Efficiency: throughput_per_dollar (higher is better)
    const nativeThroughput = 50 + Math.random() * 30
    const optimizedThroughput = nativeThroughput * (1.5 + Math.random() * 0.5)

    const timestamp = new Date().toISOString()
    const experimentId = `benchmark-${Date.now()}`

    // Create two separate run entries - one for Native Code, one for Optimized Code
    const nativeRun = {
      id: Date.now(),
      experimentId,
      prompt,
      timestamp,
      kernelType: "Native",
      tokensPerSecond: nativeTokensPerSecond,
      validationAccuracy: nativeAccuracy,
      peakGpuMemoryMb: nativeMemory,
      runToRunVariance: nativeVariance,
      throughputPerDollar: nativeThroughput,
    }

    const optimizedRun = {
      id: Date.now() + 1,
      experimentId,
      prompt,
      timestamp,
      kernelType: "Optimized",
      tokensPerSecond: optimizedTokensPerSecond,
      validationAccuracy: optimizedAccuracy,
      peakGpuMemoryMb: optimizedMemory,
      runToRunVariance: optimizedVariance,
      throughputPerDollar: optimizedThroughput,
    }

    // Store both runs in localStorage
    const existingResults = JSON.parse(localStorage.getItem("benchmark-runs") || "[]")
    existingResults.push(nativeRun, optimizedRun)
    localStorage.setItem("benchmark-runs", JSON.stringify(existingResults))

    setIsRunning(false)

    toast({
      title: "Benchmark Complete",
      description: "Successfully benchmarked your prompt on both code implementations",
    })

    // Navigate to dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 500)
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/40 shadow-lg overflow-hidden p-0">
      <div className="px-4 py-3 border-b border-border/30 bg-muted/10">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example, index) => (
            <Button
              key={index}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleExampleClick(example)}
              disabled={isRunning}
              className="text-xs font-normal bg-muted/60 hover:bg-muted text-foreground/90 border border-border/30 rounded-full px-3 py-1.5 h-auto"
            >
              {example}
            </Button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="p-5">
          <Textarea
            placeholder="Ask, Search or Chat..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={12}
            className="resize-none text-[15px] leading-relaxed border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
            disabled={isRunning}
            required
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-accent"
              disabled={isRunning}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Auto</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{usagePercentage}% used</span>
            <Button type="submit" size="icon" disabled={isRunning || !prompt.trim()} className="h-8 w-8 rounded-full">
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isRunning && (
          <div className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground animate-pulse border-t border-border/40 bg-muted/10">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            <span>Executing on both code implementations...</span>
          </div>
        )}
      </form>
    </Card>
  )
}
