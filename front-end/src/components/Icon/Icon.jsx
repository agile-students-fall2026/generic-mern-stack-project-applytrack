/*
 * Simple line icons drawn as inline SVG. They use `currentColor`, so they automatically
 * match the text color of whatever they're inside (and switch with the theme).
 *
 * Usage: <Icon name="plus" />   <Icon name="calendar" size={18} />
 * To add a new icon, add it to icons.jsx.
 */

import { ICONS } from './icons'

export function Icon({ name, size = 20, strokeWidth = 2, className = '', label }) {
  const shape = ICONS[name]
  if (!shape) {
    console.warn(`<Icon>: unknown icon "${name}"`)
    return null
  }
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {shape}
    </svg>
  )
}
