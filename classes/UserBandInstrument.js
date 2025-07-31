const Sequelize = require('sequelize')
const db = require('../connection')

const UserBandInstrument = db.define('user_band_instrument', {
    priority: {
        type: Sequelize.INTEGER
    }
}, {tableName: 'user_band_instrument'})

module.exports = UserBandInstrument