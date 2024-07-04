const { createHash, isValidatePass } = require('../utils/crypt')
const { validatePasswordResetToken } = require("../utils/passwordReset");
const UserModel = require("../dao/db/models/users.model")
const PasswordResetToken = require('../dao/db/models/passwordreset.model');

class UserManager {
  constructor() {}

  async createNewUser({ first_name, last_name, email, age, password }) {
    try {
        const user = await UserModel.create({
          first_name: first_name,
          last_name: last_name,
          email: email,
          age: age,
          password: createHash(password)
        });

        return { message: "User created successfully", userData: user };
      } catch (error) {
        console.log(error);
    }
  }

  async findUser(email, password) {
    try {
      const user = await UserModel.findOne({ email });
  
      if (!user) {
        return { error: "User not found.", statusCode: 404 };
      }

      const isValidPassword = isValidatePass(password, user.password);
  
      if (!isValidPassword) {
        return { error: "Incorrect password", statusCode: 401 };
      }

      return user;
    } catch (error) {
      console.error("findUser error:", error);
      return { error: "Auth error", statusCode: 500 };
    }
  }

  async resetPassword(token, newPassword) {
    const isValidToken = await validatePasswordResetToken(token);
    if (isValidToken) {
      const resetToken = await PasswordResetToken.findOne({ token: token });
  
      if (!resetToken || resetToken.expires < Date.now()) {
        return { error: "Invalid or expired token" };
      }

      if (resetToken.used) {
        return { error: "Token already used to reset password" };
      }
    
      const user = await UserModel.findById(resetToken.user);
      if (!user) {
        return { error: "User not found" };
      }
    
      if (isValidatePass(newPassword, user.password)) {
        return { error: "The new password must be different from the current one." };
      }

      user.password = createHash(newPassword);
      await user.save();

      resetToken.used = true;
      await resetToken.save();
      
      return { message: "Password modified successfully" };
    } else {
      return { error: "Invalid or expired token" };
    }
  }

 async toggleUserRole(userId) {
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return { error: "User not found." };
        }

        const newRole = user.role === 'User' ? 'Premium' : 'User';

        user.role = newRole;

        await user.save();
        return { message: `Role edited successfully, now the user is ${newRole}` };
    } catch (error) {
      console.error("toggleUserRole error:", error);
      return { error: "Error when changing user role" };
    }
}
}

module.exports = UserManager;
