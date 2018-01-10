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
        _this._channelStatus = ChannelStatus.STATUS_UNASSIGNED_CHANNEL;
        _this.internalCreateChannelConfig();
        return _this;
    }
    DeviceProfile.prototype.openChannel = function (channelId, deviceId) {
        antlib.init();
        if (deviceId)
            this._channelConfig.deviceId = deviceId;
        this._channelId = channelId;
        this._channelStatus = ChannelStatus.STATUS_ASSIGNED_CHANNEL;
        antlib.openChannel(channelId, this._channelConfig);
    };
    DeviceProfile.prototype.closeChannel = function () {
        antlib.closeChannel(this._channelId);
    };
    DeviceProfile.prototype.getChannelDevice = function () {
        var device = {
            deviceId: this._channelConfig.deviceId,
            deviceType: this._channelConfig.deviceType,
            transmissionType: this._channelConfig.transmissionType
        };
        return device;
    };
    DeviceProfile.prototype.getChannelStatus = function () {
        return this._channelStatus;
    };
    DeviceProfile.prototype.onChannelStatus = function (channelId, status) {
        if (this._channelStatus != status) {
            this.updateChannelStatus(status);
        }
    };
    DeviceProfile.prototype.onChannelId = function (channelId, channelDevice) {
        this._channelConfig.deviceId = channelDevice.deviceId;
        this._channelConfig.deviceType = channelDevice.deviceType;
        this._channelConfig.transmissionType = channelDevice.transmissionType;
        this.updateChannelStatus(ChannelStatus.STATUS_TRACKING_CHANNEL);
    };
    DeviceProfile.prototype.onChannelEvent = function (channelId, eventId, timestamp) {
        switch (eventId) {
            case antlib.EVENT_RX_BROADCAST:
            case antlib.EVENT_RX_FLAG_BROADCAST:
                this.ensureDeviceTracking();
                this.onMessage(this.getMessageId(), timestamp);
                break;
            case antlib.EVENT_RX_FAIL_GO_TO_SEARCH:
            case antlib.EVENT_RX_SEARCH_TIMEOUT:
                this.updateChannelStatus(ChannelStatus.STATUS_SEARCHING_CHANNEL);
                break;
            case antlib.EVENT_CHANNEL_CLOSED:
                this.updateChannelStatus(ChannelStatus.STATUS_ASSIGNED_CHANNEL);
                break;
            default:// eventId
                console.log('Unrecognized event.', eventId);
                break;
        }
    };
    DeviceProfile.prototype.ensureDeviceTracking = function () {
        if (this._channelStatus != ChannelStatus.STATUS_TRACKING_CHANNEL)
            antlib.requestChannelId(this._channelId);
    };
    DeviceProfile.prototype.getMessageId = function () {
        return this._channelConfig.buffer[1];
    };
    DeviceProfile.prototype.updateChannelStatus = function (status) {
        console.log('channel_status updated: ', status);
        this._channelStatus = status;
        this.emit('channel_status', this._channelStatus, this._channelConfig.deviceId);
    };
    DeviceProfile.prototype.internalCreateChannelConfig = function () {
        var _this = this;
        this._channelConfig = {
            channelType: 0,
            deviceId: 0,
            deviceType: 0,
            transmissionType: 0,
            frequency: 0,
            channelPeriod: 0,
            channelCallback: null,
            channelStatusCallback: null,
            channelIdCallback: null,
            buffer: null
        };
        this.updateChannelConfig(this._channelConfig);
        this._channelConfig.buffer = new Buffer(antlib.MESG_MAX_SIZE_VALUE);
        /* NOTE the syntax for assigning channelCallback which is required to handle 'this':
            https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript */
        this._channelConfig.channelCallback = function (channelId, eventId, timestamp) { _this.onChannelEvent(channelId, eventId, timestamp); };
        this._channelConfig.channelStatusCallback = function (channelId, status) { _this.onChannelStatus(channelId, status); };
        this._channelConfig.channelIdCallback = function (channelId, channelDevice) { _this.onChannelId(channelId, channelDevice); };
    };
    return DeviceProfile;
}(events_1.EventEmitter));
var HeartRateMonitor = /** @class */ (function (_super) {
    __extends(HeartRateMonitor, _super);
    function HeartRateMonitor() {
        return _super.call(this) || this;
    }
    HeartRateMonitor.prototype.updateChannelConfig = function (config) {
        config.channelType = 0x00;
        config.deviceType = 0x78;
        config.transmissionType = 0;
        config.frequency = 0x39;
        config.channelPeriod = 8070;
    };
    HeartRateMonitor.prototype.onMessage = function (messageId, timestamp) {
        console.log("hrm message: ", messageId);
    };
    return HeartRateMonitor;
}(DeviceProfile));
exports["default"] = HeartRateMonitor;
