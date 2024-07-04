const ProductService = require("../services/productService")
const productService = new ProductService()

async function HomeView(req, res) {
    try {
        const { limit = 10, page = 1, sort, query } = req.query || {};
        const products = await productService.getProducts({ limit, page, sort, query });
        const finalProducts = products.payload.map(product => ({ ...product.toObject(), userCart: req.session.user.cart}));
        const userData = {
            first_name: req.session.user.first_name,
            last_name: req.session.user.last_name,
            age: req.session.user.age,
            email: req.session.user.email,
            role: req.session.user.role,
            cart: req.session.user.cart
        };
        res.status(200).render("products", {
          products: finalProducts,
          user: userData
        });
    } catch (error) {
        req.logger.error(`HomeView error: ${error}`);
    }
}

module.exports = {HomeView}