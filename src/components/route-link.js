import { peek } from "@thi.ng/arrays"
import * as rs from "@thi.ng/rstream"
import * as xf from "@thi.ng/transducers"
import * as at from "@thi.ng/paths"
import { router } from "@thi.ng/router"
import { updateDOM } from "@thi.ng/transducers-hdom"
import { theme_styler } from "../styles"
import { PATH, EVENT } from "../constants"
/* pseudo/org

component behavior options:
- can .next() onto a stream (handler)
- can .deref() from a stream (state)

*/

export const route_link_x = (cfg, theme_path) => {
  cfg = { tag: "a", tag_noop: "span", ...cfg }

  const bhv = (event_stream, route_cmd) => ({
    onclick: e => {
      e.preventDefault()
      event_stream.next(route_cmd)
    }
  })

  const hash = theme_styler("a", null, theme_path)

  return (ctx, rt_id, rt_params, attrs, body) => {
    const attrs_base = {
      class: hash,
      ...bhv(ctx.event_stream, { [EVENT.ROUTE_TO]: rt_id, [EVENT.ROUTE_PARAMS]: rt_params })
    }
    return at.getIn(ctx.state_stream.deref(), PATH.ROUTE_ACTIVE) === rt_id
      ? [
          cfg.tag_noop, // STATE ( upstream = I )
          { class: hash, style: "text-decoration: underline;", ...attrs },
          body // STATE ( downstream = O )
        ]
      : typeof attrs !== "object"
      ? [cfg.tag, attrs_base, attrs, body]
      : [cfg.tag, { ...attrs_base, ...attrs }, body]
  }
}

export const route_link = route_link_x(null, "styles.a")
