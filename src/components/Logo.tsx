import React from 'react'
import Image from 'next/image'

export const Logo = () => {
  return (
    <div className="logo">
      <Image
        src="/hkrion-logo-v2.svg"
        alt="HKRiON Logo"
        width={150}
        height={50}
        className="max-w-[150px] w-auto h-auto"
      />
    </div>
  )
}
