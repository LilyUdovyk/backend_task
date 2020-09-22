import { success, notFound } from '../../services/response'
import { Flight } from '.'
import { Plain } from '../plain'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Flight.find(query, select, cursor)
  // .populate("plain", "-__v -flights")
  // .populate("passengers", "-__v -flights")
    .then((flights) => flights.map((flight) => flight.view(true)))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Flight.findById(params.id)
    .then(notFound(res))
    .then((flight) => flight ? flight.view(true) : null)
    .then(success(res))
    .catch(next)

export const create = ({ bodymen: { body } }, res, next) =>
  Flight.create(body)
    .then((flight) => flight.view(true))
    .then(async(flight) => {
      if (!flight) return null
      await Plain.findByIdAndUpdate(
        { _id: body.plain },
        { $push: { flights: flight.id  }},
        { new: true, useFindAndModify: false }
      );
      return flight
    })
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params, flight }, res, next) =>
  Flight.findById(params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      // const isAdmin = user.role === 'admin'
      // if (!isAdmin) {
      //   res.status(401).json({
      //     valid: false,
      //     message: 'You can\'t change flight\'s data'
      //   })
      //   return null
      // }
      return result
    })
    .then((flight) => flight ? Object.assign(flight, body).save() : null)
    .then((flight) => flight ? flight.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Flight.findById(params.id)
    .then(notFound(res))
    .then((flight) => flight ? flight.remove() : null)
    .then(success(res, 204))
    .catch(next)
