import { FileUpload } from "@/components/file-upload"

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Resume</h1>
        <p className="text-gray-600">Upload resume files to parse and extract candidate information</p>
      </div>

      <FileUpload
        onUploadComplete={(file) => {
          console.log("File uploaded:", file)
          // Handle upload completion (e.g., redirect, show success message)
        }}
      />
    </div>
  )
}
