'use strict';

const { Datastore } = require('@google-cloud/datastore');

// Modifies a Datastore entity object to include its ID as a direct property of the object. 
function fromDatastore(item) {
    item.id = item[Datastore.KEY].id;
    return item;
}
// constructs and returns a Datastore key using the provided kind and id. 
// This key uniquely identifies an entity in Datastore for easy retreival of entry
function getKey(datastore, kind, id) {
    return datastore.key([kind, parseInt(id, 10)]);
}

module.exports = {
    fromDatastore,
    getKey
}