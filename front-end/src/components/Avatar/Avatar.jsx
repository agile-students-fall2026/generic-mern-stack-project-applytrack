import { useState } from 'react'
import { Icon } from '../Icon/Icon'
import './Avatar.css'

/**
 * A square or round image (company logo, user photo). If the image is missing or fails to load,
 * it shows a gray placeholder instead.
 *
 * Images come from the data (e.g. application.logoUrl, user.avatarUrl), which uses Picsum for now.
 *
 * @param src    image URL
 * @param alt    description, e.g. "Stripe logo"
 * @param size   width/height in pixels (default 48)
 * @param shape  "square" (default, for logos) | "circle" (for people)
 *
 * @example
 * <Avatar src={application.logoUrl} alt={`${application.company} logo`} />
 * <Avatar src={user.avatarUrl} alt={user.fullName} shape="circle" size={88} />
 */
export function Avatar({ src, alt = '', size = 48, shape = 'square' }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = src && failedSrc !== src

  return (
    <span className={`avatar avatar--${shape}`} style={{ width: size, height: size }}>
      {showImage ? (
        <img src={src} alt={alt} width={size} height={size} loading="lazy" onError={() => setFailedSrc(src)} />
      ) : (
        <Icon name={shape === 'circle' ? 'user' : 'image'} size={Math.round(size * 0.45)} label={alt || undefined} />
      )}
    </span>
  )
}
