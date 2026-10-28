import { Link } from 'react-router-dom'
import { api } from '../../api'
import {
  ApplicationCard,
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  EventCard,
  LoadingState,
  Page,
  SectionHeader,
  StatCard,
} from '../../components'
import { useApi } from '../../hooks/useApi'
import { todayString } from '../../utils/format'
import './Home.css'

const NEXT_UP_COUNT = 3
const RECENT_COUNT = 2

// Everything the Home screen shows, loaded together.
async function loadHome() {
  const [user, stats, events, applications] = await Promise.all([
    api.getCurrentUser(),
    api.getStatistics(),
    api.getEvents(),
    api.getApplications(),
  ])
  return { user, stats, events, applications }
}

/**
 * Home screen: a summary of the user's recruiting.
 * Wireframe: ux-design/prototype/home.png
 */
export default function Home() {
  const { data, loading, error, reload } = useApi(loadHome, [])

  if (loading && !data) {
    return (
      <Page title="Home">
        <LoadingState />
      </Page>
    )
  }
  if (error) {
    return (
      <Page title="Home">
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  const { user, stats, events, applications } = data
  const firstName = user.fullName.split(' ')[0]
  const applicationsById = Object.fromEntries(applications.map((application) => [application.id, application]))

  // events come back soonest first; keep the ones from today onward
  const today = todayString()
  const nextUp = events.filter((event) => event.date >= today).slice(0, NEXT_UP_COUNT)
  const recent = [...applications]
    .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))
    .slice(0, RECENT_COUNT)

  return (
    <Page
      title={`Hi, ${firstName}`}
      subtitle="Here's your recruiting at a glance"
      action={
        <Link to="/profile" className="home__avatar-link" aria-label="Open profile">
          <Avatar src={user.avatarUrl} alt={user.fullName} shape="circle" size={44} />
        </Link>
      }
    >
      <div className="stat-grid">
        <StatCard value={stats.totalApplied} label="Total applied" />
        <StatCard value={stats.active} label="Active" />
        <StatCard value={stats.interviews} label="Interviews" />
      </div>

      <section className="home__section">
        <SectionHeader title="Next up" actionLabel="See all" actionTo="/upcoming" />
        {nextUp.length > 0 ? (
          <Card padding="none">
            {nextUp.map((event) => (
              <EventCard key={event.id} event={event} application={applicationsById[event.applicationId]} />
            ))}
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon="calendar"
              title="Nothing coming up"
              message="Deadlines, interviews and follow-ups you add will show up here."
              action={
                <Button variant="secondary" size="sm" to="/events/new">
                  Add event
                </Button>
              }
            />
          </Card>
        )}
      </section>

      <section className="home__section">
        <SectionHeader title="Recent applications" actionLabel="View all" actionTo="/applications" />
        {recent.length > 0 ? (
          recent.map((application) => <ApplicationCard key={application.id} application={application} />)
        ) : (
          <Card>
            <EmptyState
              icon="briefcase"
              title="No applications yet"
              message="Add your first application to start tracking it."
              action={
                <Button size="sm" icon="plus" to="/applications/new">
                  Add application
                </Button>
              }
            />
          </Card>
        )}
      </section>
    </Page>
  )
}
