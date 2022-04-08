const express = require('express');
var bodyParser = require('body-parser');
const route = require('./route/route.js');
const app = express();
//require('dotenv').config()
//console.log(process.env.test)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://vpandey:qVLIgv7EqMycOrmr@cluster0.lvp0c.mongodb.net/group12Database?retryWrites=true&w=majority", { useNewUrlParser: true })
    .then(() => console.log('mongodb running on 27017'))
    .catch(err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});