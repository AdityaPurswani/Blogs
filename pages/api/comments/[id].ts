import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCommentSchema = z.object({
  content: z.string().min(1),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  const session = await getServerSession(req, res, authOptions)

  if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const comment = await prisma.comment.findUnique({
        where: { id: id as string },
      })

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' })
      }

      if (comment.authorId !== session.user.id) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const { content } = updateCommentSchema.parse(req.body)

      const updatedComment = await prisma.comment.update({
        where: { id: id as string },
        data: { content },
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

      return res.status(200).json({ comment: updatedComment })
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      console.error('Error updating comment:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const comment = await prisma.comment.findUnique({
        where: { id: id as string },
      })

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' })
      }

      if (comment.authorId !== session.user.id) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      await prisma.comment.delete({
        where: { id: id as string },
      })

      return res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error: unknown) {
      console.error('Error deleting comment:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

