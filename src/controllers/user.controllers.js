const UserService = require("../services/userService");
const UserModel = require("../dao/db/models/users.model")
const EmailService = require('../services/emailService');
const emailService = new EmailService();
const userService = new UserService()

async function toggleUserRole(req, res) {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "You must be logged in to use this function" });
        }
        const userRole = req.session.user.role
        if (userRole.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to edit user roles.' });
        }
        const { uid } = req.params;
        const user = await UserModel.findById(uid);
        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }
        if (user.role === 'User') {
          const requiredDocuments = ['Identificacion', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
          const userDocuments = user.documents.map(doc => doc.name);
          const allDocuments = requiredDocuments.every(doc => userDocuments.includes(doc));
          if (!allDocuments) {
            return res.status(400).json({ message: 'El usuario no cargo su documentacion.' });
          }
        }
        const updatedUser = await userService.toggleUserRole(uid)
        if (updatedUser.error) {
            res.status(400).json({ error: updatedUser.error });
          } else {
            res.status(200).json({ message: updatedUser.message });
          }
    } catch (error) {
        req.logger.error(`toggleUserRole role: ${error}`);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

async function uploadDocuments(req, res) {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "You must be logged in to use this function" });
      }
      const userId = req.params.uid;
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      const documents = [];
      if (req.files.profile) {
        documents.push({
          name: 'Perfil',
          reference: req.files.profile[0].path
        });
      }
      if (req.files.product) {
        documents.push({
          name: 'Producto',
          reference: req.files.product[0].path
        });
      }
      if (req.files.documents) {
        req.files.documents.forEach(file => {
          documents.push({
            name: file.originalname,
            reference: file.path
          });
        });
      }
      user.documents.push(...documents);
      await user.save();
      res.status(200).json({ message: 'Documents uploaded successfully', documents: user.documents });
    } catch (error) {
      req.logger.error(`uploadDocuments error: ${error}`);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };

async function getAllUser(req, res){ 
  try {
    const users = await UserModel.find({}, 'first_name last_name email role');
    res.status(200).json(users);
  } catch (error) {
    req.logger.error(`allGetUsers error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

async function deleteInactivityUsers(req, res){
  try {
    const inactivityTime = 2 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const deadline = new Date(now - inactivityTime);
    const inactivityUsers = await UserModel.find({ last_connection: { $lt: deadline } });
    if (inactivityUsers.length === 0) {
      return res.status(404).json({ message: 'There are no inactive users to delete.' });
    }
    let deletedAccounts = 0;
    for (const user of inactivityUsers) {
        await emailService.sendAccountDeletionEmail(user.email, user.first_name, user.last_name);
        await UserModel.deleteOne({ _id: user._id });
        deletedAccounts++;
    }
    res.status(200).json({ message: `Se eliminaron ${deletedAccounts} usuarios inactivos correctamente.` });
  } catch (error) {
    req.logger.error(`deleteInactivityUsers error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });  
  }
}

module.exports = {toggleUserRole, uploadDocuments, getAllUser, deleteInactivityUsers}