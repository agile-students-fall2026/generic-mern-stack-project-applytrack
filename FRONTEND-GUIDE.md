# Front-End Guide

Everything you need to build your screens for Sprint 1. The setup (theme, components, routes, mock data) is done. You only build the content of your own pages.

## 1. Run the app

You need **Node.js 20.19 or newer** (`node -v` to check). With nvm: `nvm use` inside `front-end/` picks the right version.

```bash
cd front-end
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173). Then:

- **http://localhost:5173/dev/components** shows every shared component, live, in both themes. Start here.
- The Welcome page has shortcuts into the app until the login screens are built.

Before opening a pull request, run `npm run lint` and fix anything it reports.

## 2. Find your files

Every screen already has a file with a "Not built yet" placeholder that names its owner. **Delete the `<PagePlaceholder>` and build your screen in its place.** The route and the back button already work.

**Finished examples to copy from:** `home/Home.jsx` (loading several things at once, lists, empty states) and `profile/NotificationSettings.jsx` (a form that loads, saves and shows a success pop-up).

| Owner | Screen | File (in `front-end/src/pages/`) | URL |
| --- | --- | --- | --- |
| Kumneger | Welcome | `auth/Welcome.jsx` | `/` |
| Kumneger | Sign Up | `auth/SignUp.jsx` | `/signup` |
| Kumneger | Log In | `auth/LogIn.jsx` | `/login` |
| Kumneger | Forgot / Reset Password | `auth/ForgotPassword.jsx`, `auth/ResetPassword.jsx` | `/forgot-password`, `/reset-password` |
| Kumneger | Profile | `profile/Profile.jsx` | `/profile` |
| Kumneger | Edit Account | `profile/EditAccount.jsx` | `/profile/edit` |
| Kumneger | Export Data | `profile/ExportData.jsx` | `/profile/export` |
| Bertin | Add Application | `applications/AddApplication.jsx` | `/applications/new` |
| Bertin | Edit Application | `applications/EditApplication.jsx` | `/applications/:id/edit` |
| Estifanos | Dashboard | `applications/Dashboard.jsx` | `/applications` |
| Estifanos | Application Details | `applications/ApplicationDetails.jsx` | `/applications/:id` |
| Estifanos | Archive | `applications/Archive.jsx` | `/archive` |
| Estifanos | Offer Details | `applications/OfferDetails.jsx` | `/applications/:id/offer` |
| Ryan | Upcoming | `events/Upcoming.jsx` | `/upcoming` |
| Ryan | Add / Edit Event | `events/AddEvent.jsx`, `events/EditEvent.jsx` | `/events/new`, `/events/:id/edit` |
| Ryan | Interview Round | `applications/InterviewRound.jsx` | `/applications/:id/rounds/new`, `/applications/:id/rounds/:roundId` |
| Ryan | Statistics | `stats/Statistics.jsx` | `/stats` |
| Kumneger (done) | Home | `home/Home.jsx` | `/home` |
| Kumneger (done) | Notification Settings | `profile/NotificationSettings.jsx` | `/profile/notifications` |

Pop-ups (delete confirmations, "saved" messages, update status, sort) are **not** separate pages. Build them inside the page that opens them, using the dialog components below. The wireframe for each one is in `ux-design/prototype/`.

**Shared files:** Bertin's delete confirmation (#46) lives on Estifanos's Application Details page. Agree on who edits that file and when, to avoid merge conflicts.

## 3. Build a page

Every page follows the same pattern: get data from `api`, show it with the shared components.

```jsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import { Button, ErrorState, FormSection, LoadingState, Page, SuccessDialog, TextField } from '../../components'
import { useApi } from '../../hooks/useApi'

export default function EditApplication() {
  const { id } = useParams() // the :id from the URL
  const navigate = useNavigate()
  const { data: application, setData, loading, error, reload } = useApi(() => api.getApplication(id), [id])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (loading) return <Page title="Edit Application" back><LoadingState /></Page>
  if (error) return <Page title="Edit Application" back><ErrorState message={error.message} onRetry={reload} /></Page>

  async function save() {
    setSaving(true)
    await api.updateApplication(id, application)
    setSaving(false)
    setSaved(true)
  }

  return (
    <Page title="Edit Application" back footer={<Button fullWidth loading={saving} onClick={save}>Save changes</Button>}>
      <FormSection title="Job">
        <TextField
          label="Company"
          required
          value={application.company}
          onChange={(company) => setData({ ...application, company })}
        />
      </FormSection>

      <SuccessDialog open={saved} title="Changes saved" onDone={() => navigate(`/applications/${id}`)} />
    </Page>
  )
}
```

## 4. Shared components

Import everything from one place: `import { Button, Page, TextField } from '../../components'`. Each component file has a comment at the top explaining its props, with an example.

| Need | Use |
| --- | --- |
| Page layout, header, back arrow, fixed bottom button | `Page` (`title`, `back`, `action`, `footer`) |
| Buttons | `Button` (primary / secondary / ghost / danger, `to` for links), `IconButton` (the "+" button) |
| Logo | `Logo` (`height`, `wordmark`); black in light theme, white in dark |
| Form inputs | `TextField` (also date, time, email, password), `TextArea`, `SelectField`, `SegmentedControl`, `Switch`, `RadioGroup`, `FileUpload` |
| Group of form fields with a label ("JOB") | `FormSection` |
| Two fields side by side | wrap them in `<div className="field-row">` |
| Search box and status chips | `SearchBar`, `FilterChips` |
| Content boxes and rows | `Card`, `ListRow`, `SectionHeader` ("NEXT UP · See all") |
| Application in a list | `ApplicationCard` |
| Event in a list | `EventCard` (put several inside `<Card padding="none">`) |
| Status pill | `StatusBadge` |
| Big numbers | `StatCard` inside `<div className="stat-grid">` |
| Logos and photos | `Avatar` (shows a gray placeholder if the image is missing) |
| "Are you sure?" | `ConfirmDialog` |
| "✓ Saved" | `SuccessDialog` |
| Pick one option (Update status, Sort by) | `OptionSheet` |
| Custom pop-up (e.g. duplicate warning) | `Modal` |
| Loading / failed / nothing to show | `LoadingState`, `ErrorState`, `EmptyState` |
| Light/dark switch | `ThemeToggle` (icon) or `<ThemeToggle variant="switch" />` |
| Icons | `<Icon name="calendar" />`; all names are shown on `/dev/components` |

**Need something that isn't here?** If more than one screen needs it, add it to `src/components/` (with a comment and an export in `components/index.js`) and tell the team. If only your screen needs it, keep it next to your page.

## 5. Data (no hard-coded data!)

The course requires that **no data that will come from the back-end is written directly in our code**. So:

- Get all data through `api` (`src/api/mockApi.js`). Every function has a comment explaining it.
- The mock data lives in `front-end/public/mock-data/*.json`. Edit those files if you need more examples.
- Changes (add, edit, delete) work while the app is open and reset when you reload. That's expected for Sprint 1.
- Use the lists in `src/constants/index.js` (statuses, job types, event types, sort options...) for dropdowns and labels. Don't type them by hand.
- Use `src/utils/format.js` to show dates and times (`formatDate`, `formatTime`...).

Main api functions:

| Area | Functions |
| --- | --- |
| Applications | `getApplications()`, `getApplication(id)`, `createApplication(fields)`, `updateApplication(id, changes)`, `deleteApplication(id)`, `findDuplicateApplication({ company, position })` |
| Archive | `getArchivedApplications()`, `archiveApplication(id)`, `unarchiveApplication(id)` |
| Offer and interviews | `saveOffer(id, offer)`, `addInterviewRound(id, round)`, `updateInterviewRound(id, roundId, changes)`, `deleteInterviewRound(id, roundId)` |
| Events | `getEvents()`, `getEvents({ applicationId })`, `getEvent(id)`, `createEvent(fields)`, `updateEvent(id, changes)`, `deleteEvent(id)` |
| Stats and export | `getStatistics()`, `exportApplications({ format, includeArchived })` |
| Account | `getCurrentUser()`, `updateCurrentUser(changes)`, `deleteAccount()`, `getNotificationSettings()`, `updateNotificationSettings(changes)` |
| Auth | use `useAuth()`: `logIn()`, `signUp()`, `logOut()`; plus `api.requestPasswordReset()`, `api.resetPassword()` |

Look at `public/mock-data/applications.json` to see every field an application has (company, status, recruiters, resume, interviewRounds, offer...).

## 6. Styling rules

- The app is **black and white**. Colors, font sizes, spacing and corner radius are CSS variables in `src/styles/theme.css`. **Always use the variables** (`color: var(--color-text-muted)`, `padding: var(--space-4)`), never raw values like `#666` or `13px`. That's what makes dark mode work automatically.
- Check your screen in **both themes** (moon/sun button on `/dev/components` or Profile).
- Page-specific CSS goes in a file next to your page (e.g. `pages/applications/Dashboard.css`), with class names starting with the page name (`.dashboard__list`) so they don't clash.
- The only color besides gray is `--color-danger` (red), used for errors and destructive actions.
- Build for a phone screen first. The app stays phone-width on a computer.

## 7. Sprint 1 rules (from the course instructions)

- Function components and JSX only. No class components.
- **Not allowed:** Redux, MobX, Material UI, Bootstrap, Next.js. Ask the team before adding any npm package.
- Every button and interaction must do something visible, even with mock data (search filters as you type, sort changes the order, save shows the success pop-up...).
- Screens should match the Figma prototype. If you change something on purpose, tell the team so we can explain it in the demo.
- Never commit `.env` files or passwords.

## 8. Git workflow

The main branch is **`master`**. Never commit directly to it.

```bash
git checkout master && git pull origin master
git checkout -b feature/<issue-number>-<short-name>      # e.g. feature/1-add-application-form
# ...work, then commit small steps with single-line messages...
git commit -m "Add company and position fields to the add application form"
git push -u origin feature/<issue-number>-<short-name>
```

Then open a pull request into `master`, link the issue, and ask a teammate to review. Don't merge your own PR. Your own commits count toward your grade, so commit your own work from your own account.
