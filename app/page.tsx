import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-balance">LLM Performance Benchmarking</h1>
          <p className="text-xl text-muted-foreground text-balance">
            Compare Native and Optimized Kernel performance for your LLM prompts
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/benchmark" className="group">
            <Card className="p-8 hover:border-primary transition-colors cursor-pointer h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Run Benchmark</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Execute performance tests on Native and Optimized Kernels
                  </p>
                </div>
                <Button className="w-full" size="lg">
                  Start Benchmark
                </Button>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard" className="group">
            <Card className="p-8 hover:border-accent transition-colors cursor-pointer h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Performance Dashboard</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    View side-by-side kernel comparison and detailed metrics
                  </p>
                </div>
                <Button className="w-full bg-transparent" variant="outline" size="lg">
                  View Results
                </Button>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
