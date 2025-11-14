import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCommentSchema = z.object({
  content: z.string().min(1),
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
        select: { id: true },
      })

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' })
      }

      const comments = await prisma.comment.findMany({
        where: { blogId: blog.id },
        orderBy: { createdAt: 'desc' },
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

      return res.status(200).json({ comments })
    } catch (error: unknown) {
      console.error('Error fetching comments:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const blog = await prisma.blog.findUnique({
        where: { slug: slug as string },
        select: { id: true },
      })

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' })
      }

      const { content } = createCommentSchema.parse(req.body)

      const comment = await prisma.comment.create({
        data: {
          content,
          blogId: blog.id,
          authorId: session.user.id,
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

      return res.status(201).json({ comment })
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      console.error('Error creating comment:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

