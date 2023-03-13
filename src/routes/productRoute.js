const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")

//=============================Product APIs==========================================
router.post("/products", productController.createProduct)
router.get("/products/:productId", productController.getProductById)
router.get("/products", productController.getProductByQuery)
router.put("/products/:productId", productController.updateProduct)
router.delete("/products/:productId", productController.deleteProductsById)

router.all("/*", function(req, res) {
    res.status(404).send({ msg: "No such Api found" })
})
module.exports = router

