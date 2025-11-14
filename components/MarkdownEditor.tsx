import { useState, useRef } from 'react'
import { Upload, Code, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your content in Markdown...',
  rows = 15,
}: MarkdownEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end)

    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        insertText(`![${file.name}](${data.url})`, '')
        toast.success('Image uploaded successfully!')
      } else {
        const errorMsg = data.error || 'Failed to upload image'
        const details = data.details ? `: ${data.details}` : ''
        toast.error(`${errorMsg}${details}`)
        console.error('Upload error:', data)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload image: ${error.message || 'Network error'}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-2 p-2 bg-slate-800/50 rounded-t-lg border-b border-gray-700">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-slate-700 rounded transition disabled:opacity-50"
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText('```\n', '\n```')}
          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-slate-700 rounded transition"
          title="Insert Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText('**', '**')}
          className="px-2 py-1 text-sm text-gray-400 hover:text-gray-200 hover:bg-slate-700 rounded transition"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertText('*', '*')}
          className="px-2 py-1 text-sm text-gray-400 hover:text-gray-200 hover:bg-slate-700 rounded transition"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => insertText('[', '](url)')}
          className="px-2 py-1 text-sm text-gray-400 hover:text-gray-200 hover:bg-slate-700 rounded transition"
          title="Link"
        >
          Link
        </button>
        <div className="flex-1 text-xs text-gray-500 ml-4">
          Markdown supported
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2 bg-slate-700/50 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-b-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Upload indicator */}
      {isUploading && (
        <div className="absolute top-16 left-4 text-sm text-primary-400">
          Uploading...
        </div>
      )}
    </div>
  )
}

