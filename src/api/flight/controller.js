import { success, notFound } from '../../services/response'
import { admin } from '../user/user-roles'
import { Flight } from '.'
import { Plane } from '../plane'
import { User } from '../user'

export const index = ({ querymen: { query, select, cursor }, user }, res, next) =>
  Flight.find(query, select, cursor)
  // .populate("plane", "-__v -flights")
  // .populate("passengers", "-__v -flights")
    .then((flights) => {
      const full = user.role === admin ? true : false
      return flights.map((flight) => flight.view(full))
    })
    .then(success(res))
    .catch(next)

export const show = ({ params, user }, res, next) =>
  Flight.findById(params.id)
    // .populate("plane", "-__v -flights")
    // .populate("passengers", "-__v -flights")
    .then(notFound(res))
    .then((flight) => {
      const full = user.role === admin ? true : false
      return flight ? flight.view(full) : null
    })
    .then(success(res))
    .catch(next)

export const create = ({ bodymen: { body } }, res, next) =>
  Flight.create(body)
    .then((flight) => flight.view(true))
    .then(async(flight) => {
      if (!flight) return null
      await Plane.findByIdAndUpdate(
        { _id: body.plane },
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
      removeFlightFromPassenger(flight, params)
      removeFlightFromPlane(flight, params)
      return flight
    })
    .then((flight) => flight ? flight.remove() : null)
    .then(success(res, 204))
    .catch(next)

  async function removeFlightFromPassenger (flight, params) {
    if (!flight || !flight.passengers.length) return null
    flight.passengers.forEach(async passenger => {
      const user = await User.findById(passenger._id)
      user.flights = user.flights.filter(flight => flight._id != params.id)
      user.save()
    })
  }

  async function removeFlightFromPlane (flight, params) {
    if (!flight || !flight.plane) return null
    const plane = await Plane.findById(flight.plane)
    plane.flights = plane.flights.filter(flight => flight._id != params.id)
    plane.save()
  }
