const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var timestamps = require('mongoose-timestamp');

var QuerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true }
  },
  {
    collection: 'Query'
  }
);
QuerySchema.plugin(mongoosePaginate);
QuerySchema.plugin(timestamps);
module.exports = mongoose.model('Query', QuerySchema);
