const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var ObjectId = mongoose.Schema.Types.ObjectId;
//var Decimal128 = mongoose.Schema.Types.Decimal128;
var Double = mongoose.Schema.Types.Double;
var timestamps = require('mongoose-timestamp');
var ReferralSchema = new mongoose.Schema({
    
    userIdThatBuys: {
        type: String,
        required: true
    },
    userIdThatRefers: {
        type: String,
        required: true
    },
    amountOfEther: {
        type: Number,
        required: false
    },
    amountOfBitcoin: {
        type: Number,
        required: false
    },
    etherRewarded: {
        type: Number,
        required: true
    },
    rewardStatus: {
        type: String,
        required: false,
    },
    dateAssigned: {
        type: Number,
        required: false
    },
    dateRewarded: {
        type: Number,
        required: false
    },
    transactionHash: {
        type: String,
        required: false
    }
    

}, {
    collection: 'Referral'
});
//WalletSchema.plugin(mongoosePaginate);
ReferralSchema.plugin(timestamps);
module.exports = mongoose.model('Referral', ReferralSchema);