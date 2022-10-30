require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
var encrypt = require('mongoose-encryption');
const port = 3002
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs')
mongoose.connect('mongodb://127.0.0.1:27017/userdb', { useNewUrlParser: true })

const userschema =new mongoose.Schema({
    email: String,
    password: String
}) 
// for hide secret string created a env file that ignore by git 
const secret=process.env.SECRET_KEY
userschema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] })

const User = mongoose.model('User', userschema)
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})
app.post('/register', (req, res) => {
    const newuser = new User({
        email: req.body.username,
        password: req.body.password
    })
    // console.log(newuser.password);
    newuser.save(function (err) {
        if (err) {
            console.log(err)
        } else {
            res.render('secrets')
        }
    })
})
app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    console.log(username)
    User.findOne({ email: username }, function (err, result) {
        if (err) {
            console.log(err)
        } else {
            if (result) {
                console.log(result.password)
                console.log(result.username)
                if (result.password === password) {
                    res.render('secrets')
                }
            }
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})