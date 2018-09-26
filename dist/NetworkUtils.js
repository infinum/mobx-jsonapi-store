"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ParamArrayType_1 = require("./enums/ParamArrayType");
var Response_1 = require("./Response");
var utils_1 = require("./utils");
exports.config = {
    /** Base URL for all API calls */
    baseUrl: '/',
    /** Default headers that will be sent to the server */
    defaultHeaders: {
        'content-type': 'application/vnd.api+json',
    },
    /* Default options that will be passed to fetchReference */
    defaultFetchOptions: {},
    /** Reference of the fetch method that should be used */
    /* istanbul ignore next */
    fetchReference: utils_1.isBrowser && window.fetch && window.fetch.bind(window),
    /** Determines how will the request param arrays be stringified */
    paramArrayType: ParamArrayType_1.default.COMMA_SEPARATED,
    /**
     * Base implementation of the fetch function (can be overridden)
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
            var options = utils_1.assign({}, exports.config.defaultFetchOptions, {
                body: isBodySupported && JSON.stringify(body) || undefined,
                headers: reqHeaders,
                method: method,
            });
            return _this.fetchReference(url, options);
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
     * Base implementation of the stateful fetch function (can be overridden)
     *
     * @param {IStoreFetchOpts} reqOptions API request options
     * @returns {Promise<Response>} Resolves with a response object
     */
    storeFetch: function (reqOptions) {
        var _a = exports.config.transformRequest(reqOptions), url = _a.url, options = _a.options, data = _a.data, _b = _a.method, method = _b === void 0 ? 'GET' : _b, store = _a.store;
        return exports.config.baseFetch(method, url, data, options && options.headers)
            .then(function (response) {
            var storeResponse = utils_1.assign(response, { store: store });
            return new Response_1.Response(exports.config.transformResponse(storeResponse), store, options);
        });
    },
    transformRequest: function (options) {
        return options;
    },
    transformResponse: function (response) {
        return response;
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
        /* istanbul ignore else */
        if (href) {
            return read(store, href, requestHeaders, options);
        }
    }
    return Promise.resolve(new Response_1.Response({ data: null }, store));
}
exports.fetchLink = fetchLink;
function handleResponse(record, prop) {
    return function (response) {
        /* istanbul ignore if */
        if (response.error) {
            throw response.error;
        }
        if (response.status === 204) {
            record['__persisted'] = true;
            return record;
        }
        else if (response.status === 202) {
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
function __prepareFilters(filters) {
    return __parametrize(filters).map(function (item) { return "filter[" + item.key + "]=" + item.value; });
}
function __prepareSort(sort) {
    return sort ? ["sort=" + sort] : [];
}
function __prepareIncludes(include) {
    return include ? ["include=" + include] : [];
}
function __prepareFields(fields) {
    var list = [];
    utils_1.objectForEach(fields, function (key) {
        list.push("fields[" + key + "]=" + fields[key]);
    });
    return list;
}
function __prepareRawParams(params) {
    return params.map(function (param) {
        if (typeof param === 'string') {
            return param;
        }
        return param.key + "=" + param.value;
    });
}
function prefixUrl(url) {
    return "" + exports.config.baseUrl + url;
}
exports.prefixUrl = prefixUrl;
function __appendParams(url, params) {
    if (params.length) {
        url += '?' + params.join('&');
    }
    return url;
}
function __parametrize(params, scope) {
    if (scope === void 0) { scope = ''; }
    var list = [];
    utils_1.objectForEach(params, function (key) {
        if (params[key] instanceof Array) {
            if (exports.config.paramArrayType === ParamArrayType_1.default.OBJECT_PATH) {
                list.push.apply(list, __parametrize(params[key], key + "."));
            }
            else if (exports.config.paramArrayType === ParamArrayType_1.default.COMMA_SEPARATED) {
                list.push({ key: "" + scope + key, value: params[key].join(',') });
            }
            else if (exports.config.paramArrayType === ParamArrayType_1.default.MULTIPLE_PARAMS) {
                list.push.apply(list, params[key].map(function (param) { return ({ key: "" + scope + key, value: param }); }));
            }
            else if (exports.config.paramArrayType === ParamArrayType_1.default.PARAM_ARRAY) {
                list.push.apply(list, params[key].map(function (param) { return ({ key: "" + scope + key + "][", value: param }); }));
            }
        }
        else if (typeof params[key] === 'object') {
            list.push.apply(list, __parametrize(params[key], key + "."));
        }
        else {
            list.push({ key: "" + scope + key, value: params[key] });
        }
    });
    return list;
}
function buildUrl(type, id, model, options) {
    var path = model
        ? (utils_1.getValue(model['endpoint']) || model['baseUrl'] || model.type)
        : type;
    var url = id ? path + "/" + id : "" + path;
    var params = __prepareFilters((options && options.filter) || {}).concat(__prepareSort(options && options.sort), __prepareIncludes(options && options.include), __prepareFields((options && options.fields) || {}), __prepareRawParams((options && options.params) || []));
    return __appendParams(prefixUrl(url), params);
}
exports.buildUrl = buildUrl;
