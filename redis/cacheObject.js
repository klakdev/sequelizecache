
const {/*Redis*/ client, exec} = require('./client');

const VALIDITY_KEY = 'valid';
const ENTREE = 'cache';
const VALID = true, INVALID = false;

const keys = {
    object: (domain, id) => `${ENTREE}:${domain}:${id}`,
    validity: (domain) => `${ENTREE}:${VALIDITY_KEY}:${domain}`,
};

/**
 *
 * @param {String} domain - domain name of cached object
 * @param {String |int} id - primary key for cached object
 * @param {Object} object - object to be cached
 * @return {Promise<boolean>} - was caching successful
 */
async function cacheObject(domain, id, object){
    const serializedObject =  JSON.stringify(object);
    let res = client.multi()
        .set(keys.object(domain), serializedObject)
        .hmset(keys.validity(domain), id, VALID)
        .exec();
    return true;
}

/**
 *
 * @param domain
 * @param id
 * @return {Promise<boolean>}
 */
async function invalidateObject(domain, id){
    let res = client.set(keys.validity(domain), id, INVALID);
    return true;
}

async function isValid(domain, id){
    return await client.get(keys.validity(domain), id);
}

/**
 *
 * @param domain
 * @param id
 * @return {Promise<*>}
 */
async function getCachedObject(domain, id){
    let valid = await isValid(domain, id);
    if(!valid) return null;
    return await client.get(keys.object(domain, id))
}