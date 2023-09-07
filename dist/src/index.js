"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPubKeysFromAddresses = exports.getAddresses = void 0;
var addressGetter_1 = require("./addressGetter");
Object.defineProperty(exports, "getAddresses", {
  enumerable: true,
  get: function () {
    return addressGetter_1.getAddresses;
  },
});
var pubKeyGetter_1 = require("./pubKeyGetter");
Object.defineProperty(exports, "getPubKeysFromAddresses", {
  enumerable: true,
  get: function () {
    return pubKeyGetter_1.getPubKeysFromAddresses;
  },
});
