import { ChildProcess, fork } from 'child_process'

export function botHandler ():Promise<ChildProcess> {
  const subProcess = fork(__dirname + '/matrix-client.js',['--verbose'])

  return new Promise (res => {
    subProcess.on('message', m => {
      if (m === "initialized") {
        res(subProcess)
        return
      }
      console.log(m)
    })

  })
}
