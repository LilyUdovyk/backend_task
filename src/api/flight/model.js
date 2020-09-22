import mongoose, { Schema } from 'mongoose'

const flightSchema = new Schema({
  plain :{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Plain',
    required: true
  },
  time: {
      type: Date,
      required: true
  },
  passengers: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref:'User'
    }]},
    default: []

}, {
  timestamps: true
})



flightSchema.methods = {
  view (full) {
    const view = {}
    let fields = ['id', 'plain', 'time']

    if (full) {
      fields = [...fields, 'passengers']
    }

    fields.forEach((field) => { view[field] = this[field] })

    return view
  }
}

const model = mongoose.model('Flight', flightSchema)

export const schema = model.schema
export default model
