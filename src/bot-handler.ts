import { fork } from 'child_process'

export function botHandler () {
  const subProcess = fork(__dirname + '/matrix-client.js',['--verbose'])

  subProcess.on('message', m => {
    console.log(m)
  })

  return subProcess
}
