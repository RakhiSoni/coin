const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var timestamps = require('mongoose-timestamp');
var ObjectId = mongoose.Schema.Types.ObjectId;
//var Decimal128 = mongoose.Schema.Types.Decimal128;
var Double = mongoose.Schema.Types.Double;
var WalletSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    memberId: {
        type: String,
        required: true
    },

    indexOfWallet: {
        type: Number,
        required: false
    },

    walletAddress: {
        type: String,
        required: true
    },
    walletPrivateKey: {
        type: String,
        required: false
    },

    defaultAddress: {
        type: Boolean,
        required: false
    },

    inUse: {
        type: Boolean,
        required: true,
        default: 0
    },
    isDelete: {
        type: Boolean,
        required: true,
        default: 0
    },
//
    balance: {
        type: Number,
        required: true,
        default: 0
    },
//
    coins: {
        type: Number,
        required: true,
        default: 0
    },
//
    ethers: {
        type: Number,
        default: 0
    },
    selectedTokens: {
        type: Array,
        default: []
    },
    purchases: [{
            ether: String,
            tokens: Number
        }],
}, {
    collection: 'Wallet'
});

//WalletSchema.plugin(mongoosePaginate);
WalletSchema.plugin(timestamps);
module.exports = mongoose.model('Wallet', WalletSchema);