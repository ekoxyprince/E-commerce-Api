const { paystack_key_plans } = require("../config");

const paystack = (request) => {
  const initializePayment = (body) => {
    const options = {
      url: "https://api.paystack.co/transaction/initialize",
      headers: {
        Authorization: paystack_key_plans,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
      body,
    };
    return request.post(
      options.url,
      { ...options.body },
      { headers: options.headers }
    );
  };
  const verifyPayment = (ref) => {
    const options = {
      url:
        `https://api.paystack.co/transaction/verify/` + encodeURIComponent(ref),
      headers: {
        authorization: paystack_key_plans,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
    };
    return request.get(options.url, { headers: options.headers });
  };
  return { initializePayment, verifyPayment };
};

module.exports = paystack;
