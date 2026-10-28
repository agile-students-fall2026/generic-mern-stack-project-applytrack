import './FilterChips.css'

/**
 * A horizontally scrolling row of chips where one is selected, e.g. All / Applied / OA / Interview / Offer.
 *
 * @param options   list of { value, label }
 * @param value     selected value
 * @param onChange  called with the newly selected value
 *
 * @example
 * const options = [{ value: 'all', label: 'All' }, ...APPLICATION_STATUSES.map(s => ({ value: s.value, label: s.shortLabel }))]
 * <FilterChips options={options} value={filter} onChange={setFilter} />
 */
export function FilterChips({ options, value, onChange, label = 'Filter' }) {
  return (
    <div className="filter-chips" role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`filter-chips__chip ${selected ? 'filter-chips__chip--selected' : ''}`}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
