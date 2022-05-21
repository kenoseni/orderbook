const { PeerRPCClient } = require("grenache-nodejs-http");
const Link = require("grenache-nodejs-link");

const link = new Link({
  grape: "http://127.0.0.1:30001",
});
link.start();

// Creates a new instance of a PeerRPCClient, which connects to the DHT using the passed link
const peer = new PeerRPCClient(link, {});
peer.init();

const payload = { qty: 5, price: 7, type: "sell" };

peer.request("orderbook_worker", payload, { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err);
    process.exit(-1);
  }
  console.log(data);
});
