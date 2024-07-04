const CartModel = require("../dao/db/models/carts.model")
const ProductModel = require('../dao/db/models/products.model'); 
const crypto = require('crypto');

function generateCartId() {
  return crypto.randomBytes(8).toString('hex');
}

class CartManager {
  constructor() {}

  async addCart() {
    try {
      const cartId = generateCartId();
      const newCart = new CartModel({
        id: cartId,
        products: [],
      });

      await newCart.save();

      return { success: true, cart: newCart };
    } catch (error) {
      throw error;
    }
  }

  async getCart(cartId) {
    try {
      const cart = await CartModel.findOne({ _id: cartId }).populate('products.product');
  
      if (cart) {
        return { success: true, cart: cart.products };
      } else {
        return { success: false, error: 'Cart not found.' };
      }
    } catch (error) {
      throw error;
    }
  }
  

  async addProductToCart(cartId, productId) {
    try {
      const cart = await CartModel.findOne({ _id: cartId });
      const product = await ProductModel.findOne({ _id: productId }); 

      if (!cart) {
        return { success: false, error: 'Cart not found.' };
      }

      if (!product) {
        return { success: false, error: 'Product not found in product list' };
      }

      const productInCart = cart.products.find((item) => item.product.toString() === productId);

      if (productInCart) {
        productInCart.quantity++;
      } else {
        cart.products.push({
          product: productId,
          quantity: 1,
        });
      }
  
      await cart.save();

      return { success: true, message: 'Product successfully added to cart' };
    } catch (error) {
      throw error;
    }
  }

  async removeProductFromCart(cartId, productId, removeAll = false) {
    try {
        const cart = await CartModel.findOne({ _id: cartId });
        if (!cart) {
            return { success: false, message: `Cart with id ${cartId} not found.` };
        }

        const product = cart.products.find(p => p.product.toString() === productId);
        if (!product) {
            return { success: false, message: `Product not found with id ${productId} in cart.` };
        }

        if (removeAll || product.quantity === 1) {
            const result = await CartModel.updateOne(
                { _id: cartId },
                { $pull: { products: { product: productId } } }
            );
            if (result.nModified === 0) {
                return { success: false, message: `Product not found with id ${productId} in cart.` };
            } else {
                return { success: true, message: `The product with id ${productId} was completely removed..`, data: result };
            }
        } else {
            product.quantity -= 1;
            await cart.save();
            return { success: true, message: `1 quantity of product with id ${productId} was deleted.`, data: cart };
        }
    } catch (error) {
        throw error;
    }
}

async updateCart(cartId, updatedProducts) {
  try {
      const result = await CartModel.updateOne(
          { _id: cartId },
          { $set: { products: updatedProducts } }
      );

      if (result.matchedCount === 0) {
          return { success: false, message: 'Cart not found.' };
      }

      return { success: true, message: 'Cart updated successfully', data: result };
  } catch (error) {
      throw error;
  }
}

async updateProductQuantity(cartId, productId, newQuantity) {
  try {
      const result = await CartModel.updateOne(
          { _id: cartId, 'products.product': productId },
          { $set: { 'products.$.quantity': newQuantity } }
      );

      if (result.matchedCount === 0) {
          return { success: false, message: 'Cart or product not found' };
      }

      return { success: true, message: 'Product quantity correctly updated', data: result };
  } catch (error) {
      throw error;
  }
}

async removeAllProducts(cartId) {
  try {
      const result = await CartModel.updateOne(
          { _id: cartId },
          { $set: { products: [] } }
      );

      if (result.matchedCount === 0) {
        return { success: false, message: 'Cart not found.' };
    }

      return { success: true, message: 'All products in the cart were successfully removed', data: result };
  } catch (error) {
      throw error;
  }
}

}

module.exports = CartManager;
