import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

interface CommentSectionProps {
  blogSlug: string
  session: any
}

export default function CommentSection({ blogSlug, session }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [blogSlug])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blogs/${blogSlug}/comments`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please sign in to comment')
      return
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/blogs/${blogSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        const data = await res.json()
        setComments([data.comment, ...comments])
        setContent('')
        toast.success('Comment added!')
      } else {
        toast.error('Failed to add comment')
      }
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold text-gray-100 mb-8">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      {session && (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-4 bg-slate-800/50 border border-gray-700 text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={4}
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {!session && (
        <p className="text-gray-400 mb-6">Sign in to leave a comment</p>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-800 pb-6 mb-6 last:border-0 last:mb-0">
              <div className="flex items-center gap-3 mb-3">
                {comment.author.image ? (
                  <img
                    src={comment.author.image}
                    alt={comment.author.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                    {(comment.author.name || 'A')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-200 block">
                    {comment.author.name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed ml-11">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

