// To run:
// npm install
// node app.js

// Import the requirements
const express = require('express')
const bodyParser = require('body-parser')
const { Pool, Client } = require('pg')

//
// CONFIGURATION
//
// The configuration paramater can be set directly in the code by changing the string values
// or they can be set as environment variables.
// E.g., on Mac OSX or Linux, use 'export CRDB_USERNAME=app' to set it as an environment variable
//

// Must be changed
const username = process.env.CRDB_USERNAME  || 'app' // database username
const password = process.env.CRDB_PASSWORD  || 'password' // database password
const certpath = process.env.CRDB_CERTPATH  || '/Users/jonstjohn/.postgresql/root.crt' // path to root certificate
const cluster  = process.env.CRDB_CLUSTER   || 'sweet-donkey-123' // cluster name with the number identifier

// Might need to be changed
const database = process.env.CRDB_DATABASE  || 'defaultdb' // database
const host     = process.env.CRDB_HOST      || 'free-tier.gcp-us-central1.cockroachlabs.cloud' // cluster host

//
// BUILD CONNECTION STRING AND CONNECT
//
// Create the connection string
const connectionString = 'postgresql://' + // use the postgresql wire protocol
    username +                       // username
    ':' +                            // separator between username and password
    password +                       // password
    '@' +                            // separator between username/password and port
    host +                           // host
    ':' +                            // separator between host and port
    '26257' +                        // port, CockroachDB Serverless always uses 26257
    '/' +                            // separator between port and database
    database +                       // database
    '?' +                            // separator for url parameters
    'sslmode=verify-full' +          // always use verify-full for CockroachDB Serverless
    '&' +                            // url parameter separator
    'sslrootcert=' + certpath +      // full path to ca certificate 
    '&' +                            // url parameter separator
    'options=--cluster%3D' + cluster // cluster name is passed via the options url parameter



const pool = new Pool({
  connectionString,
})

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

const getVersion = (request, response) => {
  pool.query('SELECT version()', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

app.get('/', getVersion)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
