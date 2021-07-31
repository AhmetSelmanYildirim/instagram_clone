const router = require('express').Router();
const authController = require('../controllers/auth_controller');
const authMiddleware = require('../middlewares/auth_middleware');
const validatorMiddleware = require('../middlewares/validator_middleware')

router.get('/', (req, res, next) => {
    res.redirect('/login')
});
router.get('/homepage', (req, res, next) => {
    res.redirect('manage/homepage')
})

router.get('/login', authMiddleware.notLoggedIn, authController.showLoginForm);
router.post('/login', authMiddleware.notLoggedIn, validatorMiddleware.validateLogin(), authController.login);

router.get('/register', authMiddleware.notLoggedIn, authController.showRegisterForm);
router.post('/register', authMiddleware.notLoggedIn, validatorMiddleware.validateNewUser(), authController.register);

router.get('/forgot-password', authMiddleware.notLoggedIn, authController.showForgotPasswordForm);
router.post('/forgot-password', authMiddleware.notLoggedIn, validatorMiddleware.validateEmail(), authController.forgotPassword);

router.get('/verify', authController.verifyMail)

router.get('/reset-password/:id/:token', authController.showNewPasswordForm)
router.get('/reset-password', authController.showNewPasswordForm)
router.post('/reset-password', validatorMiddleware.validateNewPassword(), authController.saveNewPassword)

router.get('/logout', authMiddleware.loggedIn, authController.logout)

module.exports = router;