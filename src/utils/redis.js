"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
var ioredis_1 = require("ioredis");
// Create a new Redis instance.
// The options object directly uses the environment variables.
var redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    // Adding a simple retry strategy is good practice for containerized apps.
    retryStrategy: function (times) {
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
});
exports.redis = redis;
redis.on('error', function (error) {
    console.error('Redis connection error:', error);
});
redis.on('connect', function () {
    console.log('Successfully connected to Redis');
});
