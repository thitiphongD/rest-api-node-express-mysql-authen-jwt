const {check} = require('express-validator')

exports.signupValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail({email_remove_dots: true}),
  check('password', 'Password must be 6 characters').isLength({min: 6})
]

exports.loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail({email_remove_dots: true}),
  check('password', 'Password must be 6 characters').isLength({min: 6})
]