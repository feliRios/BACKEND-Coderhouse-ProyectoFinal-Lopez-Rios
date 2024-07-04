const UserModel = require('../dao/db/models/users.model');

async function esUsuarioPremium(userID) {
    try {
        const user = await UserModel.findById(userID);

        if (user && user.role.toLowerCase() === 'premium' || user.role.toLowerCase() === 'admin') {
            return true; 
        } else {
            return false; 
        }
    } catch (error) {
        console.error('Error validating user premium: ', error);
        throw error; 
    }
}

module.exports = { esUsuarioPremium };
