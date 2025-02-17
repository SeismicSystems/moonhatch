import React, { useState } from 'react'

const ImageUpload: React.FC<{
  onFileSelect: (file: File) => void
}> = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState<string>('')

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-[var(--lightBlue)] mb-2 text-sm">
        {' '}
        IMG / VIDEO
      </label>
      <div
        className="border-2 border-dashed border-gray-700 rounded p-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <p className="text-gray-400">
            {fileName
              ? `Selected: ${fileName}`
              : 'drag and drop an image or video'}
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            select file
          </button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*"
          />
        </div>
      </div>
    </div>
  )
}

export default ImageUpload
