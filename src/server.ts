import express from 'express'
import { botHandler } from './bot-handler'
import { ChildProcess } from 'child_process'
import s from "http-status-codes"

export async function startServer () {
  // Start the server
  const port = parseInt(process.env.PORT as any)

  return new Promise(res => {
    const server = app.listen(port, function () {
      res({
        close: async function () {
          server.close(err => err && console.error(err))
          // server.close(err => console.error(err))
        }
      })
    })
  })
}

const app = express()

app.set('etag', false)

app.use('/', express.json({
  limit:'20MB',
}))

// test/dev middleware
app.use('/', (req, res, next) => {
  console.debug(`${req.method} ${req.url}`)
  next()
})

// empty frontpage
app.get('/', (req, res) => {
  res.status(s.OK).json({status:'ok'})
})

let matrixProcess:ChildProcess = botHandler()

// sentry-webhook
app.post('/sentry-webhook', ((req, res) => {

  const json = req.body
  console.log('Stuff happened! Please see '+json.url)
  // console.log(json.data.event.web_url)

  try {
    matrixProcess.send({debug:json})

    switch (json.action) {
      case 'created':
        handleIssueCreated(json.data)
        break
      case 'resolved':
        handleIssueResolved(json.data)
        break
    }
  }
  catch (e) {
    console.error(e)
    return res.status(s.INTERNAL_SERVER_ERROR).end()
  }

  res.status(s.NO_CONTENT).end()
}))

function handleIssueCreated (issue:any) {
  if (matrixProcess?.killed) {
    console.warn('Problem: matrix client was dead')
  }
  else {
    const issueUrl:string = `https://sentry.io/organizations/${issue.project.slug}/issues/${issue.id}/?project=${issue.project.id}`
    matrixProcess.send({msg: `An issue was recorded! See ${issueUrl}`})
  }
}

function handleIssueResolved (issue:any) {
  if (matrixProcess?.killed)
    return console.warn('Problem: matrix client was dead')


  matrixProcess.send({msg: `${issue.id} was resolved`})
}

app.get('/send', (req, res) => {
  if (!matrixProcess || matrixProcess.killed) {
    return res.send('matrix ded')
  }
  matrixProcess.send({msg: req.query.msg}, err => err ?
    res.send(err) : res.end('pretty ok..'))
})

app.get('/close', (req, res) => {
  try {
    if (!matrixProcess?.killed) {
      matrixProcess?.kill()
    }
  }
  catch (e) {
    console.error(e)
  }
  res.end()
})