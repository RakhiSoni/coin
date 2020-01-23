const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

var ObjectId = mongoose.Schema.Types.ObjectId;

var TokenListSchema = new mongoose.Schema({
    name: {type: String, required: true},
    symbol: {type: String, required: true},
    contractAddress: {type: String, required: true},
    decimals: {type: Number, required: true}
    
}, {
    collection: 'TokenList'
});
TokenListSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('TokenList', TokenListSchema);
