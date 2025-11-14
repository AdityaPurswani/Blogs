import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendLikeNotification } from '@/lib/email'

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

      const likes = await prisma.like.findMany({
        where: { blogId: blog.id },
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

      const isLiked = session
        ? await prisma.like.findUnique({
            where: {
              blogId_authorId: {
                blogId: blog.id,
                authorId: session.user.id,
              },
            },
          })
        : null

      return res.status(200).json({
        likes,
        count: likes.length,
        isLiked: !!isLiked,
      })
    } catch (error: unknown) {
      console.error('Error fetching likes:', error)
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
        include: {
          author: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      })

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' })
      }

      const existingLike = await prisma.like.findUnique({
        where: {
          blogId_authorId: {
            blogId: blog.id,
            authorId: session.user.id,
          },
        },
      })

      if (existingLike) {
        await prisma.like.delete({
          where: {
            blogId_authorId: {
              blogId: blog.id,
              authorId: session.user.id,
            },
          },
        })

        return res.status(200).json({ message: 'Like removed', liked: false })
      }

      const like = await prisma.like.create({
        data: {
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

      // Send email notification if the liker is not the author
      if (blog.authorId !== session.user.id && blog.author.email) {
        const liker = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true },
        })

        await sendLikeNotification(
          blog.title,
          blog.slug,
          liker?.name || 'Someone',
          blog.author.email
        )
      }

      return res.status(201).json({ like, liked: true })
    } catch (error: unknown) {
      console.error('Error toggling like:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

