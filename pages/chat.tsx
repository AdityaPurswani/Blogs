import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Layout from '@/components/Layout'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import io, { Socket } from 'socket.io-client'

interface Message {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

export default function Chat() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
    })

    newSocket.on('newMessage', (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage])
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat')
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please sign in to chat')
      return
    }

    if (!message.trim()) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages([...messages, data.message])
        setMessage('')
        if (socket) {
          socket.emit('newMessage', data.message)
        }
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <Layout>Loading...</Layout>
  }

  return (
    <Layout session={session}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg flex flex-col border border-purple-500/20" style={{ height: '600px' }}>
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-gray-100">Chat Room</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.author.id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.author.id === session?.user?.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-700 text-gray-200'
                    }`}
                  >
                    <div className="text-xs opacity-75 mb-1">
                      {msg.author.name || 'Anonymous'}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {format(new Date(msg.createdAt), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {session ? (
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-slate-700/50 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 border-t border-gray-700 text-center text-gray-400">
              Please sign in to participate in the chat
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

