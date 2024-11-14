const Sequelize = require('sequelize')
const db = require('../connection')

const Event = db.define('event', {
    idevent: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
    },
    location: {
        type: Sequelize.STRING
    },
    start_date: {
        type: Sequelize.DATE
    },
    end_date: {
        type: Sequelize.DATE
    },
    private: {
        type: Sequelize.BOOLEAN
    },
    status: {
        type: Sequelize.ENUM('Per confirmar','Confirmat','Anulat','Acabat')
    },
    main_photo: {
        type: Sequelize.STRING
    }
}, {tableName: 'event'})

module.exports = Event