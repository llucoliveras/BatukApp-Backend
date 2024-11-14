const express = require('express');
const router = express();
const Song = require('../classes/Song');
const User = require('../classes/User');
const Band = require('../classes/Band');

/**
 * GET A SONG BY BAND ID
 * 
 * @swagger
 * /songs/:idband:
 *      get:
 *          summary: Get a list of all the songs that belong to a band
 *          parameters:
 *              - in: path
 *                name: idband
 *                required: true
 *                type: integer
 *                description: The ID from the band you want to retrive the songs from
 *          produces:
 *              - application/json
 */
router.get('/', (req, res) => {
    const getGenericSongs = conditions => {
        Song.findAll({
            where: conditions,
            attributes: {
                exclude: ["createdAt", "updatedAt", "band_idband"]
            }
        })
        .then(result => res.json(result))
        .catch(error => res.send(error).status(500))
    }

    if (req.query.idsong) {
        Song.findOne({ where: { idsong: req.query.idsong }, attributes: { exclude: ["createdAt", "updatedAt", "band_idband"] } })
        .then(result => res.json(result))
        .catch(error => res.send(error).status(500))
    }
    else if (req.query.iduser) {
        User.findOne({ where: { iduser: req.query.iduser }, include: Band })
        .then(user => getGenericSongs({band_idband: user.dataValues.bands.map(b => b.idband).filter(idband => req.query.idband ? req.query.idband == idband : true)}))
    }
    else getGenericSongs(req.query.idband ? { band_idband: req.query.idband } : {})
})

module.exports = router