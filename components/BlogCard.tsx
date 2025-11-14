import Link from 'next/link'
import { format } from 'date-fns'

interface BlogCardProps {
  blog: {
    id: string
    title: string
    excerpt: string | null
    slug: string
    createdAt: string
    author: {
      name: string | null
    }
    _count: {
      likes: number
      comments: number
    }
  }
}

export default function BlogCard({ blog }: BlogCardProps) {
  
  return (
    <Link href={`/blog/${blog.slug}`}>
      <article className="group cursor-pointer py-6 border-b border-gray-800 hover:border-gray-700 transition-colors">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {blog.author.image ? (
                <img
                  src={blog.author.image}
                  alt={blog.author.name || 'Author'}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                  {(blog.author.name || 'A')[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-400">{blog.author.name || 'Anonymous'}</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-100 mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
              {blog.title}
            </h2>
            
            {blog.excerpt && (
              <p className="text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                {blog.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</span>
              <span>•</span>
              <span>❤️ {blog._count.likes}</span>
              <span>💬 {blog._count.comments}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

