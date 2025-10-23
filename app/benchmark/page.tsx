import { BenchmarkForm } from "@/components/benchmark-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BenchmarkPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Benchmark Execution</h1>
            <p className="text-muted-foreground">Test your LLM prompts across kernels</p>
          </div>
        </div>

        <BenchmarkForm />
      </div>
    </div>
  )
}
