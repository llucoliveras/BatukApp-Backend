const Sequelize = require('sequelize')
const db = require('../connection')

const BandInstrument = db.define('band_instrument', {
    quantity: {
        type: Sequelize.INTEGER
    },
    min_formation: {
        type: Sequelize.INTEGER
    },
    order_formation: {
        type: Sequelize.INTEGER
    }
}, {tableName: 'band_instrument'})

module.exports = BandInstrument