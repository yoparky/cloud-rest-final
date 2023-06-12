'use strict';

const config = require('../config');
const helpers = require('./helpers');

function post_user(uid, nickname) {
    var key = config.datastore.key(config.USER);
    const new_user = {
        "uid": uid,
        "nickname": nickname
    }
    return config.datastore.save({
        "key": key,
        "data": new_user
    }).then(() => { return key });
}

async function get_user(uid) {
    const query = config.datastore
    .createQuery(config.USER)
    .filter('uid', '=', uid);

    const [users] = await config.datastore.runQuery(query);
    return users;
}

function get_users(req) {
    // 5 per page
    var query = config.datastore.createQuery(config.USER).limit(5);
    const results = {};
    if(Object.keys(req.query).includes("cursor")) {
        query = query.start(req.query.cursor);
    }
    return config.datastore.runQuery(query).then(entities => {
        // id attribute added to all entities[0]
        console.log(entities);
        results.count = entities[0].length;
        results.users = entities[0].map(helpers.fromDatastore);
        if (entities[1].moreResults !== config.datastore.NO_MORE_RESULTS) {
            results.next =  req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
        }
        return results;
    }).catch(err => {
        console.error('Error retrieving users:', err);
    });
}

module.exports = {
    post_user,
    get_user,
    get_users
}