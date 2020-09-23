import { success, notFound } from '../../services/response'
import { Flight } from '.'
import { Plain } from '../plain'
import { User } from '../user'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Flight.find(query, select, cursor)
  // .populate("plain", "-__v -flights")
  // .populate("passengers", "-__v -flights")
    .then((flights) => flights.map((flight) => flight.view(true)))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Flight.findById(params.id)
    // .populate("plain", "-__v -flights")
    // .populate("passengers", "-__v -flights")
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
    .then((flight) => {
      if (!flight) return null;
      const purifiedBody = Object.keys(body).reduce((acc, key) => body[key] ? { ...acc, [key]: body[key] } : acc, {});     
      return Object.assign(flight, purifiedBody).save();
    })
    .then((flight) => flight ? flight.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Flight.findById(params.id)
    .then(notFound(res))
    .then(async (flight) => {
      await updatePassengers(flight, params)
      await updatePlain(flight, params)
      return flight
    })
    .then((flight) => flight ? flight.remove() : null)
    .then(success(res, 204))
    .catch(next)


  async function updatePlain (flight, params) {
    if (!flight || !flight.plain) return null
    const plain = await Plain.findById(flight.plain)
    plain.flights = plain.flights.filter(flight => flight._id != params.id)
    plain.save()
  }

  async function updatePassengers (flight, params) {
    if (!flight || !flight.passengers.length) return null
    flight.passengers.forEach(async passenger => {
      const user = await User.findById(passenger._id)
      user.flights = user.flights.filter(flight => flight._id != params.id)
      user.save()
    })
  }
