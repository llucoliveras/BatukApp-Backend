const express = require('express');
const router = express();
const Band = require('../classes/Band');
const UserBandInstrument = require('../classes/UserBandInstrument');
const UserBand = require('../classes/UserBand');
const Event = require('../classes/Event');
const Instrument = require('../classes/Instrument');
const BandInstrument = require('../classes/BandInstrument');

router.put('/:idband', (req, res) => {
    let promises = []

    promises.push(
        Band.update({
            name: req.body.name,
            location: req.body.location,
            nif: req.body.nif,
            profile_photo: req.body.profile_photo,
        }, {
            where: {
                idband: req.params.idband
            }
        })
    )

    req.body.users.map(user => {
        if (user.role)
            promises.push(
                UserBand.update({
                    role: user.role
                }, {
                    where: {
                        band_idband: req.params.idband,
                        user_iduser: user.iduser
                    }
                })
            )

        UserBand.findOne({
            where: {
                user_iduser: user.iduser,
                band_idband: req.params.idband
            }
        })
        .then(uB => {
            promises.push(
                UserBandInstrument.destroy({
                    where: {
                        user_band_iduser_band: uB.iduser_band,
                    }
                })
                .then(_ => UserBandInstrument.bulkCreate(
                    user.instruments.map((idinstrument, idx) => {
                        return {
                            user_band_iduser_band: uB.iduser_band,
                            instrument_idinstrument: idinstrument,
                            main_instrument: false,
                            priority: idx
                        }
                    })
                )
            ))
        })
    })

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
                    quantity: instrument.quantity
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
//                 main_instrument: false
//             })
//         })

//         deletedInstrumentsIds.map(idinstrument => {
//             UserBandInstrument.create({
//                 user_band_iduser_band: uB.iduser_band,
//                 instrument_idinstrument: idinstrument,
//                 main_instrument: false
//             })
//         })
//     })
// })

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

// router.post('/addMember/:idband', (req, res) => {)

module.exports = router;