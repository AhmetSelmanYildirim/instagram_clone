const router = require('express').Router();
const manageController = require('../controllers/manage_controller')
const authMiddleware = require('../middlewares/auth_middleware')
const multerConfig = require('../config/multer_config')

router.get('/homepage', authMiddleware.loggedIn, manageController.showHomePage)
router.post('/homepage', authMiddleware.loggedIn, manageController.like)

router.get('/profile', authMiddleware.loggedIn, manageController.showProfilePage)

router.get('/profile/update', authMiddleware.loggedIn, manageController.showProfileUpdatePage)
router.post('/profile/update-profile', authMiddleware.loggedIn, multerConfig.uploadImage.single('avatar'), manageController.updateProfile)

router.get('/upload-photo', authMiddleware.loggedIn, manageController.showPhotoUpload)
router.post('/upload-photo', authMiddleware.loggedIn, multerConfig.uploadPhoto.single('photo'), manageController.uploadPhoto)

router.post('/comment', authMiddleware.loggedIn, manageController.comment)

router.get('/p/:photoID', authMiddleware.loggedIn, manageController.showPhotoPage)
router.get('/profile/:usernamee', authMiddleware.loggedIn, manageController.showUserPage)
router.post('/add-friend', authMiddleware.loggedIn, manageController.addFriend)
router.post('/remove-friend', authMiddleware.loggedIn, manageController.removeFriend)

router.get('/messages', authMiddleware.loggedIn, manageController.showMessages)
router.post('/messages', authMiddleware.loggedIn, manageController.newMessage)

module.exports = router