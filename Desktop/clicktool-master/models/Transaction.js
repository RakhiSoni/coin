const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var ObjectId = mongoose.Schema.Types.ObjectId;
var timestamps = require('mongoose-timestamp');
//var Decimal128 = mongoose.Schema.Types.Decimal128;
var Double = mongoose.Schema.Types.Double;
var TransactionSchema = new mongoose.Schema({
    transactionHash: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    ether: {
        type: Number,
        required: false,
        default: 0
    },
    bitcoin: {
        type: Number,
        required: false,
        default: 0
    },
    coins: {
        type: Number,
        required: false,
        default: 0
    },
    transactionType: {
        type: String,
        required: true
    },

    paymentType: {
        type: Number,
        required: false,
    },

    currencyType: {
        type: String,
        required: false
    },
    transactionStatus: {
        type: String,
        required: false,
    },
    date: {
        type: Number,
        required: false
    },
    memberId: {

        type:String,
        required: true
    },
    isFirstTx: {
        type: Boolean,
        default: false
    },
    invoiceId: {
        type: String,
        default: false
    }

}, {
    collection: 'Transaction'
});
//WalletSchema.plugin(mongoosePaginate);
TransactionSchema.plugin(timestamps);
module.exports = mongoose.model('Transaction', TransactionSchema);