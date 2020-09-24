import mongoose, { Schema } from 'mongoose'

const planeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  flights: {
    type:   [{
      type: mongoose.Schema.Types.ObjectId,
      ref:'Flight'
    }],
    default: []
  }

}, {
  timestamps: true
})



planeSchema.methods = {
  view (full) {
    const view = {}
    let fields = ['name', 'model', 'flights']

    if (full) {
      fields = [...fields, 'id', 'flightsAmount']
    }

    fields.forEach((field) => { view[field] = this[field] })

    return view
  }
}

planeSchema.virtual('flightsAmount')
    .get(function () {
        return this.flights.length;
    })

const model = mongoose.model('Plane', planeSchema)

export const schema = model.schema
export default model
