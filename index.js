const express = require('express');
const bodyParser = require('body-parser');
const swagger = require('./swagger');
const app = express();
const port = process.env.PORT || 3000;

swagger(app)

// Configuració
app.set('port', port);
app.set('json spaces', 2)
app.set('view engine', 'jade')
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

/* GET home page. */
app.get('/', (req, res) => {
    res.render('index', { title: 'Express' });
});

module.exports = app;