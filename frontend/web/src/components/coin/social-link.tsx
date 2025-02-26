import { ExternalLink } from 'lucide-react'
import React from 'react'
import LanguageIcon from '@mui/icons-material/Language'
import TelegramIcon from '@mui/icons-material/Telegram'
import XIcon from '@mui/icons-material/X'

interface SocialLinkProps {
  href: string
  type: 'website' | 'telegram' | 'twitter'
  label: string
  // Accept responsive icon sizes via the sx prop format
  iconSize?: { xs?: number; sm?: number; md?: number; lg?: number }
}

const SocialLink: React.FC<SocialLinkProps> = ({
  href,
  type,
  label,
  iconSize,
}) => {
  const getFormattedHref = () => {
    if (type === 'twitter') {
      return `https://twitter.com/${href.replace('@', '')}`
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

  // Fallback default sizes if none are provided
  const defaultIconSize = { xs: 16, sm: 20, md: 24, lg: 28 }
  const resolvedIconSize = iconSize || defaultIconSize

  const getIcon = () => {
    switch (type) {
      case 'website':
        return <LanguageIcon sx={{ fontSize: resolvedIconSize }} />
      case 'telegram':
        return <TelegramIcon sx={{ fontSize: resolvedIconSize }} />
      case 'twitter':
        return <XIcon sx={{ fontSize: resolvedIconSize }} />
      default:
        return <ExternalLink style={{ fontSize: resolvedIconSize.md || 24 }} />
    }
  }

  return (
    <a
      href={getFormattedHref()}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 px-2 py-1.5 rounded-full text-[var(--lightBlue)] text-sm bg-[var(--midBlue)] hover:bg-orange-300 transition-colors"
      title={label}
    >
      {getIcon()}
    </a>
  )
}

export default SocialLink
