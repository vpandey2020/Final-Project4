const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();

// console.log(process.env.REDIS_PORT)
// const redisClient = redis.createClient(
//   16272,
//   "redis-16272.c270.us-east-1-3.ec2.cloud.redislabs.com",
//   { no_ready_check: true }
// );
// redisClient.auth("YxXeB3X3LQs5mWpQPhh7blyl6RpvOzTO", function (err) {
//   if (err) throw err;
// });

const redisClient = redis.createClient(
    process.env.REDIS_PORT,
    process.env.REDIS_URI,
    {
        no_ready_check: true
    }
);

redisClient.auth(process.env.REDIS_PASSWORD, (error) => {
    if (error) throw error;
});

redisClient.on('connect', async () => {
    console.log("Radis is connected !");
});

// connection setup of redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
//const MSET_ASYNC = promisify(redisClient.MSET).bind(redisClient);

module.exports = {
    SET_ASYNC,
    GET_ASYNC
}