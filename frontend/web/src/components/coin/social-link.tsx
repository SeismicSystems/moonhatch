import { ExternalLink } from 'lucide-react'
import React from 'react'

import LanguageIcon from '@mui/icons-material/Language'
import TelegramIcon from '@mui/icons-material/Telegram'
import XIcon from '@mui/icons-material/X'

interface SocialLinkProps {
  href: string
  type: 'website' | 'telegram' | 'twitter'
}

// Helper Components
const SocialLink: React.FC<SocialLinkProps> = ({ href, type, label }) => {
  const getIcon = () => {
    switch (type) {
      case 'website':
        return <LanguageIcon className="h-4 w-4" />
      case 'telegram':
        return <TelegramIcon className="h-4 w-4" />
      case 'twitter':
        return <XIcon className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 px-2 py-1.5 rounded-full text-[var(--lightBlue)] text-sm 
                bg-[var(--midBlue)] hover:bg-gray-200 transition-colors"
      title={label}
    >
      {getIcon()}
    </a>
  )
}

export default SocialLink
