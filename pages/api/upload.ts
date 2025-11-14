import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { IncomingForm, File as FormidableFile } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: false,
    })

    // Wrap form.parse in a Promise
    const data = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parse error:', err)
          reject(err)
          return
        }
        resolve({ fields, files })
      })
    })

    const files = data.files
    console.log('Files received:', Object.keys(files))
    
    // Handle different possible file field names
    let file: FormidableFile | undefined
    if (files.file) {
      const fileArray = files.file as FormidableFile[]
      file = Array.isArray(fileArray) ? fileArray[0] : (files.file as FormidableFile)
    } else if (files.image) {
      const fileArray = files.image as FormidableFile[]
      file = Array.isArray(fileArray) ? fileArray[0] : (files.image as FormidableFile)
    } else {
      // Try to get the first file from any field
      const fileKeys = Object.keys(files)
      if (fileKeys.length > 0) {
        const firstFile = files[fileKeys[0]] as FormidableFile | FormidableFile[]
        file = Array.isArray(firstFile) ? firstFile[0] : firstFile
      }
    }
    
    if (!file) {
      console.error('No file found in upload')
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log('File details:', {
      originalFilename: file.originalFilename,
      newFilename: file.newFilename,
      filepath: file.filepath,
      mimetype: file.mimetype,
    })

    // Generate unique filename
    const originalName = file.originalFilename || file.newFilename || 'image'
    const ext = path.extname(originalName) || '.jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
    const filepath = path.join(uploadDir, filename)
    const oldPath = file.filepath

    if (!oldPath || !fs.existsSync(oldPath)) {
      console.error('Source file does not exist:', oldPath)
      return res.status(500).json({ error: 'Uploaded file not found' })
    }

    // Move file to final location
    try {
      fs.renameSync(oldPath, filepath)
      console.log('File moved successfully to:', filepath)
    } catch (moveError: any) {
      console.error('File move error:', moveError)
      // If rename fails, try copy and delete
      try {
        fs.copyFileSync(oldPath, filepath)
        fs.unlinkSync(oldPath)
        console.log('File copied successfully to:', filepath)
      } catch (copyError: any) {
        console.error('File copy error:', copyError)
        return res.status(500).json({ 
          error: 'Failed to save file',
          details: process.env.NODE_ENV === 'development' ? copyError.message : undefined
        })
      }
    }

    const url = `/uploads/${filename}`
    return res.status(200).json({ url })
  } catch (error: any) {
    console.error('Upload error:', error)
    return res.status(500).json({ 
      error: 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

