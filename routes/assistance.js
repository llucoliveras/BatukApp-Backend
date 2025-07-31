const express = require('express');
const router = express.Router();
const Assistance = require('../classes/Assistance')

// TO GET ANSWER ENUM VALUES USE <Assistance.rawAttributes.answer.values>

/**
 * PUT ASSISTANCE FROM A USER IN AN EVENT
 * 
 * @swagger
 * /events/:idband/date/:month:
 *      put:
 *          summary: Modify the assistance and/or the instrument of a user in an event
 *          parameters:
 *              - in: path
 *                name: idband
 *                required: true
 *                type: integer
 *                description: The ID from the band which you want to retrive the events from
 *              - in: path
 *                name: month
 *                required: true
 *                type: integer
 *                description: The month from the events you want to search
 *          requestBody:
 *              description: Info about user assistance
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              answer:
 *                                  type: string
 *                                  example: Si + Transport
 *                              idinstrument:
 *                                  type: integer
 *                                  example: 7
 *          produces:
 *              - application/json
 */
router.post('/:idevent', (req, res) => {
    if (Array.isArray(req.body)) {
        let promises = []

        req.body.map(data => {
            if (data.answer != null)
                promises.push(
                    Assistance.findOne({
                        where: {
                            user_iduser: data.iduser,
                            event_idevent: req.params.idevent
                        }
                    })
                    .then(assistance => {
                        let assistanceData = {
                            answer: data.answer,
                            user_iduser: data.iduser,
                            event_idevent: req.params.idevent,
                            instrument_idinstrument: data.idinstrument || undefined
                        }

                        assistance == null
                            ? Assistance.create(assistanceData)
                            : assistance.update(assistanceData)
                    })
                )
        })

        Promise.all(promises)
        .then(result => res.json(result).status(200))
        .catch(error => res.send(error).status(500))
    }
    else {
        if (req.body.answer != null) {
            Assistance.findOne({
                where: {
                    user_iduser: req.body.iduser,
                    event_idevent: req.params.idevent
                }
            })
            .then(assistance => {
                let assistanceData = {
                    answer: req.body.answer,
                    user_iduser: req.body.iduser,
                    event_idevent: req.params.idevent,
                    instrument_idinstrument: req.body.idinstrument || null
                }

                return assistance == null
                    ? Assistance.create(assistanceData)
                    : assistance.update(assistanceData)
            })
            .then(result => res.json(result).status(200))
            .catch(error => res.send(error).status(500))
        }
        else res.send("The request's body needs a 'answer' attribute").send(500)
    }
})

router.get('/responses', (_req, res) => {
    res.json(Assistance.rawAttributes.answer.values)
})

module.exports = router