import { peek } from "@thi.ng/arrays"
import * as rs from "@thi.ng/rstream"
import * as xf from "@thi.ng/transducers"
import { updateDOM } from "@thi.ng/transducers-hdom"

const clickButton = (_, sub) => [
  "button",
  { onclick: () => sub.next(true) }, // STATE ( upstream = I )
  sub.deref() // STATE ( downstream = O )
]

const resetButton = (_, streams) => [
  "button",
  { onclick: () => streams.forEach(sub => sub.next(false)) },
  "reset"
]

const stream = (start, step) => {
  const sub = rs.subscription(
    undefined,
    xf.scan(
      xf.reducer(
        () => start,
        (x, y) => (y ? x + step : start)
      )
    )
  )
  sub.next(false)
  return sub
}

const stream_sub1 = stream(0, 1)
const stream_sub2 = stream(10, 10)

const hdom_stream = [
  stream_sub1.transform(xf.map(() => [clickButton, stream_sub1])),
  stream_sub2.transform(xf.map(() => [clickButton, stream_sub2]))
]

const app_stream = ctx =>
  rs.sync({
    src: hdom_stream, // <- STATE ( downstream = O )
    xform: xf.map(
      // build the app_stream's actual root component
      hdom_stream => ["div", ...xf.vals(hdom_stream), [resetButton, [stream_sub1, stream_sub2]]]
    ),
    reset: false
  })

const ctx = {
  /*📌 IOE streams */
}

const state_buffer = (root, stream, ctx) =>
  stream
    .subscribe(rs.sidechainPartition(rs.fromRAF()))
    .transform(xf.map(peek), updateDOM({ root, ctx })) // 📌 inject FLIP animation transducer
// start app_stream & DOM updates
state_buffer(document.getElementById("app"), app_stream(ctx), ctx) //?

// TODO: start with routing events (Macro events) 📌
/* Pseudo:

bottom-up approach:

component -> 

*/
