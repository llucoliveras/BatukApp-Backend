const Sequelize = require('sequelize')
const db = require('../connection')
const UserBandInstrument = require('./UserBandInstrument')
const Instrument = require('./Instrument')

const UserBand = db.define('user_band', {
    iduser_band: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    role: {
        type: Sequelize.ENUM('Admin','Editor','Member')
    }
}, {tableName: 'user_band'})

/** Relation UserBand-UserBandInstrument **/
UserBand.hasMany(UserBandInstrument, {
    foreignKey: "user_band_iduser_band"
})

UserBandInstrument.belongsTo(UserBand, {
    foreignKey: "user_band_iduser_band"
})

/** Relation UserBandInstrument-Instrument **/
UserBand.belongsToMany(Instrument, {
    through: UserBandInstrument,
    foreignKey: "user_band_iduser_band"
})

Instrument.belongsToMany(UserBand, {
    through: UserBandInstrument,
    foreignKey: "instrument_idinstrument"
})

module.exports = UserBand