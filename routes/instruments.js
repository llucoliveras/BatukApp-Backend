const express = require('express');
const router = express.Router();
const Instrument = require('../classes/Instrument');
const Band = require('../classes/Band');
const BandInstrument = require('../classes/BandInstrument');

router.get("/:idband", (req, res) => {
    Instrument.findAll({
        include: [
            {
                model: Band,
                where: {
                    idband: req.params.idband
                }
            }
        ],
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        }
    })
    .then(result => res.json(result.map(r => { return { ...r.dataValues, quantity: r.bands[0].band_instrument.quantity, bands: undefined } })))
    .catch(error => res.send(error).status(500))
})

router.get("/", (req, res) => {
    Instrument.findAll({
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        }
    })
    .then(result => res.json(result))
    .catch(error => res.send(error).status(500))
})

module.exports = router