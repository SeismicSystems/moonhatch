import { ExternalLink } from 'lucide-react'
import React from 'react'

import LanguageIcon from '@mui/icons-material/Language'
import TelegramIcon from '@mui/icons-material/Telegram'
import XIcon from '@mui/icons-material/X'

interface SocialLinkProps {
  href: string
  type: 'website' | 'telegram' | 'twitter'
  label: string
  onClick?: (e: React.MouseEvent) => void
}

// Helper Components
const SocialLink: React.FC<SocialLinkProps> = ({ href, type, label }) => {
  const getFormattedHref = () => {
    if (type === 'twitter') {
      return `https://twitter.com/${href.replace('@', '')}` // Remove @ and format link
    }
    if (type === 'telegram') {
      return `https://t.me/${href.replace('@', '')}`
    }
    if (type === 'website') {
      return href.startsWith('http://') || href.startsWith('https://')
        ? href
        : `https://${href}`
    }
    return href
  }

  const getIcon = () => {
    switch (type) {
      case 'website':
        return <LanguageIcon sx={{ fontSize: { xs: 30, sm: 34, md: 48 } }} />
      case 'telegram':
        return <TelegramIcon sx={{ fontSize: { xs: 30, sm: 34, md: 48 } }} />
      case 'twitter':
        return <XIcon sx={{ fontSize: { xs: 30, sm: 34, md: 48 } }} />
      default:
        return <ExternalLink style={{ fontSize: 24 }} /> // or you can apply similar sx if supported
    }
  }

  return (
    <a
      href={getFormattedHref()}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2  px-2 py-1.5 rounded-full text-[var(--lightBlue)] text-sm 
                bg-[var(--midBlue)] hover:bg-orange-300 transition-colors"
      title={label}
    >
      {getIcon()}
    </a>
  )
}

export default SocialLink
