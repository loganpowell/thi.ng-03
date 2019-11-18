import * as rs from "@thi.ng/rstream"
import * as xf from "@thi.ng/transducers"
import * as pa from "thi.ng/paths"
import { updateDOM } from "@thi.ng/transducers-hdom"

import { EVENT, PATH } from "./constants"
import node_fetch from "node-fetch"

EVENT
const fetch = window.fetch || node_fetch

const state_stream = rs.stream()

export const pubsub = rs.pubsub({
  // topic = test decides what the topic is
  topic: x => Object.keys(x)[0],
  id: "pubsub"
})

// dynamic pubsub subscription (ad-hoc attachment)
// simple sub (input)
const ex_pubsub_basic = pubsub.subscribeTopic(
  EVENT.X_FETCH_FOR("test"),
  rs.trace("ex_pubsub_basic"),
  "bloop"
)

pubsub.next({ [EVENT.X_FETCH_FOR("test")]: "noop" })
//=> ex_pubsub_basic { fetch: 'noop' }

const json_fetch = x =>
  fetch(x)
    .then(r => r.json())
    .catch(e => `error for _fetch opts: ${x} = ${e.message}`)

// 📌 TODO: connect to sidechain (instead of rs.trace())
const sub_json_fetch = ({ [EVENT.X_FETCH_FOR("test")]: X }) =>
  rs.fromPromise(
    json_fetch(X).subscribe(
      xf.map(xs => pa.setIn(state_stream, PATH.X_FETCH_PAYLOAD("test"), xs), rs.trace("BLOOP:"))
    )
  )

// dispatch to another stream based on topic (output)
pubsub.subscribeTopic(EVENT.X_FETCH_FOR("test"), xf.map(sub_json_fetch))

const pub_URL = "https://jsonplaceholder.typicode.com/users/1"
pubsub.next({ [EVENT.X_FETCH_FOR("test")]: pub_URL })
/* trace logs:
sub_json_fetch: error for _fetch opts: noop = Only absolute URLs are supported 

sub_json_fetch: done 

sub_json_fetch: { id: 1, 
  name: 'Leanne Graham', 
  username: 'Bret', 
  email: 'Sincere@april.biz', 
  address:  
   { street: 'Kulas Light', 
     suite: 'Apt. 556', 
     city: 'Gwenborough', 
     zipcode: '92998-3874', 
     geo: { lat: '-37.3159', lng: '81.1496' } }, 
  phone: '1-770-736-8031 x56442', 
  website: 'hildegard.org', 
  company:  
   { name: 'Romaguera-Crona', 
     catchPhrase: 'Multi-layered client-server neural-net', 
     bs: 'harness real-time e-markets' } } 
 
sub_json_fetch: done 
*/
// latest values are deref()able
ex_pubsub_basic.deref()
//=> { _fetch: 'https://jsonplaceholder.typicode.com/users/1' }

export const start = (root, stream, ctx) => {
  return stream
    .subscribe(rs.sidechainPartition(rs.fromRAF()))
    .transform(xf.map(xf.peek), updateDOM({ root, ctx })) // 📌 inject FLIP animation transducer
}
// start app_stream & DOM updates
start(document.getElementById("app"), state_stream(ctx), ctx) //?
