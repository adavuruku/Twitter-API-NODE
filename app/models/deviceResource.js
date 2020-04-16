let timestampPlugin = require('./timestamp')
const mongoose = require('mongoose');

const deviceResource = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    deviceId:{type : String, required:true, unique:true},
    filesPath:{type : Array, "default" : [] }
});

deviceResource.plugin(timestampPlugin)
module.exports = mongoose.model('DeviceResource',deviceResource);