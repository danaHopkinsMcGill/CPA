'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var dailyLogSchema = Schema( {
  userId: {type:Schema.Types.ObjectId, ref:'User'},
  speciesName: String,
  url: String,
  comment: String,
  createdAt: Date,
} );

module.exports = mongoose.model( 'DailyLog', dailyLogSchema );