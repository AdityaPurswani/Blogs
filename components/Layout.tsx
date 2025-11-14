import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface LayoutProps {
  children: React.ReactNode
  session?: any
}

export default function Layout({ children, session: sessionProp }: LayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const currentSession = session || sessionProp

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-800">
      <nav className="bg-slate-800/80 backdrop-blur-md shadow-lg border-b border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-400">
              AdityaBlogHub
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-300 hover:text-primary-400 transition">
                Home
              </Link>
              <Link href="/chat" className="text-gray-300 hover:text-primary-400 transition">
                Chat
              </Link>
              {currentSession ? (
                <>
                  <Link href="/dashboard" className="text-gray-300 hover:text-primary-400 transition">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="bg-slate-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-slate-600 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="text-gray-300 hover:text-primary-400 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

