import { AutojoinRoomsMixin, MatrixClient, SimpleFsStorageProvider, } from 'matrix-bot-sdk'
// minimal parsing of args
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

spawnClient(argv.verbose)

export function spawnClient (verbose:boolean = false) {
  const logger = (str:string) => verbose && process.send && process.send(str)
  logger("Spawning matrix bot process...")
  // where you would point a client to talk to a homeserver
  const homeserverUrl = 'https://matrix.org'

// see https://t2bot.io/docs/access_tokens
  const accessToken = process.env.MATRIX_ACCESS_TOKEN as string

// We'll want to make sure the bot doesn't have to do an initial sync every
// time it restarts, so we need to prepare a storage provider. Here we use
// a simple JSON database.
  const storage = new SimpleFsStorageProvider('/tmp/__hello-bot.json')

// Now we can create the client and set it up to automatically join rooms.
  const client = new MatrixClient(homeserverUrl, accessToken, storage)
  AutojoinRoomsMixin.setupOnClient(client)

  const rooms: string[] = []
  client.start().then(async () => {

    rooms.push(...await client.getJoinedRooms())

    if (verbose) {
      rooms.forEach((roomId, i, arr) => {
        client.sendNotice(roomId, 'Client started, rooms joined: ' + arr.join(', '))
      })
    }

    process.on('message', (m) => {
      rooms.forEach(roomId => {
        if (m.debug)
          client.sendHtmlText(roomId, `<pre>${JSON.stringify(m.debug, null, '  ')}</pre>`)

        if (m.msg)
          client.sendText(roomId, m.msg)
      })
    })
  })
}
