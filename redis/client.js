
const Redis = require('ioredis');
const client = new Redis();


function _multi(){
    return client.multi();
}

/**
 *
 * @param multi
 * @param {function} multi.exec
 * @return {Promise<*>}
 */
async function exec(multi){
    return new Promise((res, rej) =>{
        multi.exec((e, d) => e? rej(e) : res(d));
    })
}

module.exports = {
    client,
    exec,
    get multi(){
        return _multi()
    }
};



