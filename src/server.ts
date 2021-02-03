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

let matrixProcess:ChildProcess

botHandler()
  .then(p => matrixProcess = p)
  .catch(e => console.error(e))

// sentry-webhook
app.post('/sentry-webhook', ((req, res) => {

  const json = req.body

  try {
    matrixProcess.send({debug:json})

    switch (json.action) {
      case 'created':
        handleIssueCreated(json.data.issue)
        break
      case 'resolved':
        handleIssueResolved(json.data.issue)
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
  if (!matrixProcess) {
    return res.status(s.SERVICE_UNAVAILABLE).send('matrix not initialized - try again')
  }
  if (matrixProcess.killed) {
    return res.status(s.INTERNAL_SERVER_ERROR).send('matrix ded')
  }
  matrixProcess.send({msg: req.query.msg}, err => (err) ?
    res.status(s.INTERNAL_SERVER_ERROR).send(err) :
    res.end('pretty ok..'))
})

app.get('/restart-matrix', (req, res) => {
  try {
    botHandler()
      .then(p => matrixProcess = p)
      .catch(e => console.error(e))
  }
  catch(e) {
    return res.status(500).send(e)
  }

  res.end("Restarting matrix")
})

app.get('/_ah/stop', (req, res) => {
  try {
    if (!matrixProcess?.killed) {
      matrixProcess?.kill()
    }
  }
  catch (e) {
    console.error(e)
  }

  res.status(s.NO_CONTENT).end()
})