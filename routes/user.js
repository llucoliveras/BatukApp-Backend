const express = require('express');
const router = express.Router();
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
                    model: Instrument,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
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
 *          produces:
 *              - application/json
*/
router.get('/', (req, res) => {
    console.log("🔍 Query parameters:", req.query);
    if(Object.keys(req.query).length <= 0) {
        User.findAll(genericUserBody)
        .then(result => res.json(result))
        .catch(error => res.send(error).status(500))
    }
    else {
        let condition = {}
        if (req.query.email) condition = { ...condition, email: req.query.email }
        if (req.query.iduser) condition = { ...condition, iduser: req.query.iduser }

        User.findOne({
            ...genericUserBody,
            where: condition
        })
        .then(result => {
            if (result) {
                let parsedBands = []

                result.bands.map(band => {
                    let bandData = {
                        ...band.dataValues,
                        user_bands: (band.dataValues.user_band.dataValues.role === 'Member') ? undefined : band.dataValues.user_bands.dataValues,
                        user_band: { iduser_band: band.dataValues.user_band.dataValues.iduser_band, role: band.dataValues.user_band.dataValues.role}
                    }
                    parsedBands.push(bandData)
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
                if (band == null)
                    return User.create({...req.body})
                else {
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
                                    priority: instrument.dataValues.band_instrument.priority,
                                    user_band_instrument: undefined
                                }
                            })
                        }
                    }
                    return parseBand(band)
                }
            })
        }
        else {
            const parseUser = user => {
                return {
                    ...user.dataValues,
                    bands: user.bands.map(band => {
                        let user_band = band.user_bands.filter(uB => uB.user_iduser == user.iduser)[0]
                        return {
                            ...band.dataValues,
                            role: user_band.role,
                            user_bands: undefined,
                            instruments: user_band.instruments.map(instrument => { return { ...instrument.dataValues, priority: instrument.dataValues.user_band_instrument.priority, user_band_instrument: undefined }})
                        }
                    })
                }
            }
            return parseUser(user)
        }
    })
    .then(result => res.json(result))
    .catch(error => res.send(error).status(500))
})

router.put('/:iduser', (req, res) => {
    User.update({
        name: req.body.name,
        email: req.body.email,
        birth_date: req.body.birth_date,
        profile_picture: req.body.profile_picture
    }, {
        where: {
            iduser: req.params.iduser
        }
    })
    .then(() => {
        return User.findOne({
            where: {
                iduser: req.params.iduser
            },
            include: {
                model: UserBand,
                include: {
                    model: Instrument,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                }
            },
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            }
        })
    })
    .then(result => {
        if (result) {
            let parsedBands = []
            result.bands.map(band => {
                let bandData = {
                    ...band.dataValues,
                    user_bands: (band.dataValues.user_band.dataValues.role === 'Member') ? undefined : band.dataValues.user_bands.dataValues,
                    user_band: { iduser_band: band.dataValues.user_band.dataValues.iduser_band, role: band.dataValues.user_band.dataValues.role}
                }
                parsedBands.push(bandData)
            })
            res.json({...result.dataValues, user_bands: undefined, bands: parsedBands})
        }
        else res.json("User not found").status(404)
    })
    .catch(error => res.send(error).status(500))
})

module.exports = router;