import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateBlogSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  published: z.boolean().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query
  const session = await getServerSession(req, res, authOptions)

  if (req.method === 'GET') {
    try {
      const blog = await prisma.blog.findUnique({
        where: { slug: slug as string },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      })

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' })
      }

      return res.status(200).json({ blog })
    } catch (error: unknown) {
      console.error('Error fetching blog:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const blog = await prisma.blog.findUnique({
        where: { slug: slug as string },
      })

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' })
      }

      if (blog.authorId !== session.user.id) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const data = updateBlogSchema.parse(req.body)
      let slugUpdate = blog.slug

      if (data.title && data.title !== blog.title) {
        slugUpdate = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .concat(`-${Date.now()}`)
      }

      const updatedBlog = await prisma.blog.update({
        where: { slug: slug as string },
        data: {
          ...data,
          slug: slugUpdate,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      return res.status(200).json({ blog: updatedBlog })
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      console.error('Error updating blog:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const blog = await prisma.blog.findUnique({
        where: { slug: slug as string },
      })

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' })
      }

      if (blog.authorId !== session.user.id) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      await prisma.blog.delete({
        where: { slug: slug as string },
      })

      return res.status(200).json({ message: 'Blog deleted successfully' })
    } catch (error: unknown) {
      console.error('Error deleting blog:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

