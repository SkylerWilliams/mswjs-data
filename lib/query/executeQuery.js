"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.executeQuery = void 0;
var debug_1 = require("debug");
var glossary_1 = require("../glossary");
var compileQuery_1 = require("./compileQuery");
var iteratorUtils = __importStar(require("../utils/iteratorUtils"));
var paginateResults_1 = require("./paginateResults");
var sortResults_1 = require("./sortResults");
var outvariant_1 = require("outvariant");
var safeStringify_1 = require("../utils/safeStringify");
var log = (0, debug_1.debug)('executeQuery');
function queryByPrimaryKey(records, query) {
    log('querying by primary key');
    log('query by primary key', { query: query, records: records });
    var matchPrimaryKey = (0, compileQuery_1.compileQuery)(query);
    var result = iteratorUtils.filter(function (id, value) {
        var _a;
        var primaryKey = value[glossary_1.PRIMARY_KEY];
        (0, outvariant_1.invariant)(primaryKey, 'Failed to query by primary key using "%j": record (%j) has no primary key set.', query, value);
        return matchPrimaryKey((_a = {}, _a[primaryKey] = id, _a));
    }, records);
    log('result of querying by primary key:', result);
    return result;
}
/**
 * Execute a given query against a model in the database.
 * Returns the list of records that satisfy the query.
 */
function executeQuery(modelName, primaryKey, query, db) {
    var _a;
    log("".concat((0, safeStringify_1.safeStringify)(query), " on \"").concat(modelName, "\""));
    log('using primary key "%s"', primaryKey);
    var records = db.getModel(modelName);
    // Reduce the query scope if there's a query by primary key of the model.
    var _b = query.where || {}, _c = primaryKey, primaryKeyComparator = _b[_c], restQueries = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
    log('primary key query', primaryKeyComparator);
    var scopedRecords = primaryKeyComparator
        ? queryByPrimaryKey(records, {
            where: (_a = {}, _a[primaryKey] = primaryKeyComparator, _a)
        })
        : records;
    var result = iteratorUtils.filter(function (_, record) {
        var executeQuery = (0, compileQuery_1.compileQuery)({ where: restQueries });
        return executeQuery(record);
    }, scopedRecords);
    var resultJson = Array.from(result.values());
    log("resolved query \"".concat((0, safeStringify_1.safeStringify)(query), "\" on \"").concat(modelName, "\" to"), resultJson);
    if (query.orderBy) {
        (0, sortResults_1.sortResults)(query.orderBy, resultJson);
    }
    var paginatedResults = (0, paginateResults_1.paginateResults)(query, resultJson);
    log('paginated query results', paginatedResults);
    return paginatedResults;
}
exports.executeQuery = executeQuery;
