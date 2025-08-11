const express = require('express');
const router = express.Router();
const Band = require('../classes/Band');
const UserBandInstrument = require('../classes/UserBandInstrument');
const UserBand = require('../classes/UserBand');
const Event = require('../classes/Event');
const BandInstrument = require('../classes/BandInstrument');
const User = require('../classes/User');
const Instrument = require('../classes/Instrument');

router.get("/roles", (req, res) => {
    res.json(UserBand.rawAttributes.role.values)
})

router.get('/', (req, res) => {
    Band.findAll({
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        }
    })
    .then(result => res.json(result))
    .catch(error => res.send(error).status(500))
})

router.get('/public', (req, res) => {
    Band.findAll({
        include: {
            model: Event,
            where: {
                private: false
            },
            attributes: []
        },
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        }
    })
    .then(result => res.json(result))
    .catch(error => res.send(error).status(500))    
})

router.get('/:idband', (req, res) => {
    Band.findOne({
        where: {
            idband: parseInt(req.params.idband)
        },
        include: [
            {
                model: Instrument
            },
            {
                model: User,
                include: [
                    {
                        model: UserBand,
                        include: [
                            {
                                model: Instrument
                            }
                        ]
                    }
                ]
            }
        ],
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        }
    })
    .then(result => res.json(result))
    .catch(error => res.send(error).status(500))
})
// 
router.put('/:idband/instruments', (req, res) => {
    let promises = []
    req.body.map(instrument => {
        promises.push(
            BandInstrument.update({
                min_formation: instrument.min_formation,
                quantity: instrument.quantity
            }, {
                where: {
                    band_idband: parseInt(req.params.idband),
                    instrument_idinstrument: instrument.idinstrument
                }
            })
        )
    })

    Promise.all(promises)
    .then(result => res.json(true).status(200))
    .catch(error => res.send(error).status(500))
})

router.put('/:idband', (req, res) => {
    const {
        fieldsUnchanged,
        instrumentsUnchanged,
        usersUnchanged
    } = req.query

    let promises = []

    // Band data
    if (fieldsUnchanged && fieldsUnchanged == 'false') {
    promises.push(
        Band.update({
            name: req.body.name,
            location: req.body.location,
            profile_picture: req.body.profile_picture,
            color_code: req.body.color_code,
        }, {
            where: {
                    idband: parseInt(req.params.idband)
                }
            })
        )
    }

    if (instrumentsUnchanged && instrumentsUnchanged == "false" && req.body.instruments) {
    promises.push(BandInstrument.destroy({
        where: {
                band_idband: parseInt(req.params.idband),
        }
    }).then(_ =>
        req.body.instruments.map(instrument => {
            promises.push(
                BandInstrument.create({
                    band_idband: parseInt(req.params.idband),
                    instrument_idinstrument: instrument.idinstrument,
                    quantity: instrument.quantity,
                    min_formation: instrument.min_formation
                })
            )
        })
    ))
    }

    // band users
    if (usersUnchanged && usersUnchanged == "false" && req.body.users) {
        req.body.users.map(user => {
            console.log(user.role, user.iduser)
            promises.push(
                UserBand.update({
                    role: user.role
                }, {
                    where: {
                        band_idband: parseInt(req.params.idband),
                        user_iduser: user.iduser
                    }
                })
                .then(() => UserBand.findOne({
                    where: {
                        user_iduser: user.iduser,
                        band_idband: parseInt(req.params.idband)
                    }
                }))
                .then(uB => {
                    return UserBandInstrument.destroy({
                        where: {
                            user_band_iduser_band: uB.iduser_band,
                        }
                    })
                    .then(() => UserBandInstrument.bulkCreate(
                        user.instruments.map((instrument, idx) => {
                            console.log(instrument, idx)
                            return ({
                                user_band_iduser_band: uB.iduser_band,
                                instrument_idinstrument: instrument.idinstrument,
                                priority: idx
                            })
                        })
                    ))
                })
            )
        })
    }

    Promise.all(promises)
    .then(result => res.json(true).status(200))
    .catch(error => res.send(error).status(500))
})

router.post('/assignMembers/:idband', (req, res) => {
    let promises = []

    const createRelation = user => UserBand.create({
        user_iduser: user.iduser,
        band_idband: parseInt(req.params.idband),
        role: user.role || UserBand.rawAttributes.role.defaultValue
    })

    req.body.map(email => {
        User.findOne({
            where: {
                email: email
            }
        })
        .then(user => {
            if (user == null) {
                promises.push(
                    Band.findOne({ where: { email: email } })
                    .then(band => {
                        if (band != null) return // do nothing if the email is from an existing band

                        User.create({ name: email.split("@")[0], email: email })
                        .then(user => createRelation(user))
                    })
                )
            }
            else {
                promises.push(createRelation(user))
            }
        })
        .catch(error => res.send(error).status(500))
    })

    Promise.all(promises)
    .then(result => res.json(result).status(200))
    .catch(error => res.send(error).status(500))
})

module.exports = router;