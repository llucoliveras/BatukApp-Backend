const Sequelize = require('sequelize')
const db = require('../connection')
const Event = require('./Event')
const User = require('./User')
const Instrument = require('./Instrument')

const Assistance = db.define('assistance', {
    idassistance: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    answer: {
        type: Sequelize.ENUM('Si','Si + Transport','Pendent','No')
    }
}, {tableName: 'assistance'})

/** Relation Assistance-Event **/
Assistance.belongsTo(Event, {
    foreignKey: "event_idevent"
})

Event.hasMany(Assistance, {
    foreignKey: "event_idevent"
})

/** Relation Assistance-User **/
Assistance.belongsTo(User, {
    foreignKey: "user_iduser"
})

User.hasMany(Assistance, {
    foreignKey: "user_iduser"
})

/** Relation Assistance-Instrument */
Assistance.belongsTo(Instrument, {
    foreignKey: "instrument_idinstrument"
})

Instrument.hasMany(Assistance, {
    foreignKey: "instrument_idinstrument"
})

module.exports = Assistance