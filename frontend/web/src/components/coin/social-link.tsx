import { ExternalLink, Globe, MessageCircle, Twitter } from 'lucide-react'
import React from 'react'

interface SocialLinkProps {
  href: string
  type: 'website' | 'telegram' | 'twitter'
  label: string
}

// Helper Components
const SocialLink: React.FC<SocialLinkProps> = ({ href, type, label }) => {
  const getIcon = () => {
    switch (type) {
      case 'website':
        return <Globe className="h-4 w-4" />
      case 'telegram':
        return <MessageCircle className="h-4 w-4" />
      case 'twitter':
        return <Twitter className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm 
                bg-gray-100 hover:bg-gray-200 transition-colors"
      title={label}
    >
      {getIcon()}
      <span>{label}</span>
    </a>
  )
}

export default SocialLink
