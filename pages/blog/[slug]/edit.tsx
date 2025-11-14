import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import Layout from '@/components/Layout'
import MarkdownEditor from '@/components/MarkdownEditor'
import toast from 'react-hot-toast'

interface Blog {
  id: string
  title: string
  content: string
  excerpt: string | null
  slug: string
  published: boolean
  author: {
    id: string
  }
}

interface EditBlogProps {
  blog: Blog
  session: any
}

export default function EditBlog({ blog: initialBlog, session: initialSession }: EditBlogProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialBlog.title,
    content: initialBlog.content,
    excerpt: initialBlog.excerpt || '',
    published: initialBlog.published,
  })

  const currentSession = session || initialSession

  if (currentSession?.user?.id !== initialBlog.author.id) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/blogs/${initialBlog.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Blog updated successfully!')
        router.push(`/blog/${data.blog.slug}`)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to update blog')
      }
    } catch (error) {
      toast.error('Failed to update blog')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout session={currentSession}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">Edit Blog</h1>
        <form onSubmit={handleSubmit} className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-purple-500/20">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-700/50 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-200 mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-slate-700/50 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-200 mb-2">
              Content * (Markdown supported - use toolbar to add images and code blocks)
            </label>
            <MarkdownEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Write your blog content in Markdown... Use the toolbar above to add images, code blocks, and formatting."
              rows={20}
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-200">Publish</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Blog'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-slate-700 text-gray-200 px-6 py-2 rounded-lg hover:bg-slate-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const { slug } = context.params!

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blogs/${slug}`
    )
    const data = await res.json()

    if (!data.blog || data.blog.author.id !== session.user.id) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    return {
      props: {
        blog: data.blog,
        session,
      },
    }
  } catch (error) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
}

