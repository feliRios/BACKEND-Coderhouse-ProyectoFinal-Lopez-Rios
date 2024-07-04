const UserModel = require("../dao/db/models/users.model");

async function adminView(req, res) {
    try {
        const users = await UserModel.find({}, 'first_name last_name email role');
        const mappedUsers = users.map(user => ({
            ...user.toObject(),
            isUser: user.role === 'User',
            isPremium: user.role === 'Premium',
            isAdmin: user.role === 'Admin'
        }));
        res.render('admin', { users: mappedUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { adminView };
