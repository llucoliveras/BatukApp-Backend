const Sequelize = require('sequelize')
const db = require('../connection')
const Song = require('./Song')
const Event = require('./Event')
const UserBand = require('./UserBand')
const Instrument = require('./Instrument')
const BandInstrument = require('./BandInstrument')

const Band = db.define('band', {
    idband: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    location: {
        type: Sequelize.STRING
    },
    nif: {
        type: Sequelize.STRING
    },
    profile_photo: {
        type: Sequelize.STRING
    },
    google_id: {
        type: Sequelize.STRING
    }
}, {tableName: 'band'})

/** Relation Band-Song **/
Band.hasMany(Song, {
    foreignKey: "band_idband"
})

Song.belongsTo(Band, {
    foreignKey: "band_idband"
})

/** Relation Band-Event **/
Band.hasMany(Event, {
    foreignKey: "band_idband"
})

Event.belongsTo(Band, {
    foreignKey: "band_idband"
})

/** Relation Band-UserBand **/
Band.hasMany(UserBand, {
    foreignKey: "band_idband"
})

UserBand.belongsTo(Band, {
    foreignKey: "band_idband"
})

/** Relation Band-Instruments **/
Band.belongsToMany(Instrument, {
    through: BandInstrument,
    foreignKey: "band_idband"
})

Instrument.belongsToMany(Band, {
    through: BandInstrument,
    foreignKey: "instrument_idinstrument"
})

module.exports = Band