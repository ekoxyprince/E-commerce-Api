const { Router } = require("express");
const router = Router();
const { auth } = require("../middlewares/auth");
const { merchant } = require("../middlewares/role");
const controller = require("../controllers/indexcontroller");
const { imageUpload } = require("../middlewares/fileupload");

router.route("/category/:type").get(controller.getCategoriesByType);
router.route("/products").get(controller.fetchAllProducts);
router.route("/services").get(controller.fetchAllServices);
router.route("/categories").get(controller.getProductById);

router
  .route("/product/:id")
  .get(controller.fetchSingleProduct)
  .patch(
    [auth, merchant],
    [imageUpload.array("image"), controller.updateProduct]
  )
  .delete([auth, merchant], controller.deleteProduct);
router.route("/service/:id").get(controller.fetchSingleService);
router
  .route("/product")
  .post(
    [auth, merchant],
    [imageUpload.array("image"), controller.createNewProduct]
  )
  .get([auth, merchant], controller.getMerchantProducts);

router
  .route("/mercantOrder")
  .get([auth, merchant], controller.getOrdersByVendor);
router
  .route("/product/image")
  .delete([auth, merchant], controller.deleteProductImage);
router.route("/search").get(controller.searchProduct);
router.route("/related_products").get(controller.fetchRelatedProducts);
router.route("/order").get([auth], controller.getCurrentUserOrder);
router
  .route("/payment")
  .get([auth], controller.createPayment)
  .post([auth], controller.startPayment);
  router
    .route("/planpayment")
    .get([auth], controller.createPlanPayment)
    .post([auth], controller.startPlanPayment);
router.route("/payment_details").get([auth], controller.getPayment);
router.route("/product-filter").get(controller.filterProducts);

router.post("/cart", controller.addTocart);
router.get("/cart", controller.fetchCart);
router.delete("/cart", controller.deleteFromCart);
router.post("/plan", [auth, merchant],controller.createPlan);
router.get("/subscription", [auth, merchant], controller.checkSubscription);



module.exports = router;

module.exports = router;
