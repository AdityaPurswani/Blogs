import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignIn() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        console.error('Sign in error:', result.error)
        toast.error(result.error === 'CredentialsSignin' ? 'Invalid email or password' : `Error: ${result.error}`)
      } else if (result?.ok) {
        toast.success('Signed in successfully!')
        router.push('/')
      } else {
        toast.error('Failed to sign in. Please try again.')
      }
    } catch (error: any) {
      console.error('Sign in exception:', error)
      toast.error(`Failed to sign in: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-purple-500/20">
          <h1 className="text-3xl font-bold text-gray-100 mb-6 text-center">Sign In</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 mb-4"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary-400 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  )
}

