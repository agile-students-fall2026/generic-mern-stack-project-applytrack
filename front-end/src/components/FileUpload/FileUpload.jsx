import { useId, useRef } from 'react'
import { Icon } from '../Icon/Icon'
import './FileUpload.css'

/**
 * Pick a file (e.g. the resume used for an application).
 * Shows a dashed "Upload" box when empty, and the file name with a "Change" button once chosen.
 * Files aren't actually uploaded yet; you get the file name to save with the mock api.
 *
 * @param fileName  the currently selected file's name (or empty)
 * @param onChange  called with the chosen File object (use file.name)
 * @param accept    allowed file types, default PDF only
 *
 * @example
 * <FileUpload label="Upload resume (PDF)" fileName={resume?.fileName}
 *   onChange={(file) => setResume({ fileName: file.name, uploadedAt: todayString() })} />
 */
export function FileUpload({ label = 'Upload file', fileName, onChange, accept = 'application/pdf' }) {
  const inputRef = useRef(null)
  const id = useId()

  function handleChange(event) {
    const file = event.target.files?.[0]
    if (file) onChange?.(file)
    event.target.value = '' // allow choosing the same file again
  }

  return (
    <div className="file-upload">
      <input ref={inputRef} id={id} type="file" accept={accept} className="visually-hidden" onChange={handleChange} />
      {fileName ? (
        <div className="file-upload__selected">
          <Icon name="file" size={20} />
          <span className="file-upload__name">{fileName}</span>
          <button type="button" className="file-upload__change" onClick={() => inputRef.current?.click()}>
            Change
          </button>
        </div>
      ) : (
        <label htmlFor={id} className="file-upload__empty">
          <Icon name="upload" size={20} />
          <span>{label}</span>
        </label>
      )}
    </div>
  )
}
