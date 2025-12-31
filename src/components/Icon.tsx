import React from 'react'
import Image from 'next/image'

export const Icon = () => {
  return (
    <div className="icon">
      <Image
        src="/hkrion-logo-v2.svg"
        alt="HKRiON Icon"
        width={32}
        height={32}
        className="max-w-[32px] w-auto h-auto"
      />
    </div>
  )
}
