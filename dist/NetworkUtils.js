"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Response_1 = require("./Response");
var utils_1 = require("./utils");
exports.config = {
    /** Base URL for all API calls */
    baseUrl: '/',
    /** Default headers that will be sent to the server */
    defaultHeaders: {
        'content-type': 'application/vnd.api+json',
    },
    /** Reference of the fetch method that should be used */
    fetchReference: utils_1.isBrowser && window.fetch.bind(window),
    /**
     * Base implementation of the fetch function (can be overriden)
     *
     * @param {string} method API call method
     * @param {string} url API call URL
     * @param {object} [body] API call body
     * @param {IHeaders} [requestHeaders] Headers that will be sent
     * @returns {Promise<IRawResponse>} Resolves with a raw response object
     */
    baseFetch: function (method, url, body, requestHeaders) {
        var _this = this;
        var data;
        var status;
        var headers;
        var request = Promise.resolve();
        var uppercaseMethod = method.toUpperCase();
        var isBodySupported = uppercaseMethod !== 'GET' && uppercaseMethod !== 'HEAD';
        return request
            .then(function () {
            var reqHeaders = utils_1.assign({}, exports.config.defaultHeaders, requestHeaders);
            return _this.fetchReference(url, {
                body: isBodySupported && JSON.stringify(body),
                headers: reqHeaders,
                method: method,
            });
        })
            .then(function (response) {
            status = response.status;
            headers = response.headers;
            return response.json();
        })
            .catch(function (e) {
            if (status === 204) {
                return null;
            }
            throw e;
        })
            .then(function (responseData) {
            data = responseData;
            if (status >= 400) {
                throw {
                    message: "Invalid HTTP status: " + status,
                    status: status,
                };
            }
            return { data: data, headers: headers, requestHeaders: requestHeaders, status: status };
        })
            .catch(function (error) {
            return { data: data, error: error, headers: headers, requestHeaders: requestHeaders, status: status };
        });
    },
    /**
     * Base implementation of the stateful fetch function (can be overriden)
     *
     * @param {IStoreFetchOpts} options API request options
     * @returns {Promise<Response>} Resolves with a response object
     */
    storeFetch: function (_a) {
        var url = _a.url, options = _a.options, data = _a.data, _b = _a.method, method = _b === void 0 ? 'GET' : _b, store = _a.store;
        return exports.config.baseFetch(method, url, data, options && options.headers)
            .then(function (response) { return new Response_1.Response(response, store, options); });
    },
};
function fetch(options) {
    return exports.config.storeFetch(options);
}
exports.fetch = fetch;
/**
 * API call used to get data from the server
 *
 * @export
 * @param {Store} store Related Store
 * @param {string} url API call URL
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
function read(store, url, headers, options) {
    return exports.config.storeFetch({
        data: null,
        method: 'GET',
        options: __assign({}, options, { headers: headers }),
        store: store,
        url: url,
    });
}
exports.read = read;
/**
 * API call used to create data on the server
 *
 * @export
 * @param {Store} store Related Store
 * @param {string} url API call URL
 * @param {object} [data] Request body
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
function create(store, url, data, headers, options) {
    return exports.config.storeFetch({
        data: data,
        method: 'POST',
        options: __assign({}, options, { headers: headers }),
        store: store,
        url: url,
    });
}
exports.create = create;
/**
 * API call used to update data on the server
 *
 * @export
 * @param {Store} store Related Store
 * @param {string} url API call URL
 * @param {object} [data] Request body
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
function update(store, url, data, headers, options) {
    return exports.config.storeFetch({
        data: data,
        method: 'PATCH',
        options: __assign({}, options, { headers: headers }),
        store: store,
        url: url,
    });
}
exports.update = update;
/**
 * API call used to remove data from the server
 *
 * @export
 * @param {Store} store Related Store
 * @param {string} url API call URL
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
function remove(store, url, headers, options) {
    return exports.config.storeFetch({
        data: null,
        method: 'DELETE',
        options: __assign({}, options, { headers: headers }),
        store: store,
        url: url,
    });
}
exports.remove = remove;
/**
 * Fetch a link from the server
 *
 * @export
 * @param {JsonApi.ILink} link Link URL or a link object
 * @param {Store} store Store that will be used to save the response
 * @param {IDictionary<string>} [requestHeaders] Request headers
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<LibResponse>} Response promise
 */
function fetchLink(link, store, requestHeaders, options) {
    if (link) {
        var href = typeof link === 'object' ? link.href : link;
        if (href) {
            return read(store, href, requestHeaders, options);
        }
    }
    return Promise.resolve(new Response_1.Response({ data: null }, store));
}
exports.fetchLink = fetchLink;
function handleResponse(record, prop) {
    return function (response) {
        if (response.error) {
            throw response.error;
        }
        if (response.status === 204) {
            record['__persisted'] = true;
            return record;
        }
        else if (response.status === 201) {
            response.data.update({
                __prop__: prop,
                __queue__: true,
                __related__: record,
            });
            return response.data;
        }
        else {
            record['__persisted'] = true;
            return response.replaceData(record).data;
        }
    };
}
exports.handleResponse = handleResponse;
