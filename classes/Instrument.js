const Sequelize = require('sequelize')
const db = require('../connection')

const Instrument = db.define('instrument', {
    idinstrument: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    sound_file_or_url: {
        type: Sequelize.STRING
    }
}, {tableName: 'instrument'})

module.exports = Instrument