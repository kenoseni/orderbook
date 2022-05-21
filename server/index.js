const { PeerRPCServer } = require("grenache-nodejs-http");
const Link = require("grenache-nodejs-link");
const { postOrder } = require("./utils");

// With a link, we point to our Grape setup:
const link = new Link({
  grape: "http://127.0.0.1:30001",
});
link.start();

// Our Peer can then use the link to connect to Grape:
const peer = new PeerRPCServer(link, {
  timeout: 300000,
});

// Sets the peer active. Must get called before we get a transport to set up a server.
peer.init();

// We create a RPC server and let it listen on port
const port = 1024 + Math.floor(Math.random() * 1000);
const service = peer.transport("server");
service.listen(port);

// announce our function worker(or service) to Grape
setInterval(function () {
  link.announce("orderbook_worker", service.port, {});
}, 1000);

// The peers send a payload to the worker
// When a peer sends us a request, we reply with { msg: "world" }
service.on("request", (rid, key, payload, handler) => {
  console.log(payload);

  const { qty, price, type } = payload;
  const orderBook = postOrder(qty, price, type);

  handler.reply(null, orderBook);
});
