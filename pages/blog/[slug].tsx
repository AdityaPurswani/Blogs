import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import CommentSection from '@/components/CommentSection'
import LikeButton from '@/components/LikeButton'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface Blog {
  id: string
  title: string
  content: string
  slug: string
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    likes: number
    comments: number
  }
}

interface BlogPageProps {
  blog: Blog
  session: any
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export default function BlogPage({ blog: initialBlog, session }: BlogPageProps) {
  const [blog, setBlog] = useState(initialBlog)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(blog._count.likes)
  const readingTime = calculateReadingTime(blog.content)

  useEffect(() => {
    fetchLikes()
  }, [])

  const fetchLikes = async () => {
    try {
      const res = await fetch(`/api/blogs/${blog.slug}/likes`)
      const data = await res.json()
      setIsLiked(data.isLiked)
      setLikeCount(data.count)
    } catch (error) {
      console.error('Error fetching likes:', error)
    }
  }

  const handleLike = async () => {
    if (!session) {
      toast.error('Please sign in to like blogs')
      return
    }

    try {
      const res = await fetch(`/api/blogs/${blog.slug}/likes`, {
        method: 'POST',
      })
      const data = await res.json()
      setIsLiked(data.liked)
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1))
      if (data.liked) {
        toast.success('Liked!')
      } else {
        toast.success('Like removed')
      }
    } catch (error) {
      toast.error('Failed to toggle like')
    }
  }

  return (
    <Layout session={session}>
      <article className="min-h-screen">
        {/* Hero Section - Medium Style */}
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-100 mb-6 leading-tight tracking-tight">
            {blog.title}
          </h1>
          
          {/* Author Info */}
          <div className="flex items-center gap-4 mb-8">
            {blog.author.image ? (
              <img
                src={blog.author.image}
                alt={blog.author.name || 'Author'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                {(blog.author.name || 'A')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="text-gray-200 font-medium">
                {blog.author.name || 'Anonymous'}
              </div>
              <div className="text-gray-400 text-sm flex items-center gap-2">
                <span>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</span>
                <span>•</span>
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-6 pb-8 border-b border-gray-700">
            <LikeButton
              isLiked={isLiked}
              likeCount={likeCount}
              onLike={handleLike}
              disabled={!session}
            />
            <div className="text-gray-400 text-sm">
              💬 {blog._count.comments} {blog._count.comments === 1 ? 'comment' : 'comments'}
            </div>
          </div>
        </div>

        {/* Content Section - Medium Style Reading Experience */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div 
            className="text-gray-200 leading-8 text-lg"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              lineHeight: '1.8',
              fontSize: '21px',
            }}
          >
            <MarkdownRenderer content={blog.content} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="max-w-4xl mx-auto px-4 py-12 border-t border-gray-700 mt-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {blog.author.image ? (
                <img
                  src={blog.author.image}
                  alt={blog.author.name || 'Author'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xl">
                  {(blog.author.name || 'A')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-gray-200 font-semibold text-lg">
                  {blog.author.name || 'Anonymous'}
                </div>
                <div className="text-gray-400 text-sm">
                  Published on {format(new Date(blog.createdAt), 'MMMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LikeButton
                isLiked={isLiked}
                likeCount={likeCount}
                onLike={handleLike}
                disabled={!session}
              />
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-3xl mx-auto px-4 pb-16">
          <CommentSection blogSlug={blog.slug} session={session} />
        </div>
      </article>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const { slug } = context.params!

  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blogs/${slug}`
    )
    const data = await res.json()

    if (!data.blog) {
      return {
        notFound: true,
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
      notFound: true,
    }
  }
}

