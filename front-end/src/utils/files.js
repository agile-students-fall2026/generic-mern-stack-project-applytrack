/*
 * Browser file helpers: downloading a generated file and shrinking a chosen photo.
 */

/** Save `content` (a string or Blob) as a file on the user's device. */
export function downloadFile(content, fileName, mimeType = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  // give the browser a moment to start the download before freeing the memory
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Read an image file, crop it to a centered square and shrink it, returning a small JPEG data URL.
 * Used for profile photos so they stay small enough to store.
 */
export function resizeImageFile(file, size = 256) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Choose an image file'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Couldn't read that file"))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error("Couldn't open that image"))
      image.onload = () => {
        const side = Math.min(image.width, image.height)
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        canvas
          .getContext('2d')
          .drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
