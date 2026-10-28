import { Icon } from '../Icon/Icon'
import './SearchBar.css'

/**
 * A search input with a magnifying glass and a clear (x) button.
 * Filter your list as the user types by using `value` in a .filter().
 *
 * @example
 * const [query, setQuery] = useState('')
 * <SearchBar placeholder="Search company or position" value={query} onChange={setQuery} />
 */
export function SearchBar({ value, onChange, placeholder = 'Search', label = 'Search' }) {
  return (
    <div className="search-bar">
      <Icon name="search" size={18} className="search-bar__icon" />
      <input
        type="search"
        className="input search-bar__input"
        placeholder={placeholder}
        aria-label={label}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {value && (
        <button type="button" className="search-bar__clear" aria-label="Clear search" onClick={() => onChange?.('')}>
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  )
}
