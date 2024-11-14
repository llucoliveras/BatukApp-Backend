const express = require('express');
const router = express();
const Band = require('../classes/Band');
const User = require('../classes/User');
const UserBand = require('../classes/UserBand');
const Instrument = require('../classes/Instrument');
const Song = require('../classes/Song');

const genericUserBody = {
    include: [
        {
            model: Band,
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            },
            include: {
                model: UserBand,
                include: {
                    model: Instrument
                }
            }
        }
    ],
    attributes: {
        exclude: ["createdAt", "updatedAt"]
    }
}

router.get('/band/:idband', (req, res) => {
    User.findAll({
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        },
        include: {
            model: UserBand,
            required: true,
            include: [
                {
                    model: Band,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    },
                    where: {
                        idband: req.params.idband
                    }
                },
                {
                    model: Instrument,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                }
            ],
            attributes: {
                exclude: ["createdAt", "updatedAt", "user_iduser", "band_idband", "iduser_band"]
            }
        }
    })
    .then(result => {
        res.json(
            result.map(user => {
                let parsedInstruments = []
                user.user_bands[0].instruments.map(i => {
                    parsedInstruments.push({
                        ...i.dataValues,
                        main_instrument: i.dataValues.user_band_instrument.main_instrument,
                        priority: i.dataValues.user_band_instrument.priority,
                        user_band_instrument: undefined
                    })
                })
                return {
                    ...user.dataValues,
                    role: user.user_bands[0].role,
                    instruments: parsedInstruments.sort((a, b) => a.priority - b.priority),
                    user_bands: undefined
                }
            })
        )
    })
    .catch(error => res.send(error).status(500))
})

/**
 * GET A USER WITH CONDITIONS OR ALL USERS
 * 
 * @swagger
 * /users/email/:email:
 *      get:
 *          summary: Get a list of all the users that belong to a band
 *          parameters:
 *              - in: query
 *                name: email
 *                required: false
 *                type: string
 *              - in: query
 *                name: idband
 *                required: false
 *                type: integer
 *              - in: query
 *                name: iduser
 *                required: false
 *                type: integer
 *              - in: query
 *                name: google_id
 *                required: false
 *                type: string
 *          produces:
 *              - application/json
*/
router.get('/', (req, res) => {
    if(Object.keys(req.query).length <= 0) {
        User.findAll(genericUserBody)
        .then(result => res.json(result))
        .catch(error => res.send(error).status(500))
    }
    else {
        let condition = {}
        if (req.query.email) condition = { ...condition, email: req.query.email }
        if (req.query.iduser) condition = { ...condition, iduser: req.query.iduser }
        if (req.query.google_id) condition = { ...condition, google_id: req.query.google_id }

        User.findOne({
            ...genericUserBody,
            where: condition
        })
        .then(result => {
            if (result) {
                let parsedBands = []
                result.user_bands.map(uB => {
                    parsedBands.push({...uB.band.dataValues, role: uB.role })
                })
                res.json({...result.dataValues, user_bands: undefined, bands: parsedBands})
            }
            else res.json("User not found").status(404)
        })
        .catch(error => res.send(error).status(500))
    }
})

/**
 * CREATE USER
 *
 * @swagger
 * /users:
 *      post:
 *          summary: Create a new user or return it in case it already exists
 *          requestBody:
 *              description: Info about user to find/create
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              email:
 *                                  required: true
 *                                  type: string
 *                                  example: Si + Transport
 *                              name:
 *                                  required: false
 *                                  type: integer
 *                                  example: "Isaac Prats Renart"
 *          produces:
 *              - application/json
 */
router.post('/', (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        },
        include: [
            {
                model: Band,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                through: {
                    attributes: []
                },
                include: [
                    {
                        model: UserBand,
                        include: {
                            model: Instrument,
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            },
                        }
                    },
                    {
                        model: Song,
                        attributes: {
                            exclude: ["createdAt", "updatedAt", "band_idband"]
                        }
                    }
                ]
            }
        ],
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        }
    })
    .then(user => {
        if (user == null){
            return Band.findOne({
                where: {
                    email: req.body.email
                },
                include: [
                    {
                        model: Instrument,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: User,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                        include: {
                            model: UserBand,
                            include: {
                                model: Instrument,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                            }
                        }
                    },
                    {
                        model: Song,
                        attributes: {
                            exclude: ["createdAt", "updatedAt", "band_idband"]
                        }
                    }
                ],
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            })
            .then(band => {
                const parseBand = band => {
                    return {
                        ...band.dataValues,
                        users: band.dataValues.users.map(user => {
                            return {
                                ...user.dataValues,
                                role: user.dataValues.user_band.role,
                                user_bands: undefined,
                                user_band: undefined
                            }
                        }),
                        instruments: band.instruments.map(instrument => {
                            return {
                                ...instrument.dataValues,
                                quantity: instrument.dataValues.band_instrument.quantity,
                                main_instrument: instrument.dataValues.band_instrument.main_instrument,
                                user_band_instrument: undefined
                            }
                        })
                    }
                }
                if (band == null)
                    return User.create({...req.body, google_id: req.body.id})
                else {
                    return band.google_id == null || band.google_id != req.body.id
                        ? band.update({ google_id: req.body.id }).then(band => parseBand(band))
                        : parseBand(band)
                }
            })
        }
        else {
            return {
                ...user.dataValues,
                bands: user.bands.map(band => {
                    let user_band = band.user_bands.filter(uB => uB.user_iduser == user.iduser)[0]
                    return {
                        ...band.dataValues,
                        role: user_band.role,
                        user_bands: undefined,
                        instruments: user_band.instruments.map(instrument => { return { ...instrument.dataValues, main_instrument: instrument.dataValues.user_band_instrument.main_instrument, user_band_instrument: undefined }})
                    }
                })
            }
        }
    })
    .then(result => res.json(result))
    .catch(error => res.send(error).status(500))
})

/**
 * ASSIGN USER TO A BAND
 *
 * @swagger
 * /users/assign/user/:iduser/band/:idband:
 *      post:
 *          summary: Assign an existing user to an existing band
 *          requestBody:
 *              description: The id of both the user and the band you want to relate
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              iduser:
 *                                  type: integer
 *                                  example: 1
 *                              idband:
 *                                  type: integer
 *                                  example: 1
 *          produces:
 *              - application/json
 */
router.post('/assignBand', (req, res) => {
    BandHasUser.create({
        user_iduser: req.body.iduser,
        band_idband: req.body.idband,
        role: "Member"
    })
    .then(result => res.json(result))
    .catch(error => res.send(error).status(500))
})

router.put('/:google_id', (req, res) => {
    let update = {
        name: req.body.name || undefined,
        dni: req.body.dni || undefined,
        birth_date: req.body.birth_date || undefined,
        profile_photo: req.body.profile_photo || undefined,
    }

    User.update(update, {
        where: {
            google_id: req.params.google_id
        }
    })
    .then(_ => res.json("Correctly Updated").status(200))
    .catch(error => res.send(error).status(500))
})

module.exports = router;