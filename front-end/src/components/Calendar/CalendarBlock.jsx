import './Calendar.css';

export function CalendarBlock({ date, isToday = false, isSelected = false, onSelect }) {
    if (date === null) {
        {/* empty calendar cell*/}
        return <div className="calendar-empty" />;
    }

    const classes = [
        'calendar-block',
        isToday ? 'calendar-block--today' : '',
        isSelected ? 'calendar-block--selected' : '',
    ].join(' ');

    return (
        <button
            type="button"
            className={classes}
            onClick={onSelect}
            aria-pressed={isSelected}
        >
            <span className="calendar-block-day">
                {date}
            </span>
            {isToday && <span className="calendar-block-today-indicator"/>}
        </button>
    );
}
