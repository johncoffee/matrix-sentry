import fetch from 'node-fetch'
import { ok, strictEqual } from 'assert'
import s from 'http-status-codes'
export const baseUrl = `http://localhost:${process.env.PORT}`

export async function postJSON(path:string, inputBody:any, userId = 'xyz') {
  // console.log('Sending')
  const json = JSON.stringify(inputBody, null, '\t')
  // console.log(json)
  const res = await fetch(baseUrl + path,{
    method: 'post',
    headers: {
      'Content-Type':'application/json',
      'x-token': userId,
    },
    body: json
  })

  ok(res.headers.get('Content-Type')?.startsWith('application/json'),  `Expected json back from POST ${path} - was ${res.headers.get('Content-Type')}. Status: ${res.status}`)
  const jsonRes = await res.json()
  return [jsonRes, res]
}

export async function getJSON(path:string, userId:string = '') {
  const res = await fetch(baseUrl + path,{
    method: 'get',
    headers: {
      'Content-Type':'application/json',
      'x-token': userId,
    },
  })

  ok(res.headers.get('Content-Type')?.startsWith('application/json'), `Expected json back from GET ${path} - was ${res.headers.get('Content-Type')}. Status: ${res.status}`)
  const jsonRes = await res.json()
  return [jsonRes, res]
}
