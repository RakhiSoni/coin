const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var timestamps = require('mongoose-timestamp');

var AdminSchema = new mongoose.Schema({
   
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    firstname: {type: String, required: false},
    lastname : {type : String, required : false},
    profilePicture: {type: String, required: false},
    publicEtherWalletAddress: {type: String, required: false},
    publicBitcoinWalletAddress : {type : String , required : false},
    resetPasswordToken : {type : String , required : false},
    isforgotPassword  : {type : Boolean, default : false}

}, {
    collection: 'Admin'
});
AdminSchema.plugin(mongoosePaginate);
AdminSchema.plugin(timestamps);
module.exports = mongoose.model('Admin', AdminSchema);
