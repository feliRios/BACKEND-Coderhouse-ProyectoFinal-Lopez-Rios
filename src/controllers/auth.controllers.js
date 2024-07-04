const UserModel = require("../dao/db/models/users.model");
const CartModel = require("../dao/db/models/carts.model");
const UserService = require('../services/userService');
const EmailService = require('../services/emailService');
const CustomError = require("../services/errors/CustomError");
const EnumError = require("../services/errors/ErrorEnum");
const { generateUserErrorMessage, userLoginError, existingUser } = require("../services/errors/MessagesError");
const { generatePasswordResetToken, validatePasswordResetToken } = require("../utils/passwordReset");
const userService = new UserService();
const emailService = new EmailService();

async function Login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await userService.findUser(email, password);
  
      if (user.error) {
        const error = CustomError.createError({
          name: "User login error",
          cause: userLoginError(user.error),
          message: user.error,
          code: EnumError.INVALID_TYPES_ERROR
        });

        return res.status(user.statusCode).json({ error });
      } else {
        user.last_connection = new Date();
        if (!user.cart) {
          const cart = await CartModel.create({ products: [] });
          user.cart = cart._id;
        }

        await user.save();
        req.session.user = user;
        res.status(200).redirect('/products');
      }
    } catch (error) {
      req.logger.error(`Error Login: ${error}`);
      res.status(500).json({ message: "Internal server error." });
    }
}

async function Register(req, res) {
  const { first_name, last_name, email, age, password } = req.body;

  if (!first_name || !email) {
    const error = CustomError.createError({
      name: "User creation error",
      cause: generateUserErrorMessage({ first_name, last_name, email, age, password }),
      message: "All fields are required!",
      code: EnumError.INVALID_TYPES_ERROR
    });
    
    return res.status(400).json({ error });
  }

  try {
    const userExistsInDB = await UserModel.findOne({ email });

    if (userExistsInDB) {
        const error = CustomError.createError({
          name: "User creation error",
          cause: existingUser({email}),
          message: "The user with this email already exists.",
          code: EnumError.DATABASE_ERROR
        });
        return res.status(409).json({ error });
    }

    await userService.createNewUser({
      first_name,
      last_name,
      email,
      age,
      password,
    });

    res.status(200).redirect("/");
  } catch (error) {
    req.logger.error(`Error Register: ${error}`);
    res.status(500).json(error);
  }
}

async function Logout(req, res) {
  const userId = req.session.user._id;
  try {
      const user = await UserModel.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      user.last_connection = new Date();
      await user.save();
      req.session.destroy((err) => {
          if (err) {
              req.logger.error(`Logout error: ${err}.`);
              return res.status(500).json({ message: "Logout error." });
          } else {
              res.status(200).redirect("/");
          }
      });
  } catch (error) {
      req.logger.error(`Logout error: ${error}`);
      res.status(500).json({ message: "Internal server error." });
  }
}

async function RequestPasswordReset(req, res) {
  const { email } = req.body;
  try {
    const token = await generatePasswordResetToken(email);
    if (token.error) {
      res.status(400).json({ error: token.error });
    } else {
      await emailService.sendPasswordResetEmail(email, token);
      res.status(200).json({ message: "Password reset email sent." });
    }
  } catch (error) {
    req.logger.error(`Error password reset: ${error}`);
    res.status(500).json({ message: "Error requesting password reset" });
  }
}

async function ResetPassword(req, res) {
  const { token, newPassword } = req.body;
  try {
    const result = await userService.resetPassword(token, newPassword);
    if (result.error) {
      res.status(400).json({ error: result.error });
    } else {
      res.status(200).json({ message: result.message });
    }
  } catch (error) {
    req.logger.error(`Resetting password error: ${error}.`);
    res.status(500).json({ error: "Resetting password error." });
  }
}


module.exports = { Login, Register, Logout, RequestPasswordReset, ResetPassword };