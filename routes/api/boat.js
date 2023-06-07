'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const loadController = require('../../controllers/loadController');
const boatController = require('../../controllers/boatController');

const app = express();
app.use(bodyParser.json());
const router = express.Router();

router.post('/', function (req, res) {
    if (req.body.hasOwnProperty('name') && req.body.hasOwnProperty('type') && req.body.hasOwnProperty('length')) {
        var name = req.body.name;
        var type = req.body.type;
        var length = req.body.length;
        boatController.post_boat(name, type, length)
            .then(key => {
                // consider doing a get and returning a json of the actual db status
                res.status(201).json(
                    {
                        "id": key.id,
                        "name": name,
                        "type": type,
                        "length": length,
                        "loads": [],
                        "self": req.protocol + "://" + req.get("host") + req.baseUrl + "/" + key.id
                    }
                )
            });
    } else {
        res.status(400).json({"Error":  "The request object is missing at least one of the required attributes"});
    }
});

router.get('/:boat_id', function (req, res) {
    boatController.get_boat(req.params.boat_id)
        .then(boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // no boat with id
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else {
                // found boat with id
                boat[0].self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.boat_id;
                res.status(200).json(boat[0]);
            }
        })
});

router.get('/', function (req, res) {
    const boats = boatController.get_boats(req)
        .then((boats) => {
            res.status(200).json(boats);
        });
});

router.put('/:boat_id/loads/:load_id', function (req, res) {
    loadController.get_load(req.params.load_id)
        .then(load => {
            if (load[0] === undefined || load[0] === null) {
                // no load with id
                res.status(404).json({"Error": "The specified boat and/or load does not exist"});
            } else {
                // found load with id
                boatController.get_boat(req.params.boat_id)
                    .then(boat => {
                        if (boat[0] === undefined || boat[0] === null) {
                            // no boat with id
                            res.status(404).json({"Error": "The specified boat and/or load does not exist"});
                        } else {
                            // found the boat with id
                            // load unassigned
                            if (load[0].carrier === null) {
                                boatController.put_load_in_boat(req, req.params.boat_id, req.params.load_id)
                                    .then(() => res.status(204).end());
                            } else {
                                res.status(403).json({"Error": "The load is already loaded on another boat"});
                            }
                        }
                    })
            }
        })
});

router.delete('/:boat_id/loads/:load_id', function (req, res) {
    loadController.get_load(req.params.load_id)
        .then(load => {
            if (load[0] === undefined || load[0] === null) {
                // no load with id
                res.status(404).json({"Error": "No boat with this boat_id is loaded with the load with this load_id"});
            } else {
                // found load with id
                boatController.get_boat(req.params.boat_id)
                    .then(boat => {
                        if (boat[0] === undefined || boat[0] === null) {
                            // no boat with id
                            res.status(404).json({"Error": "No boat with this boat_id is loaded with the load with this load_id"});
                        } else {
                            // found the boat with id
                            var found = false;
                            for (var l of boat[0].loads) {
                                if (l.id == req.params.load_id) {
                                    found = true;
                                }
                            }
                            if (found) {
                                boatController.delete_load_from_boat(req.params.boat_id, req.params.load_id)
                                    .then(() => res.status(204).end());
                            } else {
                                res.status(404).json({"Error": "No boat with this boat_id is loaded with the load with this load_id"});
                            }
                        }
                    })
            }
        })
});

router.delete('/:boat_id', function (req, res) {
    boatController.get_boat(req.params.boat_id)
        .then(async boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // no boat with id
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else {
                // found boat with id
                await boatController.delete_boat(req.params.boat_id)
                    .then(res.status(204).end());
            }
        })
});

router.get('/:boat_id/loads', function (req, res) {
    boatController.get_boat(req.params.boat_id)
        .then(boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // no boat with id
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else {
                // found boat with id
                boatController.get_boat_loads(req, req.params.boat_id)
                    .then(loads => {
                        res.status(200).json(loads);
                    });
            }
        })
});

module.exports = router;