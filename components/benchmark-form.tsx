"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, ArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"

export function BenchmarkForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [isRunning, setIsRunning] = useState(false)

  const maxChars = 2000
  const usagePercentage = Math.round((prompt.length / maxChars) * 100)

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

    const nativeExecutionTime = 2.5 + Math.random() * 1.5
    const optimizedExecutionTime = nativeExecutionTime * (0.4 + Math.random() * 0.3)

    const nativeTokenCount = Math.floor(800 + Math.random() * 400)
    const optimizedTokenCount = Math.floor(nativeTokenCount * (0.7 + Math.random() * 0.2))

    const nativeMemory = Math.floor(450 + Math.random() * 200)
    const optimizedMemory = Math.floor(nativeMemory * (0.5 + Math.random() * 0.3))

    const benchmarkResult = {
      id: Date.now(),
      experimentId: `benchmark-${Date.now()}`,
      prompt,
      timestamp: new Date().toISOString(),
      native: {
        executionTime: nativeExecutionTime,
        tokenCount: nativeTokenCount,
        memoryUsage: nativeMemory,
      },
      optimized: {
        executionTime: optimizedExecutionTime,
        tokenCount: optimizedTokenCount,
        memoryUsage: optimizedMemory,
      },
    }

    // Store in localStorage
    const existingResults = JSON.parse(localStorage.getItem("benchmark-results") || "[]")
    existingResults.push(benchmarkResult)
    localStorage.setItem("benchmark-results", JSON.stringify(existingResults))

    setIsRunning(false)

    toast({
      title: "Benchmark Complete",
      description: "Successfully benchmarked your prompt on both kernels",
    })

    // Navigate to dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 500)
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/40 shadow-lg overflow-hidden p-0">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="p-4 pb-3">
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
            <span>Executing on both kernels...</span>
          </div>
        )}
      </form>
    </Card>
  )
}
