const express = require('express')
const router = express.Router()
const db = require('./dbConnection')
const {signupValidation, loginValidation} = require('./validation')
const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


router.post('/register', signupValidation, function(req, res, next) {
  db.query(`SELECT * FROM users WHERE LOWER(email) = LOWER(
    ${db.escape(req.body.email)})`, function(err, result) {
      if (result.length) {
        return res.status(409).json({
          code: 409,
          message: 'This user is already in use!'
        })
      } else { // username is available
        bcrypt.hash(req.body.password, 10, function(error, hash) {
          if (error) {
            return res.status(500).json({
              code: 500,
              message: error
            })
          } else { // has hashed password add to database
            db.query(`INSERT INTO users (name, email, password) VALUES ('${req.body.name}', ${db.escape(req.body.email)}, ${db.escape(hash)})`, function(err, result) {
            if (err) {
            throw err
              return res.status(400).json({
                code: 400,
                message: err
              })
            } else {
              return res.status(201).json({
                code: 201,
                message: 'User has been register with us!'
              })
            }
          })
         }
      })
    }
  })
})

router.post('/login', loginValidation, function(req, res, next) {
  db.query(`SELECT * FROM users WHERE email = ${db.escape(req.body.email)}`, function(err, result) {
    if (err) {
      res.status(400).json({
        code: 400,
        message: err
      })
    }
    if (!result.length) {
      return res.status(401).json({
        code: 401,
        message: 'Email or password is incorrect!'   
      })
    }
    bcrypt.compare(req.body.password, result[0]['password'], function(bcryptError, bcryptResult) {
      if (bcryptError) { // bcrypt Error
        throw bcryptError
        return res.status(401).json({
          message: 'Email or password is incorrect!'
        })
      }
      if (bcryptResult) {
        const token = jwt.sign({id: result[0].id}, 'the-super-strong-secret', {expiresIn: '1h'})
        db.query(`UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`)
        return res.status(200).json({
          message: 'Logged in!',
          token: token,
          user: result[0]
        })
      }
      return res.status(401).json({
        message: 'Username or password incorrect!'
      })
    })
  })
})

router.post('/getUser', signupValidation, function(req, res, next) {
    if (!req.headers.authorization || req.headers.authorization.startWith('Bearer') || req.headers.authorization.split(' ')[1]) {
      return res.status(422).json({
        message: 'Please provide token'
      })
    }
    const theToken = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(theToken, 'the-super-strong-secret')
    db.query(`SELECT * FROM users where id = ?`, decoded.id, function(error, result, fields) {
      if (error) throw error;
      return res.send({
        error: false,
        data: result[0],
        message: 'Fetch Successfully.'
      })
    })
})

module.exports = router
