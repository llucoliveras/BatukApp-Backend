const Sequelize = require('sequelize')
const db = require('../connection')

const Song = db.define('song', {
    idsong: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    url: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    }
}, {tableName: 'song'})

module.exports = Song