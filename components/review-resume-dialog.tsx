import { JobApplication } from "@/lib/models/models.types";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { CheckCircle2, XCircle } from "lucide-react";

interface ResumeReviewDialogProps {
  job: JobApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ReviewFeedback {
  matchScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: {
    area: string;
    fix: string;
  }[];
  matchedKeywords: string[];
  missingKeywords: string[];
}


export const ReviewResumeDialog = ({ job, open, onOpenChange}: ResumeReviewDialogProps) => {

  const [description, setDescription] = useState(job.description || "");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);

  async function handleReview() {
    setStatus("loading")
    const updatedjob = { ...job, description };

    const res = await fetch("/api/resume-review", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(updatedjob)
    })

    if(!res.ok){
        setStatus("error")
        return
    }

    const data = await res.json()
    setFeedback(data)
    setStatus("done")
  }

  const matchScoreColor = (value: number) => {
    if(value < 50) return "text-red-500"
    if(value >= 50 && value < 75) return "text-yellow-500"
    return "text-green-500" 
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {status === "idle" && (
        <DialogContent className="max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Review Resume</DialogTitle>
            <DialogDescription>
              Reviewing for{" "}
              <span className="font-medium text-foreground">
                {job.position}
              </span>{" "}
              at {job.company}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Job Description</Label>
                <span className="text-xs text-muted-foreground">
                  Edit to add more detail
                </span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none min-h-32 max-h-48 overflow-y-auto"
                placeholder="Paste the full job description here..."
              />
            </div>

            <Button className="w-full" onClick={handleReview}>
              Review my resume for this role
            </Button>
          </div>
        </DialogContent>
      )}
      {status === "loading" && (
        <DialogContent showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>Reviewing resume</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="flex items-end gap-1">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className="w-1 rounded-full"
                  style={{
                    height: "36px",
                    background: "#f76382",
                    animation: "barBounce 1.2s ease-in-out infinite",
                    animationDelay: `${(bar - 1) * 0.12}s`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Reviewing your resume...
            </p>
            <p className="text-sm text-muted-foreground">
              this usally take a few seconds...
            </p>

            <style>
              {`
                @keyframes barBounce {
                0%, 100% { transform: scaleY(0.2); opacity: 0.3; }
                50% { transform: scaleY(1); opacity: 1; }
                }
             `}
            </style>
          </div>
        </DialogContent>
      )}
      {status === "error" && (
        <DialogContent showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>Review failed</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Something went wrong
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Could not review your resume. Please try again.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus("idle")}
            >
              Try again
            </Button>
          </div>
        </DialogContent>
      )}
      {status === "done" && (
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          showCloseButton={false}
        >
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>Review done</DialogTitle>
                <DialogDescription>
                  {job.position} · {job.company}
                </DialogDescription>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-4xl font-bold ${matchScoreColor(feedback?.matchScore || 70)}`}
                >
                  {feedback?.matchScore}
                </p>
                <p className="text-xs text-muted-foreground">match score</p>
              </div>
            </div>
          </DialogHeader>

          <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-md p-3">
            {feedback?.summary}
          </p>

          <hr className="border-border" />

          {/* Strengths */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Strengths
            </p>
            {feedback?.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>

          <hr className="border-border" />

          {/* Gaps */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Gaps
            </p>
            {feedback?.gaps.map((g, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>{g}</span>
              </div>
            ))}
          </div>

          <hr className="border-border" />

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Suggestions
            </p>
            {feedback?.suggestions.map((s, i) => (
              <div key={i} className="bg-muted/50 rounded-md p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {s.area}
                </p>
                <p className="text-sm">{s.fix}</p>
              </div>
            ))}
          </div>

          <hr className="border-border" />

          {/* Keywords */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Keywords
            </p>
            <div className="flex flex-wrap gap-1.5">
              {feedback?.matchedKeywords.map((k, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-800"
                >
                  {k}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Missing from your resume
            </p>
            <div className="flex flex-wrap gap-1.5">
              {feedback?.missingKeywords.map((k, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-800"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setStatus("idle")}
          >
            Review again
          </Button>
        </DialogContent>
      )}
    </Dialog>
  );
}
