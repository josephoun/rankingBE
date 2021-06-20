const express = require('express');
const app = express();
const logger = require('./middlewares/logger');
const api = require('./router/api');
const { PORT } = require('./constants');


// Middleware Parsers
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Logger Middleware
app.use(logger);

// Set our api routes
app.use('/api', api);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.status(404).send({message: 'Not Found'});
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
