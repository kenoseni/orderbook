const BUY_ORDER_BOOK = [];
const SELL_ORDER_BOOK = [];

const options = {
  sell: {
    isBuyOrder: false,
    condition: (order, price) => order.price > price,
    sortFunc: (a, b) => b.price - a.price,
  },
  buy: {
    isBuyOrder: true,
    condition: (order, price) => order.price < price,
    sortFunc: (a, b) => a.price - b.price,
  },
};

const readOrders = (type) => {
  if (type === "buy") return BUY_ORDER_BOOK;
  if (type === "sell") return SELL_ORDER_BOOK;
  return null;
};

const writeOrders = (orders, type) => {
  if (type === "buy") {
    BUY_ORDER_BOOK.splice(0, BUY_ORDER_BOOK.length, ...orders);

    return BUY_ORDER_BOOK;
  }
  if (type === "sell") {
    SELL_ORDER_BOOK.splice(0, SELL_ORDER_BOOK.length, ...orders);

    return SELL_ORDER_BOOK;
  }
  return null;
};

function postOrder(quantity, price, type) {
  let qty = quantity;
  let [buyOrders, sellOrders] = [readOrders("buy"), readOrders("sell")];
  const target = type === "sell" ? buyOrders : sellOrders;

  const matchedOrder = target.filter((order) =>
    options[type].condition(order, price)
  );
  let [filled, reduced] = [{}, {}];

  const sortedMatched = matchedOrder.sort(options[type].sortFunc);

  for (const matched of sortedMatched) {
    const newExecuted = matched.executedQuantity + qty;

    if (newExecuted >= matched.quantity) {
      qty = newExecuted - matched.quantity;
      filled[matched.id] = matched;
    } else {
      reduced = {
        id: matched.id,
        executedQuantity: matched.executedQuantity + qty,
      };
      qty = 0;
      break;
    }
  }
  // only update target orderList if there was a matching
  if (Object.keys(filled).length || reduced.id) {
    const updateMatched = target.reduce((result, order) => {
      if (order.id === reduced.id) {
        order.executedQuantity = reduced.executedQuantity;
      }
      if (!filled[order.id] && order.executedQuantity !== order.quantity) {
        result.push(order);
      }
      return result;
    }, []);

    if (type === "sell") writeOrders(updateMatched, "buy");
    if (type === "buy") writeOrders(updateMatched, "sell");
  }

  const newOrder = {
    id: `${type}-${(+new Date()).toString(36) + Math.random()}`,
    isBuyOrder: options[type].isBuyOrder,
    quantity,
    price,
    executedQuantity: qty < 0 ? quantity : quantity - qty,
  };

  if (qty) {
    if (type === "sell") {
      sellOrders.push(newOrder);
      writeOrders(sellOrders, "sell");
    } else {
      buyOrders.push(newOrder);
      writeOrders(buyOrders, "buy");
    }
  }
  return [BUY_ORDER_BOOK, SELL_ORDER_BOOK];
}

module.exports = {
  postOrder,
};
