const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000; // 

const userRoute = require('./routes/user');
const todoRoute = require('./routes/todo');
const authRoute = require('./routes/auth');

// parse application/json
app.use(express.json());
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Route
app.use('/api/user', userRoute);
app.use('/api', authRoute);
app.use('/api/todo', todoRoute);

app.get('/', (req, res) => {
    res.send('<h1>Node.js TODO API PRISMA ORM</h1> <h4>Message: Success</h4><p>Version: 1.0</p>');
})

app.get('/api', (req, res) => {
    res.status(200);
    res.json('/user, /todo');
})

app.listen(port, () => {
    console.log('app berjalan dan terkonfigurasi port: ' + port);
})