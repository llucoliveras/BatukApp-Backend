const Sequelize = require('sequelize');

const mysqlConnection = new Sequelize('batukapp', 'root', '951753852456Ll', {
    host: 'localhost',
    dialect:  'mysql'
});

mysqlConnection
    .authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(err => console.error('Unable to connect to the database:', err));

module.exports = mysqlConnection;