"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"

interface UploadedFile {
  id: string
  filename: string
  size: number
  type: string
  url: string
  status: "uploaded" | "parsing" | "completed" | "error"
}

interface FileUploadProps {
  onUploadComplete?: (file: UploadedFile) => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploading(true)
      setUploadProgress(0)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90))
        }, 200)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Upload failed")
        }

        const uploadedFile = await response.json()
        setUploadedFiles((prev) => [...prev, uploadedFile])
        onUploadComplete?.(uploadedFile)

        setTimeout(() => {
          setUploadProgress(0)
          setUploading(false)
        }, 1000)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Upload failed")
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [onUploadComplete],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  })

  const removeFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/resumes/${fileId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
      }
    } catch (error) {
      console.error("Failed to delete file:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : uploading
                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {uploading ? (
              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-700">Uploading...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive ? "Drop your resume here" : "Upload your resume"}
                </p>
                <p className="text-sm text-gray-500 mb-4">Drag and drop or click to select files</p>
                <p className="text-xs text-gray-400">Supports PDF, DOCX, and TXT files up to 10MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.filename}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
