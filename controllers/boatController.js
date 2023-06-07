'use strict';

const { Datastore } = require('@google-cloud/datastore');
const helpers = require('./helpers');

const datastore = new Datastore({
    projectId: '???a4-rest-api???',
  });
const BOAT = "Boat";
const LOAD = "Load";

// as to avoid circular require
function get_load(id) {
    const key = helpers.getKey(datastore, LOAD, id);
    return datastore.get(key).then(entity => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            return entity.map(helpers.fromDatastore);
        }
    });
}
// Begin boat Model Functions
function post_boat(name, type, length) {
    var key = datastore.key(BOAT);
    const new_boat = {
        "name": name,
        "type": type,
        "length": length,
        "loads": []
    }
    return datastore.save({
        "key": key,
        "data": new_boat
    }).then(() => { return key });
}

function get_boat(id) {
    const key = helpers.getKey(datastore, BOAT, id);
    return datastore.get(key).then(entity => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            return entity.map(helpers.fromDatastore);
        }
    });
}

function get_boats(req) {
    // 3 per page
    var query = datastore.createQuery(BOAT).limit(3);
    const results = {};
    if(Object.keys(req.query).includes("cursor")) {
        query = query.start(req.query.cursor);
    }
    return datastore.runQuery(query).then(entities => {
        // id attribute added to all entities[0]
        results.boats = entities[0].map(helpers.fromDatastore);
        if (entities[1].moreResults !== datastore.NO_MORE_RESULTS) {
            results.next =  req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
        }
        return results;
    }).catch(err => {
        console.error('Error retrieving boats:', err);
    });
}

async function put_load_in_boat(req, boat_id, load_id) {
    const boat_key = helpers.getKey(datastore, BOAT, boat_id);
    const load_key = helpers.getKey(datastore, LOAD, load_id);

    const boat = await datastore.get(boat_key);

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
    datastore.get(load_key).then(entity => {
        entity[0].carrier = load_carrier_data;
        const data = {
            key: load_key,
            data: entity[0]
        }
        return datastore.upsert(data)
    });
    // update boat loads
    return datastore.get(boat_key).then(entity => {
        // delete
        if (typeof(entity[0].loads) === 'undefined') {
            entity[0].loads = [];
        }

        entity[0].loads.push(boat_load_data);
        const data = {
            key: boat_key,
            data: entity[0]
        }
        return datastore.upsert(data);
    });
}

async function delete_load_from_boat(boat_id, load_id) {
    const boat_key = helpers.getKey(datastore, BOAT, boat_id);
    const load_key = helpers.getKey(datastore, LOAD, load_id);

    const boat = await datastore.get(boat_key);

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
    datastore.get(load_key).then(entity => {
        entity[0].carrier = load_carrier_data;
        const data = {
            key: load_key,
            data: entity[0]
        }
        return datastore.upsert(data)
    });
    // update boat loads
    return datastore.get(boat_key).then(entity => {

        entity[0].loads = boat_load_data;
        const data = {
            key: boat_key,
            data: entity[0]
        }
        return datastore.upsert(data);
    });
}


async function delete_boat(id) {
    
    const key = helpers.getKey(datastore, BOAT, id);
    const boat = await datastore.get(key);
    
    if (boat[0].loads.length !== 0) {
        for (var i of boat[0].loads) {
            await delete_load_from_boat(id, i.id);
        }
    }
    return datastore.delete(key);
}

function get_boat_loads(req, id) {
    const key = helpers.getKey(datastore, BOAT, id);
    return datastore.get(key).then(async entity => {
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

module.exports = {
    post_boat,
    get_boat,
    get_boats,
    put_load_in_boat,
    delete_load_from_boat,
    delete_boat,
    get_boat_loads
}