// Starts the server. All the routes and settings live in app.js; this file only listens on a port.
// Kept separate so the tests can use app.js without starting a real server.
import 'dotenv/config' // loads the settings in .env into process.env
import app from './app.js'

// The port to listen on: from the command line (npm run dev -- 4000), then .env (PORT=4000), then 3000
const PORT = process.argv[2] || process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`ApplyTrack back-end running at http://localhost:${PORT}`)
})
