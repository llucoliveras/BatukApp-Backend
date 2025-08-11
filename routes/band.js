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
            idband: req.params.idband
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
                    band_idband: req.params.idband,
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
    let promises = []

    promises.push(
        Band.update({
            name: req.body.name,
            location: req.body.location,
            profile_picture: req.body.profile_picture,
            color_code: req.body.color_code,
        }, {
            where: {
                idband: req.params.idband
            }
        })
    )

    if (req.body.users) {
        req.body.users.map(user => {
            if (user.role)
                // promises.push(
                //     UserBand.update({
                //         role: user.role
                //     }, {
                //         where: {
                //             band_idband: req.params.idband,
                //             user_iduser: user.iduser
                //         }
                //     })
                // )

            UserBand.findOne({
                where: {
                    user_iduser: user.iduser,
                    band_idband: req.params.idband
                }
            })
            .then(uB => {
                // promises.push(
                //     UserBandInstrument.destroy({
                //         where: {
                //             user_band_iduser_band: uB.iduser_band,
                //         }
                //     })
                //     .then(_ => UserBandInstrument.bulkCreate(
                //         user.instruments.map((idinstrument, idx) => {
                //             return {
                //                 user_band_iduser_band: uB.iduser_band,
                //                 instrument_idinstrument: idinstrument,
                //                 priority: idx
                //             }
                //         })
                //     )
                // ))
            })
        })
    }

    promises.push(BandInstrument.destroy({
        where: {
            band_idband: req.params.idband,
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

    Promise.all(promises)
    .then(result => res.json(true).status(200))
    .catch(error => res.send(error).status(500))
})

// router.get('/test', (req, res) => {
//     UserBand.findAll({
//         where: {
//             user_iduser: req.query.iduser
//         },
//         include: {
//             model: Instrument,
//             where: {
//                 idinstrument: req.query.instruments
//             }
//         }
//     })
//     .then(uB => {
//         let newInstrumentsIds = req.query.instruments.filter(idInst => !uBi.instruments.map(_ => _.idinstrument).includes(idInst))
//         let deletedInstrumentsIds = uBi.instruments.map(_ => _.idinstrument).filter(idInst => !req.query.instruments.includes(idInst))

//         newInstrumentsIds.map(idinstrument => {
//             UserBandInstrument.create({
//                 user_band_iduser_band: uB.iduser_band,
//                 instrument_idinstrument: idinstrument,
//             })
//         })

//         deletedInstrumentsIds.map(idinstrument => {
//             UserBandInstrument.create({
//                 user_band_iduser_band: uB.iduser_band,
//                 instrument_idinstrument: idinstrument,
//             })
//         })
//     })
// })

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