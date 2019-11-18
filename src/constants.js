import { EVENT_ROUTE_CHANGED, EVENT_ROUTE_FAILED } from "@thi.ng/router"

export const EVENT = {
  X_FETCH_FOR: x => `fetch-for-${x}`,
  FETCH: "fetch",
  ROUTE_TO: "route-to",
  ROUTE_PARAMS: "route-params",
  ROUTE_TO_WITH: "route-to-with",
  ROUTE_TO_THEN: "route-to-then",
  ROUTE_CHANGED: EVENT_ROUTE_CHANGED,
  ROUTE_FAIL: EVENT_ROUTE_FAILED
}

export const PATH = {
  ROUTE_ACTIVE: "route.active",
  ROUTE_PAYLOAD: "route.payload",
  ROUTE_STATUS: "route.status",
  ROUTE_PREV: "route.prev",
  X_FETCH_STATUS: x => [x, "fetch", "status"],
  X_FETCH_PAYLOAD: x => [x, "fetch", "payload"]
}
export const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  FAIL: "failed",
  IDLE: "idle"
}
