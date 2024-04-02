'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const loadController = require('../../controllers/loadController');
const boatController = require('../../controllers/boatController');
const jwtFunctions = require('../../controllers/jwtFunctions');

const app = express();
app.use(bodyParser.json());
const router = express.Router();


router.put('/', async function (req, res) {
    res.status(405).json({"Error": 'PUT and DELETE on whole database is not supported'});
});
router.delete('/', async function (req, res) {
    res.status(405).json({"Error": 'PUT and DELETE on whole database is not supported'});
});

router.post('/', jwtFunctions.checkJwt, function (req, res) {
    if (!req.user) {
        return res.status(401).json({"Error": 'Missing or invalid jwt'});
    }
    // content-type header
    if (req.get('content-type') !== 'application/json') {
        res.status(415).json({"Error": 'Server only accepts application/json data'});
    // accept header
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    } else if (req.body.hasOwnProperty('name') && req.body.hasOwnProperty('type') && req.body.hasOwnProperty('length')) {
        var name = req.body.name;
        var type = req.body.type;
        var length = req.body.length;
        var owner = req.user.sub;
        boatController.post_boat(name, type, length, owner)
            .then(key => {
                res.status(201).json(
                    {
                        "id": key.id,
                        "name": name,
                        "type": type,
                        "length": length,
                        "loads": [],
                        "owner": owner,
                        "self": req.protocol + "://" + req.get("host") + req.baseUrl + "/" + key.id
                    }
                )
            });
    // body contents
    } else {
        res.status(400).json({"Error":  "The request object is missing at least one of the required attributes"});
    }
});

router.get('/:boat_id', jwtFunctions.checkJwt, function (req, res) {
    if (!req.user) {
        return res.status(401).json({"Error": 'Missing or invalid jwt'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    }
    const uid = req.user.sub;
    const id = req.params.boat_id;
    boatController.get_boat(id)
        .then(async boat => {
            if (boat[0] === undefined || boat[0] === null) {
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else if (boat[0].owner !== uid) {
                res.status(403).json({"Error": "Boat is owned by different owner"});
            } else {
                boat[0].self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.boat_id;
                res.status(200).json(boat[0]);
            }
        })
});

router.get('/', jwtFunctions.checkJwt, function (req, res) {
    // owner is null if there is no req.user
    const owner = req.user ? req.user.sub : null;
    if (owner === null) {
        return res.status(401).json({"Error": 'Missing or invalid jwt'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    }
    const boats = boatController.get_boats(req, owner)
        .then((boats) => {
            res.status(200).json(boats);
        });
});

router.put('/:boat_id', jwtFunctions.checkJwt, function (req, res) {
    if (!req.user) {
        return res.status(401).json({"Error": 'Missing or invalid jwt'});
    } else if (req.get('content-type') !== 'application/json') {
        res.status(415).json({"Error": 'Server only accepts application/json data'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    } else if (req.params.boat_id === "null") {
        res.status(404).json({"Error": "No boat with this boat_id exists"});
    } else {
        boatController.get_boat(req.params.boat_id)
            .then(async boat => {
                if (boat[0] === undefined || boat[0] === null) {
                    res.status(404).json({"Error": "No boat with this boat_id exists"});
                } else if (boat[0].owner !== req.user.sub) {
                    res.status(403).json({"Error": "Boat is owned by different owner"});
                } else {
                    if (req.body.hasOwnProperty('name') && req.body.hasOwnProperty('type') && req.body.hasOwnProperty('length')) {
                        var name = req.body.name;
                        var type = req.body.type;
                        var length = req.body.length;
                        var owner = req.user.sub;
                        
                        boatController.put_boat(req.params.boat_id, name, type, length, owner)
                        .then(key => {
                            const self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.boat_id;
                            res.location(self);
                            res.status(303).json(
                                {
                                    "id": req.params.boat_id,
                                    "name": name,
                                    "type": type,
                                    "length": length,
                                    "loads": [],
                                    "owner": owner,
                                    "self": req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.boat_id
                                }
                            );
                        });

                    } else {
                        res.status(400).json({"Error": "The request object is missing at least one of the required attributes"});
                    }
                }
            })
    }
});


router.patch('/:boat_id', jwtFunctions.checkJwt, function (req, res) {
    if (!req.user) {
        return res.status(401).json({"Error": 'Missing or invalid jwt'});
    } else if (req.get('content-type') !== 'application/json') {
        res.status(415).json({"Error": 'Server only accepts application/json data'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    } else if (req.params.boat_id === "null") {
        res.status(404).json({"Error": "No boat with this boat_id exists"});
    } else if (req.body.hasOwnProperty('id')) {
        res.status(400).json({"Error": "boat_id cannot be patched"});
    } else {
        boatController.get_boat(req.params.boat_id)
        .then(async boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // no boat with id
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else if (boat[0].owner !== req.user.sub) {
                res.status(403).json({"Error": "Boat is owned by different owner"});
            } else {
                boatController.patch_boat(req.params.boat_id, req, boat)
                .then(async key => {
                    var self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + req.params.boat_id;
                    res.location(self);
                    let boat = await boatController.get_boat(req.params.boat_id);
                    boat[0].self = self;
                    res.status(303).json(boat[0]);
                });
                
            }
        })
    }
});

router.put('/:boat_id/loads/:load_id', jwtFunctions.checkJwt, function (req, res) {
    if (!req.user) {
        return res.status(401).json({"Error": 'Missing or invalid jwt'});
    } 
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
                        } else if (boat[0].owner !== req.user.sub) {
                            res.status(403).json({"Error": "Boat is owned by different owner"});
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

router.delete('/:boat_id/loads/:load_id', jwtFunctions.checkJwt, function (req, res) {
    if (!req.user) {
        return res.status(401).json({"Error": 'Missing or invalid jwt'});
    }
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
                        } else if (boat[0].owner !== req.user.sub) {
                            res.status(403).json({"Error": "Boat is owned by different owner"});
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

router.delete('/:boat_id', jwtFunctions.checkJwt, function (req, res) {
    if (!req.user) {
        return res.status(401).json({"Error": 'Missing or invalid jwt'});
    }
    boatController.get_boat(req.params.boat_id)
        .then(async boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // no boat with id
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else if (boat[0].owner !== req.user.sub) {
                res.status(403).json({"Error": "Boat is owned by different owner"});
            } else {
                // found boat with id
                await boatController.delete_boat(req.params.boat_id)
                    .then(res.status(204).end());
            }
        })
});

router.get('/:boat_id/loads', jwtFunctions.checkJwt, function (req, res) {
    if (!req.user) {
        return res.status(401).json({"Error": 'Missing or invalid jwt'});
    } else if (!req.accepts(['application/json'])) {
        res.status(406).json({"Error": 'Server only responds in application/json data'});
    }
    boatController.get_boat(req.params.boat_id)
        .then(boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // no boat with id
                res.status(404).json({"Error": "No boat with this boat_id exists"});
            } else if (boat[0].owner !== req.user.sub) {
                res.status(403).json({"Error": "Boat is owned by different owner"});
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