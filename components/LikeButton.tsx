import { Heart } from 'lucide-react'

interface LikeButtonProps {
  isLiked: boolean
  likeCount: number
  onLike: () => void
  disabled?: boolean
}

export default function LikeButton({ isLiked, likeCount, onLike, disabled }: LikeButtonProps) {
  return (
    <button
      onClick={onLike}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        isLiked
          ? 'bg-red-900/50 text-red-300 hover:bg-red-800/50'
          : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
    </button>
  )
}

