const { body } = require('express-validator');

const validateNewUser = () => {
    return [
        body('email')
            .trim()
            .isEmail().withMessage('Please type a valid email.'),

        body('password')
            .trim()
            .isLength({ min: 6 }).withMessage('Password must be greater than 6 character.')
            .isLength({ max: 20 }).withMessage('Password must be lower than 20 character.'),

        body('fullname')
            .trim()
            .isLength({ min: 2 }).withMessage('Name must be greater than 2 character.')
            .isLength({ max: 30 }).withMessage('Name must be lower than 30 character.'),

        body('username')
            .trim()
            .isLength({ min: 2 }).withMessage('Username must be greater than 2 character.')
            .isLength({ max: 30 }).withMessage('Username must be lower than 30 character.'),

        body('repassword').trim().custom((value,{req})=>{
            if(value !== req.body.password){
                throw new Error('passwords do not match')
            }
            return true
        })

    ]
}

const validateLogin = () => {
    return [
        body('email')
            .trim()
            .isEmail().withMessage('Please type a valid email.'),

        body('password')
            .trim()
            .isLength({ min: 6 }).withMessage('Password must be greater than 6 character.')
            .isLength({ max: 20 }).withMessage('Password must be lower than 20 character.'),

    ]
}

const validateEmail = () =>{
    return [
        body('email')
            .trim()
            .isEmail().withMessage('Please type a valid email.'),

    ]
}

const validateNewPassword = () => {
    return [

        body('password')
            .trim()
            .isLength({ min: 6 }).withMessage('Password must be greater than 6 character.')
            .isLength({ max: 20 }).withMessage('Password must be lower than 20 character.'),

        body('repassword').trim().custom((value,{req})=>{
            if(value !== req.body.password){
                throw new Error('passwords do not match')
            }
            return true
        })
    ]
}


module.exports = {
    validateNewUser,
    validateLogin,
    validateEmail,
    validateNewPassword
}