const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var timestamps = require('mongoose-timestamp');

var AdminUserSchema = new mongoose.Schema({

    firstname: {type: String, required: false},
    lastname: {type: String, required: false},
    username: {type: String, required: false},
    email: {type: String, required: true},
    phone: {type: String, required: false},
    password: {type: String, required: true},
    passwordTwo: {type: String, required: false},
    passwordThree: {type: String, required: false},
    accessToken: {type: String, required: false},
    role: {type: String, require: false},
    isActive: {type: Boolean, default: 0},
    isDelete: {type: Boolean, default: 0},
    verifyPasswordTwo: {type: Boolean, default: 0, required: false},
    verifyPasswordThree: {type: Boolean, default: 0, required: false},

}, {
    collection: 'AdminUser'
});
AdminUserSchema.plugin(mongoosePaginate);
AdminUserSchema.plugin(timestamps);
module.exports = mongoose.model('AdminUser', AdminUserSchema);
