"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ParamArrayType;
(function (ParamArrayType) {
    ParamArrayType[ParamArrayType["MULTIPLE_PARAMS"] = 0] = "MULTIPLE_PARAMS";
    ParamArrayType[ParamArrayType["COMMA_SEPARATED"] = 1] = "COMMA_SEPARATED";
    ParamArrayType[ParamArrayType["PARAM_ARRAY"] = 2] = "PARAM_ARRAY";
    ParamArrayType[ParamArrayType["OBJECT_PATH"] = 3] = "OBJECT_PATH";
})(ParamArrayType || (ParamArrayType = {}));
exports.default = ParamArrayType;
