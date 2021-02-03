require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
import { startServer } from './src/server'

startServer().then(()=> {
  if (process.env.GAE_APPLICATION) {
    // we're on google app engine
    console.debug('Server started! GAE_APPLICATION '+process.env.GAE_APPLICATION)
  }
  else {
    console.debug(`Server started! Listening on ${process.env.PORT}`)
  }
})
