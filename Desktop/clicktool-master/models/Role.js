const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

var RoleSchema = new mongoose.Schema({
    name: {type: String, required:true},
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now}

}, {
    collection: 'Role'
});
RoleSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Role', RoleSchema);
