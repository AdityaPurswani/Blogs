import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Blog {
  id: string
  title: string
  slug: string
  published: boolean
  createdAt: string
  _count: {
    likes: number
    comments: number
  }
}

interface DashboardProps {
  blogs: Blog[]
  session: any
}

export default function Dashboard({ blogs, session }: DashboardProps) {
  const router = useRouter()

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) {
      return
    }

    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Blog deleted successfully')
        router.reload()
      } else {
        toast.error('Failed to delete blog')
      }
    } catch (error) {
      toast.error('Failed to delete blog')
    }
  }

  return (
    <Layout session={session}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">My Blogs</h1>
          <Link
            href="/blog/create"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Create New Blog
          </Link>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-500/20">
            <p className="text-gray-300 text-lg mb-4">You haven't created any blogs yet.</p>
            <Link
              href="/blog/create"
              className="text-primary-400 hover:underline font-medium"
            >
              Create your first blog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 flex justify-between items-center border border-purple-500/20"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="text-xl font-semibold text-gray-100 hover:text-primary-400 transition"
                    >
                      {blog.title}
                    </Link>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        blog.published
                          ? 'bg-green-800/50 text-green-300'
                          : 'bg-slate-700 text-gray-300'
                      }`}
                    >
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</span>
                    <span>❤️ {blog._count.likes} likes</span>
                    <span>💬 {blog._count.comments} comments</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/blog/${blog.slug}/edit`}
                    className="bg-slate-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-slate-600 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(blog.slug)}
                    className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

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
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blogs?limit=100`
    )
    const data = await res.json()

    // Filter blogs by current user
    const userBlogs = (data.blogs || []).filter(
      (blog: any) => blog.author.id === session.user.id
    )

    return {
      props: {
        blogs: userBlogs,
        session,
      },
    }
  } catch (error) {
    return {
      props: {
        blogs: [],
        session,
      },
    }
  }
}

