import mongoose, { Schema } from 'mongoose'

const flightSchema = new Schema({
  plane :{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Plane',
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
    let fields = ['plane', 'time']

    if (full) {
      fields = [...fields, 'id', 'passengers']
    }

    fields.forEach((field) => { view[field] = this[field] })

    return view
  }
}

const model = mongoose.model('Flight', flightSchema)

export const schema = model.schema
export default model
