import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendLikeNotification(
  blogTitle: string,
  blogSlug: string,
  likerName: string,
  authorEmail: string
) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: authorEmail,
      subject: `Someone liked your blog: ${blogTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9333ea;">New Like on Your Blog!</h2>
          <p>Hi there,</p>
          <p><strong>${likerName}</strong> just liked your blog post: <strong>"${blogTitle}"</strong></p>
          <p>
            <a href="${process.env.NEXTAUTH_URL}/blog/${blogSlug}" 
               style="background-color: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Blog Post
            </a>
          </p>
          <p>Keep up the great work!</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

