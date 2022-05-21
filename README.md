# Orderbook

A simplified distributed exchange

## Available Scripts

Boot two grape servers

### grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'

### grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'

In the server directory, run:

### `npm start`

In the client directory, run:

### `npm start`

## Example

The client server is started with nodemon and its payload can be changed on line `13` in the `index.js` file of the client folder

Consider the following payload

1. payload 1 = `{ qty: 1, price: 10, type: "sell" }`

This is added to the order book and the response to the client is

```
[
  [],
  [
    {
      id: 'sell-l3fhweqj0.3957834378364178',
      isBuyOrder: false,
      quantity: 1,
      price: 10,
      executedQuantity: 0
    }
  ]
]
```

The above shows there is no buy order (an empty array) and there is a sell order.

2. payload 2 = `{ qty: 2, price: 10, type: "buy" }`

The above payload cause the order book to return

```
[
  [
    {
      id: 'buy-l3fhxk8o0.4209139481441606',
      isBuyOrder: true,
      quantity: 2,
      price: 10,
      executedQuantity: 0
    }
  ],
  [
    {
      id: 'sell-l3fhweqj0.3957834378364178',
      isBuyOrder: false,
      quantity: 1,
      price: 10,
      executedQuantity: 0
    }
  ]
]
```

This means one buy order and one sell order is present in the order book

3. payload 3 = `{ qty: 5, price: 7, type: "sell" }`

The above payload cause the order book to return

```
[
  [],
  [
    {
      id: 'sell-l3fhweqj0.3957834378364178',
      isBuyOrder: false,
      quantity: 1,
      price: 10,
      executedQuantity: 0
    },
    {
      id: 'sell-l3fhz98p0.2258346338119226',
      isBuyOrder: false,
      quantity: 5,
      price: 7,
      executedQuantity: 2
    }
  ]
]
```

The buy order present in the order book has been excuted and it is recorded by the latest sell order in the form of `executedQuantity` and also the buy order has an empty array in the order book

## Limitations and Issues

1. This implementation was done for only one client
2. Each client does not have its own instance of orderbook but changes a central order book
3. Race condition was not implemented

## Solutions to limitations

1. There will be a main order book and methods associated with it to manipulate it.
2. Each client will keep its own instance of the order book.
3. A Pub/Sub pattern is implemented whereby any order that was published as an event will be listened to by all client connected.
4. If the order published matches the client's order, the order is executed and the remainder, if any, is stored in the client's orderbook and the main order book.
5. Race condition is solved by implementing a concurrency control called versioning whereby every event of orders has a version number and each event is processed sequentially by its version number, therefore, event with version number 4 cannot be process before version number 2. If 4 tries to happen before 2, it is blocked and no acknowledgement is sent for 4 being processed. After 2 has been processed, the event bus which is yet to receive an acknowledegment for the event with version 4 will resend that event to be processed. This ensures events are processed in the correct order.
