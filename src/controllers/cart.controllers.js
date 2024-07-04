const ProductService = require('../services/productService');
const CartService = require('../services/cartService');
const EnumError = require("../services/errors/ErrorEnum")
const CustomError = require("../services/errors/CustomError")
const { cartError, cartNotFound, productFields } = require("../services/errors/MessagesError")
const productService = new ProductService();
const cartService = new CartService();

async function getCart(req, res) {
    try {
        const cid = req.params.cid;
        const cart = await cartService.getCart(cid);
    
        if (cart.success) {
          res.status(200).json(cart.cart);
        } else {
            const error = CustomError.createError({
                name: "Cart error",
                cause: cartNotFound(cart.cart),
                message: "Cart not found.",
                code: EnumError.DATABASE_ERROR
              });
      
              return res.status(500).json({ error });
        }
      } catch (error) {
        req.logger.error(`getCart error: ${error}`);
        res.status(500).json({ message: 'Internal server errror.' });
      }
}

async function addCart(req, res) {
    try {
        const cart = await cartService.addCart();
        if (cart.success) {
          res.status(201).json({ data: cart.cart });
        } else {
            const error = CustomError.createError({
                name: "Cart error",
                cause: cartError(),
                message: "Adding cart error.",
                code: EnumError.DATABASE_ERROR
              });
              return res.status(500).json({ error });
        }
      } catch (error) {
        req.logger.error(`addCart error: ${error}`);
        res.status(500).json({ message: 'Internal server error.' });
      }
}

async function addProductToCart(req, res) {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const userId = req.session.user._id;
        const userRole = req.session.user.role
        const isPremium = userRole.toLowerCase() === 'premium';
        const product = await productService.getProductById(pid);
        const productOwner = product.owner;
        if (isPremium && productOwner === userId) {
            return res.status(403).json({ message: 'You are not allowed to add a product you own to your cart.' });
        }
        const result = await cartService.addProductToCart(cid, pid);
        res.status(200).json(result);
      } catch (error) {
        req.logger.error(`addProductToCart error: ${error}`);
        res.status(500).json({ message: error.error || 'Internal server error.' });
      }
}

async function removeProductFromCart(req, res) {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const removeAll = req.query.removeAll === 'true';
        const result = await cartService.removeProductFromCart(cid, pid, removeAll);
        if (result.success) {
            res.status(200).send(result);
        } else {
            const error = CustomError.createError({
                name: "Cart error",
                cause: cartError(result.message),
                message: result.message,
                code: EnumError.DATABASE_ERROR
              });
      
              return res.status(404).json({ error });
        }
    } catch (error) {
        req.logger.error(`removeProductFromCart error: ${error}`);
        res.status(500).send({ message: 'Internal server error.', error: error });
    }
}

async function removeAllProducts(req, res) {
    try {
        const cid = req.params.cid;
        const result = await cartService.removeAllProducts(cid);
        if (result.success) {
            res.status(200).send(result);
        } else {
            const error = CustomError.createError({
                name: "Cart error",
                cause: cartError(result.message),
                message: result.message,
                code: EnumError.DATABASE_ERROR
              });
      
              return res.status(404).json({ error });
        }
    } catch (error) {
        req.logger.error(`removeAllProducts error: ${error}`);
        res.status(500).send({ message: 'Internal server error.', error: error });
    }
}

async function updateCart(req, res) {
    try {
        const cid = req.params.cid;
        const data = req.body.products;
        const result = await cartService.updateCart(cid, data);
        if (result.success) {
            res.status(200).send(result);
        } else {
            const error = CustomError.createError({
                name: "Cart error",
                cause: cartError(result.message),
                message: result.message,
                code: EnumError.DATABASE_ERROR
              });
      
              return res.status(404).json({ error });
        }
    } catch (error) {
        req.logger.error(`updateCart error.: ${error}`);
        res.status(500).send({ message: 'Internal server error.', error: error });
    }
}

async function updateProductQuantity(req, res) {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.body.quantity;
        const result = await cartService.updateProductQuantity(cid, pid, quantity);
        if (result.success) {
            res.status(200).send(result);
        } else {
            const error = CustomError.createError({
                name: "Cart error",
                cause: cartError(result.message),
                message: result.message,
                code: EnumError.DATABASE_ERROR
              });
              return res.status(404).json({ error });
        }
    } catch (error) {
        req.logger.error(`updateProductQuantity error: ${error}`);
        res.status(500).send({ message: 'Internal server error.', error: error });
    }
}

module.exports = {addCart, getCart, addProductToCart, removeProductFromCart, updateCart, updateProductQuantity, removeAllProducts}