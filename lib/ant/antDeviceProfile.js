"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var events_1 = require("events");
var antlib = require('./antlib.js');
var ChannelStatus;
(function (ChannelStatus) {
    ChannelStatus[ChannelStatus["STATUS_UNASSIGNED_CHANNEL"] = 0] = "STATUS_UNASSIGNED_CHANNEL";
    ChannelStatus[ChannelStatus["STATUS_ASSIGNED_CHANNEL"] = 1] = "STATUS_ASSIGNED_CHANNEL";
    ChannelStatus[ChannelStatus["STATUS_SEARCHING_CHANNEL"] = 2] = "STATUS_SEARCHING_CHANNEL";
    ChannelStatus[ChannelStatus["STATUS_TRACKING_CHANNEL"] = 3] = "STATUS_TRACKING_CHANNEL";
})(ChannelStatus || (ChannelStatus = {}));
var DeviceProfile = /** @class */ (function (_super) {
    __extends(DeviceProfile, _super);
    function DeviceProfile() {
        var _this = _super.call(this) || this;
        _this.responseBuffer = new Buffer(antlib.MESG_MAX_SIZE_VALUE);
        _this.internalCreateChannelConfig();
        return _this;
    }
    DeviceProfile.prototype.openChannel = function (deviceId) {
        antlib.init();
        if (deviceId)
            this.config.deviceId = deviceId;
        this.channelId = antlib.openChannel(this.config);
        return this.channelId;
    };
    DeviceProfile.prototype.closeChannel = function () {
        throw new Error("Not implemented!");
    };
    DeviceProfile.prototype.onChannelEvent = function (channelId, eventId, timestamp) {
        switch (eventId) {
            case antlib.EVENT_RX_BROADCAST:
            case antlib.EVENT_RX_FLAG_BROADCAST:
                var messagedId = this.responseBuffer[1];
                this.onMessage(messagedId, timestamp);
                break;
            case antlib.MESG_CHANNEL_STATUS_ID:
                // this.config.status = this.responseBuffer[1] & 0x3;
                this.emit('channel_status', this.config.status, this.config.deviceId, timestamp);
                break;
            default:// eventId
                console.log('Unrecognized event.', eventId);
                break;
        }
    };
    DeviceProfile.prototype.internalCreateChannelConfig = function () {
        var _this = this;
        this.config = this.createChannelConfig();
        /* NOTE the syntax for assigning channelCallback which is required to handle 'this':
            https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript */
        this.config.channelCallback = function (channelId, eventId, timestamp) { _this.onChannelEvent(channelId, eventId, timestamp); };
        this.config.buffer = this.responseBuffer;
    };
    return DeviceProfile;
}(events_1.EventEmitter));
var HeartRateMonitor = /** @class */ (function (_super) {
    __extends(HeartRateMonitor, _super);
    function HeartRateMonitor() {
        return _super.call(this) || this;
    }
    HeartRateMonitor.prototype.createChannelConfig = function () {
        var config = {
            channelType: 0x00,
            deviceId: 0,
            deviceType: 0x78,
            transmissionType: 0,
            frequency: 0x39,
            channelPeriod: 8070,
            channelCallback: null,
            buffer: null,
            status: ChannelStatus.STATUS_UNASSIGNED_CHANNEL
        };
        return config;
    };
    HeartRateMonitor.prototype.onMessage = function (messageId, timestamp) {
        console.log("hrm message: ", messageId, this.responseBuffer);
    };
    return HeartRateMonitor;
}(DeviceProfile));
exports["default"] = HeartRateMonitor;
