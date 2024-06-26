'use strict';

const helpers = require('./helpers');
const config = require('../config');

const BOAT = config.BOAT;
const LOAD = config.LOAD;

// as to avoid circular require
function get_load(id) {
    const key = helpers.getKey(config.datastore, LOAD, id);
    return config.datastore.get(key).then(entity => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            return entity.map(helpers.fromDatastore);
        }
    });
}

function post_boat(name, type, length, owner) {
    // gen datastore key for entity of kind BOAT
    var key = config.datastore.key(BOAT);
    const new_boat = {
        "name": name,
        "type": type,
        "length": length,
        "loads": [],
        "owner": owner
    }
    return config.datastore.save({
        "key": key,
        "data": new_boat
    }).then(() => { return key });
}

function get_boat(id) {
    const key = helpers.getKey(config.datastore, BOAT, id);
    return config.datastore.get(key).then(entity => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            return entity.map(helpers.fromDatastore);
        }
    });
}

function get_boats(req, owner) {
    // 5 per page
    const query = config.datastore.createQuery(config.BOAT)
        .filter('owner', '=', owner)
        .limit(5);
    const results = {};
    // check if request contains a cursor in query param. Continues to next cursor if it does
    if(Object.keys(req.query).includes("cursor")) {
        query = query.start(req.query.cursor);
    }
    return config.datastore.runQuery(query).then(entities => {
        // id attribute added to all entities[0]
        results.count = entities[0].length;
        results.boats = entities[0].map(helpers.fromDatastore);
        if (entities[1].moreResults !== config.datastore.NO_MORE_RESULTS) {
            // append next cursor if there are more than 5 entities
            results.next =  req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
        }
        return results;
    }).catch(err => {
        console.error('Error retrieving boats:', err);
    });
}

async function put_load_in_boat(req, boat_id, load_id) {
    const boat_key = helpers.getKey(config.datastore, BOAT, boat_id);
    const load_key = helpers.getKey(config.datastore, LOAD, load_id);

    const boat = await config.datastore.get(boat_key);

    const load_carrier_data = {
        id: boat_id,
        name: boat[0].name,
        self: req.protocol + "://" + req.get("host") + "/boats/" + boat_id
    }
    const boat_load_data = {
        id: load_id,
        self: req.protocol + "://" + req.get("host") + "/loads/" + load_id
    }
    // update load carrier
    config.datastore.get(load_key).then(entity => {
        entity[0].carrier = load_carrier_data;
        const data = {
            key: load_key,
            data: entity[0]
        }
        return config.datastore.upsert(data)
    });
    // update boat loads
    return config.datastore.get(boat_key).then(entity => {
        // delete
        if (typeof(entity[0].loads) === 'undefined') {
            entity[0].loads = [];
        }

        entity[0].loads.push(boat_load_data);
        const data = {
            key: boat_key,
            data: entity[0]
        }
        return config.datastore.upsert(data);
    });
}

async function delete_load_from_boat(boat_id, load_id) {
    const boat_key = helpers.getKey(config.datastore, BOAT, boat_id);
    const load_key = helpers.getKey(config.datastore, LOAD, load_id);

    const boat = await config.datastore.get(boat_key);

    const load_carrier_data = null;
    const boat_load_data = [];
    if (boat[0].loads.length !== 0) {
        for (var i of boat[0].loads) {
            if (i.id !== load_id) {
                boat_load_data.push(i)
            }
        }
    }
    // update load carrier
    config.datastore.get(load_key).then(entity => {
        entity[0].carrier = load_carrier_data;
        const data = {
            key: load_key,
            data: entity[0]
        }
        return config.datastore.upsert(data)
    });
    // update boat loads
    return config.datastore.get(boat_key).then(entity => {

        entity[0].loads = boat_load_data;
        const data = {
            key: boat_key,
            data: entity[0]
        }
        return config.datastore.upsert(data);
    });
}

async function delete_boat(id) {
    
    const key = helpers.getKey(config.datastore, BOAT, id);
    const boat = await config.datastore.get(key);
    
    if (boat[0].loads.length !== 0) {
        for (var i of boat[0].loads) {
            await delete_load_from_boat(id, i.id);
        }
    }
    return config.datastore.delete(key);
}

function get_boat_loads(req, id) {
    const key = helpers.getKey(config.datastore, BOAT, id);
    return config.datastore.get(key).then(async entity => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            var res = [];
            const loadList = entity.map(helpers.fromDatastore)[0].loads;

            for (var l of loadList) {
                await get_load(l.id).then(load => {
                    res.push({
                        id: load[0].id,
                        item: load[0].item,
                        creation_date: load[0].creation_date,
                        volume: load[0].volume,
                        self: req.protocol + "://" + req.get("host") + "/loads/" + l.id
                    });
                });
            }
            return {loads: res};
        }
    });
}

function patch_boat(id, req, boat) {
    const key = helpers.getKey(config.datastore, BOAT, id);
    const body = req.body;

    for (const property in body) {
        if (property in boat[0] && property !== 'id') {
            boat[0][property] = body[property];
        }
    }
    return config.datastore.save({
        "key": key,
        "data": boat[0]
    });
}

// put will reset loads
function put_boat(id, name, type, length, owner) {
    const key = helpers.getKey(config.datastore, BOAT, id);
    const edit_boat = {
        "name": name,
        "type": type,
        "length": length,
        "loads": [],
        "owner": owner
    }
    return config.datastore.save({
        "key": key,
        "data": edit_boat
    });
}

module.exports = {
    post_boat,
    get_boat,
    get_boats,
    put_load_in_boat,
    delete_load_from_boat,
    delete_boat,
    get_boat_loads,
    patch_boat,
    put_boat
}