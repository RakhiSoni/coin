const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

var NotificationsSchema = new mongoose.Schema({
    type: {type: String, required: true},
    title: {type: String, required: true},
    message: {type: String, required: true},
    memberId: {type: String, required: true},
    data: {type: String, required: false},
    isRead: {type: Boolean, required: true, default: 0},
    createdAt: {type: Number, required:false},
    isDelete: {type: Boolean, default: 0}
}, {
    collection: 'Notifications'
});
NotificationsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Notifications', NotificationsSchema);
