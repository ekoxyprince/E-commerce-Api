const NodeCache = require("node-cache")
const cartCache = new NodeCache({ stdTTL: 3600 }); // Cache with a TTL of 1 hour

const getCart = () => {
  return cartCache.keys().map((key) => cartCache.get(key));
};

const addToCart = (cartItem) => {
  const key = cartItem.id.toString(); 
  cartCache.set(key, cartItem);
};

const deleteItemFromCart = (id) => {
  cartCache.del(id);
};

module.exports = { getCart, addToCart, deleteItemFromCart };
