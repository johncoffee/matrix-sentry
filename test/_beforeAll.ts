import { startServer } from '../src/server'

// console.log('Globals loaded')

let handle: any
before(async function () {
  this.timeout(5 * 1000)
  // add fixtures

  //console.log('before-all did its things')
  if (process.env.SKIP_SERVER) return
  handle = await startServer()
})

after(async function () {
  // console.log('after-all ')
  try {
    if (handle) {
      await handle.close()
    }
    // await disconnect()
  } catch (e) {
    console.log('Problems during teardown of Mocha in "after all" hook')
    console.log(e)
  }
})
