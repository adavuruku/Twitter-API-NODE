const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors')

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const con = require('./connection');


const usersRoutes = require('./app/routes/usersRoute');
const tweetRoutes = require('./app/routes/tweetRoute');
const retweetRoute = require('./app/routes/retweetRoute');
app.use('/user',usersRoutes);
app.use('/tweet',tweetRoutes);
app.use('/retweet',retweetRoute);

app.use((req,res,next)=>{
    const error = new Error('Not found');
    error.status=404;
    next(error);
});


app.use((error, req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error : {
            message: error.message
        }
    });
});

module.exports = app;