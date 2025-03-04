import React, { useEffect, useState } from 'react'
import { Hex } from 'viem'

import { CopyToClipboard } from '@/components/address/copy-to-clipboard'
import { MaybeLink } from '@/components/address/maybe-link'
import { usePumpClient } from '@/hooks/usePumpClient'

const addressFormatter = (address: Hex) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`

type AddressProps = {
  address: Hex
} & React.HTMLAttributes<HTMLDivElement>

export const Address: React.FC<AddressProps> = ({
  address,
  className,
  style,
  ...props
}) => {
  const { addressUrl } = usePumpClient()
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const newUrl = addressUrl(address) ?? null
    setUrl(newUrl)
  }, [address, addressUrl])

  return (
    <div
      className={className}
      {...props}
      style={{ display: 'flex', alignItems: 'center', ...style }}
    >
      <MaybeLink url={url}>{addressFormatter(address)}</MaybeLink>
      <CopyToClipboard text={address} style={{ marginLeft: '0.5rem' }} />
    </div>
  )
}
