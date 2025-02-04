import React from 'react'

const CoinImage: React.FC<{ src: string | null; name: string }> = ({
  src,
  name,
}) => (
  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
    {src ? (
      <img
        src={src}
        alt={`${name} logo`}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = '/api/placeholder/48/48'
        }}
      />
    ) : (
      <div className="text-gray-400 text-xl font-bold">{name.charAt(0)}</div>
    )}
  </div>
)

export default CoinImage
