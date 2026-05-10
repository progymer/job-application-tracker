"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export default function ResumeUpload() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "uploading" | "success" | "error"
  >("loading");
  const [fileName, setFileName] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/resume")
      .then((r) => r.json())
      .then((data) => {
        if (data.exists) {
          setFileName(data.fileName);
          setUpdatedAt(new Date(data.updatedAt).toLocaleDateString());
          setStatus("success");
        } else {
          setStatus("idle");
        }
      });
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/resume", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      setStatus("error");
    } else {
      setFileName(data.fileName);
      setUpdatedAt(new Date().toLocaleDateString());
      setStatus("success");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (status === "loading") return null;

  return (
    <div className="px-2 py-1.5 space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Resume
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate">
            {status === "success" ? fileName : "No resume uploaded"}
          </p>
          <p className="text-xs text-gray-400">
            {status === "success"
              ? `Updated ${updatedAt}`
              : "PDF only · max 5MB"}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="xs"
        className="w-full"
        disabled={status === "uploading"}
        onClick={() => fileInputRef.current?.click()}
      >
        {status === "uploading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {status === "success" ? "Update" : "Upload"}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
