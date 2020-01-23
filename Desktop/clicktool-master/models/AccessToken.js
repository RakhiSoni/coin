const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

var ObjectId = mongoose.Schema.Types.ObjectId;

var AccessTokenSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    ttl: {type: Number, required: false},
    created: {type: Date, required: false},
    userId: {type: ObjectId, required: false}
}, {
    collection: 'AccessToken'
});
AccessTokenSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('AccessToken', AccessTokenSchema);
