  
See [syntax options](http://ditaa.sourceforge.net/)



### `sidechainParition(fromRAF())`

```ditaa {cmd=true args=["-E"]}

                 /-----------------------------\
 -*1-*2-*3-*4-*5-+                             |
                 |sidechainParition(fromRAF()) +--*1---*234->
 RAF*-----RAF*---+ cBLK                        |
                 \-----------------------------/

```

```js


let ex_pub_01 = rs.pubsub({
  // topic = test decides what the topic is
  topic: x => Object.keys(x)[0],
  id: "ex_pub_01"
})

// dynamic pubsub subscription (ad-hoc attachment)
// simple sub (input)
let ex_pubsub_basic = ex_pub_01.subscribeTopic("_fetch", rs.trace("ex_pubsub_basic"), "bloop")

ex_pub_01.next({ _fetch: "noop" })
//=> ex_pubsub_basic { fetch: 'noop' }

let fetch_handler = x =>
  fetch(x)
    .then(r => r.json())
    .catch(e => `error for _fetch opts: ${x} = ${e.message}`)


// 📌 TODO: connect to sidechain (instead of rs.trace())
let ex_pubsub_fetch_handler = ({ _fetch }) =>
  rs.fromPromise(fetch_handler(_fetch)).subscribe(rs.trace("ex_pubsub_fetch_handler:"))

// dispatch to another stream based on topic (output)
let ex_pubsub_ad_hoc = ex_pub_01.subscribeTopic("_fetch", xf.map(ex_pubsub_fetch_handler))

let pub_URL = "https://jsonplaceholder.typicode.com/users/1"
ex_pub_01.next({ _fetch: pub_URL })
/* trace logs:
ex_pubsub_fetch_handler: error for _fetch opts: noop = Only absolute URLs are supported 

ex_pubsub_fetch_handler: done 

ex_pubsub_fetch_handler: { id: 1, 
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
 
ex_pubsub_fetch_handler: done 
*/
```
