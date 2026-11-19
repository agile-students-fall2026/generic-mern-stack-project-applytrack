# ApplyTrack back-end

Express.js server for ApplyTrack. To install and run it, see [Building and Testing](../README.md#building-and-testing) in the main README.

```
app.js            the Express app: middleware, the static route, and which router handles which URL
server.js         starts app.js on the PORT from .env
data/
  *.json          starting mock data (users, applications, events)
  store.js        db: the mock data in memory, plus newId(), todayString(), resetStore()
middleware/
  errors.js       httpError(), notImplemented, and the handlers for 404s and errors
  requireAuth.js  runs before private routes: checks the login token and sets req.user
routes/           one router per area; each route lists its owner and issue number
public/           files served at /static, e.g. public/images/logo.svg -> /static/images/logo.svg
utils/
  auth.js         password hashing, login tokens (JWT), toPublicUser(), findUserByEmail()
  validation.js   isBlank(), isValidEmail(), isValidPassword()
test/             mocha + chai tests (*.test.js); setup.js resets the data before every test,
                  helpers.js has authHeader() for calling private routes
```

## Who builds which routes

Every route already exists in `routes/` and responds `501 isn't built yet`. Find yours by issue number, replace `notImplemented` with the real handler, and keep the URL and response the comment describes so the front-end works with it.

| File | Routes | Owner |
| --- | --- | --- |
| `routes/auth.js` | sign up, log in, log out, forgot and reset password | Kumneger (#6, #11, #58) |
| `routes/users.js` | your account: view, edit, change password, delete | Kumneger (#36) |
| `routes/users.js` | notification settings | Ryan (#75) |
| `routes/applications.js` | create, duplicate check, edit, delete | Bertin (#1, #17, #43, #46, #49, #54) |
| `routes/applications.js` | list and filter, details, archive, offer | Estifanos (#16, #18, #39, #63, #67) |
| `routes/applications.js` | interview rounds | Ryan (#15) |
| `routes/events.js` | upcoming events | Ryan (#74, #76) |
| `routes/statistics.js` | statistics | Ryan (#77) |
| `routes/export.js` | CSV and PDF export | Bertin (#78) |

Private routes need a login token: the front-end sends it automatically after you log in, and `requireAuth` responds 401 without it. Inside your route, `req.user` is the logged-in user. To try a private route with `curl` or Postman, log in first and send the token you get back:

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"alex.morgan@university.example","password":"password123"}'
curl http://localhost:3000/api/applications/app-1 -H "Authorization: Bearer <token from the first response>"
```

## Building a route, step by step

Example: `GET /api/applications/:id` in `routes/applications.js`.

**1. Write the handler.** The front-end's `src/api/mockApi.js` already has the logic for every route (the comment names the function), so most of the work is moving it here.

```js
import { db } from '../data/store.js'
import { httpError } from '../middleware/errors.js'

router.get('/:id', (req, res) => {
  const application = db.applications.find((item) => item.id === req.params.id)
  if (!application) throw httpError(404, 'Application not found')
  res.json(application)
})
```

- URL parts like `:id` are in `req.params`, query strings (`?status=offer`) in `req.query`, and the JSON body of a POST/PATCH in `req.body`.
- Respond with `res.json(...)`. Use `res.status(201).json(...)` when you create something.
- For bad input or a missing item, `throw httpError(status, message)`. The front-end shows the message to the user. Use 400 for invalid input, 404 for not found, and 409 for a conflict such as a duplicate.

**2. Try it.** With the server running (`npm run dev`), use Postman or `curl` with a login token (see "Who builds which routes" above for how to get one):

```bash
curl -X POST http://localhost:3000/api/applications -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"company":"Acme","position":"Intern"}'
```

**3. Connect the front-end.** Add the matching function to `front-end/src/api/httpApi.js`, with the same name as in `mockApi.js`:

```js
getApplication: (id) => request('GET', `/applications/${id}`),
```

The app now uses your route instead of the mock. Open the screen and check that it still works with both servers running.

**4. Test it.** Add a file in `test/`, e.g. `test/applications.test.js`, and copy the pattern from `test/app.test.js`:

```js
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

describe('GET /api/applications/:id', () => {
  it('returns the application', async () => {
    const res = await request.execute(app).get('/api/applications/app-1').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body.company).to.equal('Stripe')
  })

  it('responds 404 for an unknown id', async () => {
    const res = await request.execute(app).get('/api/applications/nope').set(authHeader())
    expect(res).to.have.status(404)
  })
})
```

Test both the success case and the error cases. Run `npm test`, then `npm run coverage` to see which lines your tests reach. Each of us needs tests that cover at least 10% of the back-end code.

## Rules

- Never commit `.env`. It holds settings and, later, passwords and keys. Add any new setting to `.env.example` with a placeholder value, and post real values in the team channel.
- Don't send passwords back in any response.
- Keep each change on a feature branch and open a pull request to `master`.
