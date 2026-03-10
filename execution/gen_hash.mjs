import { createHash, randomBytes } from 'crypto'

// Simple function to generate bcrypt hash using Node.js built-in
// We'll use a workaround since bcryptjs may not be installed
// Instead, let's print the hash we need to use

// The GoTrue bcrypt hash format requires cost 10
// Let's install bcryptjs and use it
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

let bcrypt
try {
    bcrypt = require('bcryptjs')
} catch {
    console.log('bcryptjs not found, trying bcrypt...')
    try {
        bcrypt = require('bcrypt')
    } catch {
        console.error('Neither bcryptjs nor bcrypt found. Installing bcryptjs...')
        process.exit(1)
    }
}

const password = 'Admin123!'
const saltRounds = 10
const hash = bcrypt.hashSync(password, saltRounds)
console.log('Password hash:', hash)
