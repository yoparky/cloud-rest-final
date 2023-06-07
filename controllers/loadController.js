'use strict';

//const { Datastore } = require('@google-cloud/datastore');
const helpers = require('./helpers');
const boatController = require('./boatController');
const config = require('../config');

// const datastore = new Datastore({
//     projectId: 'a9-portfolio',
//   });
const LOAD = "Load";

function post_load(volume, item, creation_date) {
    var key = config.datastore.key(config.LOAD);
    const new_load = {
        "volume": volume,
        "carrier": null,
        "item": item,
        "creation_date": creation_date
    }
    return config.datastore.save({
        "key": key,
        "data": new_load
    }).then(() => { return key });
}

function get_load(id) {
    const key = helpers.getKey(config.datastore, config.LOAD, id);
    return config.datastore.get(key).then(entity => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            return entity.map(helpers.fromDatastore);
        }
    });
}

function get_loads(req) {
    var query = config.datastore.createQuery(config.LOAD).limit(3);
    const results = {};
    if(Object.keys(req.query).includes("cursor")) {
        query = query.start(req.query.cursor);
    }
    return config.datastore.runQuery(query).then(entities => {
        // id attribute added to all entities[0]
        results.loads = entities[0].map(helpers.fromDatastore);
        if (entities[1].moreResults !== config.datastore.NO_MORE_RESULTS) {
            results.next =  req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
        }
        return results;
    }).catch(err => {
        console.error('Error retrieving loads:', err);
    });
}

async function delete_load(id) {
    const key = helpers.getKey(config.datastore, config.LOAD, id);
    const load = await config.datastore.get(key);
    
    if (load[0].carrier !== null) {
        await boatController.delete_load_from_boat(load[0].carrier.id, id);
    }
    return config.datastore.delete(key);
}

module.exports = {
    post_load,
    get_load,
    get_loads,
    delete_load
}