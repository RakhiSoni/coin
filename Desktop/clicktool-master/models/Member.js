const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var timestamps = require('mongoose-timestamp');
var autopopulate = require('mongoose-autopopulate');
var ObjectId = mongoose.Schema.Types.ObjectId;
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var MemberSchema = new mongoose.Schema(
  {
    // isCitizen: { type: Boolean, default: false },
    // didAgreeToTerms: { type: Boolean, default: false },
    // didAgreeToPrivacyPolicy: { type: Boolean, default: false },
    // didReadWhitePaper: { type: Boolean, default: false },
    firstname: { type: String, default: '' },
    lastname: { type: String, default: '' },
    dob: { type: String, default: '' },
    phone: { type: Number },
    profilePicture: { type: String, default: '' },
    country: { type: String, default: '' },
    publicWalletAddress: { type: String, default: '' },
    company: { type: String, default: '' },
    isContributionMoreThenTwelve: { type: Boolean, default: false },
    isContributionUsd: { type: Boolean, default: false },
    role: { type: String, default: 'user' },
    secretAccessKey: { type: String, default: '' },
    // realm: { type: String, default: '' },
    username: { type: String, default: '' },
    email: { type: String, default: '', unique: true },
    emailVerified: { type: Boolean, default: false },
    countryCode: { type: String, default: '' },
    referralCode: { type: String, default: '', unique: true },
    referredBy: { type: String, default: '' },
    referralCount: { type: Number, default: 0 },
    referralTokenCount: { type: SchemaTypes.Double, default: 0 },
    referralTokenTransactions: [
      {
        date: { type: String },
        txHash: { type: String },
        tokenCount : {type : SchemaTypes.Double},
        userName: { type: String },
        txURL: { type: String }
      }
    ],
    privateKey: { type: String, default: '' },
    publicKey: { type: String, default: '' },
    bitcoinAddress: { type: String, default: '' },
    fcmToken: { type: String, default: '' },
    isWhitelisted: { type: Boolean, default: true },
    isFrozen: { type: Boolean, default: false },
    dateJoined: { type: Date },
    otp: { type: Number },
    wallets: [{ type: ObjectId, ref: 'Wallet', autopopulate: true }],
    passwordConfirm: { type: String, default: '' },
    mnemonicGenerated: { type: Boolean, default: false },
    mnemonicAddress: { type: String, default: '' },
    verificationToken: { type: String, default: '' },
    kyc: {
      isVerified: { type: Number, default: 0 },
      email: { type: String, default: '' },
      failReason: { type: String, default: '' },
      docID: { type: String, default: '' },
      docImage: { type: String, default: '' },
      docHoldingImage: { type: String, default: '' },
      utilityBill: { type: String, default: '' },
      country: { type: String, default: '' },
      countryCode: { type: String, default: '' },
      state: { type: String, default: '' },
      city: { type: String, default: '' },
      firstname: { type: String, default: '' },
      lastname: { type: String, default: '' },
      email: { type: String, default: '' },
      countryCode: { type: String, default: '' },
      phone: { type: String, default: '' },
      dateOfBirth: { type: String, default: '' },
      time_unix: { type: String, default: '' }
    },
    isFirstTx: { type: Boolean, default: true },
    firstTransactionHash: { type: String },
    resetPasswordToken: { type: String },
    isforgotPassword: { type: Boolean, default: false }
  },
  {
    collection: 'Member'
  }
);
MemberSchema.plugin(mongoosePaginate);
MemberSchema.plugin(timestamps);
MemberSchema.plugin(autopopulate);
module.exports = mongoose.model('Member', MemberSchema);
