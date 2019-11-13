import { peek } from "@thi.ng/arrays";
import { fromRAF, sidechainPartition, subscription, sync } from "@thi.ng/rstream";
import { map, reducer, scan, vals } from "@thi.ng/transducers";
import { updateDOM } from "@thi.ng/transducers-hdom";
// example user context object
// here only used to provide style / theme config using
// Tachyons CSS classes
const ctx = {
  ui: {
    root: {
      class: "pa2"
    },
    button: {
      class: "w4 h2 bg-black white bn br2 mr2 pointer"
    }
  }
};
/**
 * Takes a `root` DOM element, a stream of `tree` component values and
 * an (optional) arbitrary user context object which will be implicitly
 * passed to all component functions embedded in the root component.
 * Subscribes to `root` stream & performs DOM diffs / updates using
 * incoming values (i.e. UI components). Additionally, a RAF side chain
 * stream is used here to synchronize DOM update requests to be only
 * processed during RAF. If multiple updates are triggered per frame,
 * this also ensures that the DOM is only updated once per frame.
 *
 * Without RAF synchronization, the following would be sufficient:
 *
 * ```
 * root.transform(updateDOM({root, ctx}))
 * ```
 *
 * Returns stream of hdom trees.
 *
 * @param root root DOM element
 * @param tree hdom component stream
 * @param ctx user context object
 */
const domUpdate = (root, tree, ctx) =>
  tree.subscribe(sidechainPartition(fromRAF())).transform(map(peek), updateDOM({ root, ctx }));
/**
 * Generic button component.
 *
 * @param ctx hdom user context
 * @param onclick event handler
 * @param body button body
 */
const button = (ctx, onclick, body) => [
  "button",
  Object.assign(Object.assign({}, ctx.ui.button), { onclick }),
  body
];
/**
 * Specialized button component for counters.
 *
 * @param _ hdom user context (unused)
 * @param stream counter stream
 */
const clickButton = (_, stream) => [button, () => stream.next(true), stream.deref()];
/**
 * Specialized button to reset all counters.
 *
 * @param _ hdom user context (unused)
 * @param counters streams to reset
 */
const resetButton = (_, counters) => [button, () => counters.forEach(c => c.next(false)), "reset"];
/**
 * Creates a stream of counter values. Each time `true` is written to
 * the stream, the counter increases by given step value. If false is
 * written, the counter resets to the `start` value.
 *
 * @param start
 * @param step
 */
const counter = (start, step) => {
  const s = subscription(
    undefined,
    // the `scan` transducer is used to provide counter functionality
    // see: https://github.com/thi-ng/umbrella/blob/master/packages/transducers/src/xform/scan.ts
    scan(reducer(() => start, (x, y) => (y ? x + step : start)))
  );
  s.next(false);
  return s;
};
/**
 * Root component stream factory. Accepts array of initial counter
 * values and their step values, creates streams for each and returns a
 * StreamSync instance, which merges and converts these streams into a
 * single component.
 *
 * @param initial initial counter configs
 */
const app = (ctx, initial) => {
  const counters = initial.map(([start, step]) => counter(start, step));
  return sync({
    src: counters.map(c => c.transform(map(() => [clickButton, c]))),
    xform: map(
      // build the app's actual root component
      buttons => ["div", ctx.ui.root, ...vals(buttons), [resetButton, counters]]
    ),
    // this config ensures that only at the very beginning *all*
    // inputs must have delivered a value (i.e. stream
    // synchronization) before this stream itself delivers a value.
    // however, by stating `reset: false` (actually the default) any
    // subsequent changes to any of the inputs will not be
    // synchronized see here for further details:
    // https://github.com/thi-ng/umbrella/blob/master/packages/rstream/src/stream-sync.ts#L21
    // https://github.com/thi-ng/umbrella/blob/master/packages/transducers/src/xform/partition-sync.ts#L7
    reset: false
  });
};
// start app & DOM updates
domUpdate(document.getElementById("app"), app(ctx, [[10, 1], [20, 5], [30, 10]]), ctx); //?
