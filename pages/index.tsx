import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import Layout from '@/components/Layout'
import BlogCard from '@/components/BlogCard'

interface Blog {
  id: string
  title: string
  excerpt: string | null
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

interface HomeProps {
  blogs: Blog[]
  session: any
}

export default function Home({ blogs, session }: HomeProps) {
  return (
    <Layout session={session}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100">Latest Stories</h1>
          {session && (
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="bg-slate-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-slate-600 transition"
              >
                My Blogs
              </Link>
              <Link
                href="/blog/create"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Write
              </Link>
            </div>
          )}
        </div>

        {session && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
            <p className="text-gray-300 text-sm">
              💡 <strong>Tip:</strong> Only published blogs appear here. Check "Publish immediately" when creating, or publish from your <Link href="/dashboard" className="text-primary-400 hover:underline">Dashboard</Link>.
            </p>
          </div>
        )}

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">No published blogs found. Be the first to create and publish one!</p>
            {session && (
              <Link
                href="/blog/create"
                className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Create Your First Blog
              </Link>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blogs?published=true&limit=12`)
    const data = await res.json()

    return {
      props: {
        blogs: data.blogs || [],
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

