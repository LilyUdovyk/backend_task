import mongoose, { Schema } from 'mongoose'

const plainSchema = new Schema({
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



plainSchema.methods = {
  view (full) {
    const view = {}
    let fields = ['id', 'name', 'model', 'flights']

    if (full) {
      fields = [...fields, 'flightsAmount']
    }

    fields.forEach((field) => { view[field] = this[field] })

    return view
  }
}

plainSchema.virtual('flightsAmount')
    .get(function () {
        return this.flights.length;
    })

const model = mongoose.model('Plain', plainSchema)

export const schema = model.schema
export default model
