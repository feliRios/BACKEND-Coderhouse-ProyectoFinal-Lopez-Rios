const EmailService = require('../services/emailService');
const UserModel = require("../dao/db/models/users.model");
const emailService = new EmailService();

async function deleteUser(req, res) {
    const { id } = req.params;
    const roleUser = req.session.user.role;
    const isAdmin = roleUser.toLowerCase() === "admin";

    if(!isAdmin) {
        res.status(401).json({success: false, message: "Not authorized."})
    }

    try {
        const user = await UserModel.findById(id);
        if (user) {
            await emailService.sendAccountDeletionEmailByAdmin(user.email, user.first_name, user.last_name);
            await UserModel.findByIdAndDelete(id);
            res.json({ success: true, message: `Usuario de ID (${id}) eliminado correctamente.` });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        req.logger.error(`Error deleteUser: ${error}`);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

async function UpdateRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;
    const roleUser = req.session.user.role;
    const isAdmin = roleUser.toLowerCase() === "admin";

    if(!isAdmin) {
        res.status(401).json({success: false, message: "Not authorized."})
    }

    try {
        await UserModel.findByIdAndUpdate(id, { role });
        res.json({ success: true, message: `Rol del usuario de ID (${id}) actualizado correctamente.` });
    } catch (error) {
        req.logger.error(`Error updateRole: ${error}`);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = { deleteUser, UpdateRole };
