"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var redis_1 = require("../src/utils/redis");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var CHUNK_SIZE = 2000;
var CACHE_TTL = 7 * 24 * 60 * 60; // 7 days
var SHOPIFY_ORDERS_TABLE = process.env.SHOPIFY_ORDERS_TABLE;
function fetchAllOrders() {
    return __awaiter(this, void 0, void 0, function () {
        var client, docClient, lastEvaluatedKey, allOrders, command, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION });
                    docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
                    lastEvaluatedKey = undefined;
                    allOrders = [];
                    _a.label = 1;
                case 1:
                    command = new lib_dynamodb_1.ScanCommand({
                        TableName: SHOPIFY_ORDERS_TABLE,
                        Limit: 1000,
                        ExclusiveStartKey: lastEvaluatedKey,
                    });
                    return [4 /*yield*/, docClient.send(command)];
                case 2:
                    response = _a.sent();
                    allOrders.push.apply(allOrders, (response.Items || []));
                    lastEvaluatedKey = response.LastEvaluatedKey;
                    console.log("Fetched ".concat(allOrders.length, " orders so far..."));
                    _a.label = 3;
                case 3:
                    if (lastEvaluatedKey) return [3 /*break*/, 1];
                    _a.label = 4;
                case 4: return [2 /*return*/, allOrders];
            }
        });
    });
}
function warmOrdersCache() {
    return __awaiter(this, void 0, void 0, function () {
        var allOrders, chunkCount, i, chunk, chunkKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting cache warming for Shopify orders...');
                    return [4 /*yield*/, fetchAllOrders()];
                case 1:
                    allOrders = _a.sent();
                    console.log("Fetched total ".concat(allOrders.length, " orders from DynamoDB."));
                    chunkCount = 0;
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < allOrders.length)) return [3 /*break*/, 5];
                    chunk = allOrders.slice(i, i + CHUNK_SIZE);
                    chunkKey = "shopify_orders:chunk:".concat(i / CHUNK_SIZE);
                    return [4 /*yield*/, redis_1.redis.set(chunkKey, JSON.stringify(chunk), 'EX', CACHE_TTL)];
                case 3:
                    _a.sent();
                    chunkCount++;
                    console.log("Stored chunk ".concat(chunkKey, " with ").concat(chunk.length, " orders."));
                    _a.label = 4;
                case 4:
                    i += CHUNK_SIZE;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("Cache warming complete. Total chunks: ".concat(chunkCount));
                    return [2 /*return*/];
            }
        });
    });
}
warmOrdersCache().then(function () { return process.exit(0); }).catch(function (err) {
    console.error('Error warming cache:', err);
    process.exit(1);
});
