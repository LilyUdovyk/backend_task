import { success, notFound } from '../../services/response'
import { admin } from '../user/user-roles'
import { Plane } from '.'
import { Flight } from '../flight'
import { User } from '../user'

export const index = ({ querymen: { query, select, cursor }, user }, res, next) =>
  Plane.find(query, select, cursor)
  // .populate("flights", "-__v -plane -passengers")
    .then((planes) => {
      const full = user.role === admin ? true : false
      return planes.map((plane) => plane.view(full))
    })
    .then(success(res))
    .catch(next)

export const show = ({ params, user }, res, next) =>
  Plane.findById(params.id)
  // .populate("flights", "-__v -plane -passengers")
    .then(notFound(res))
    .then((plane) => {
      const full = user.role === admin ? true : false
      return plane ? plane.view(full) : null
    })
    .then(success(res))
    .catch(next)

export const create = ({ bodymen: { body } }, res, next) =>
  Plane.create(body)
    .then((plane) => plane.view(true))
    .then(success(res, 201))
    .catch(next)

export const update = ({ bodymen: { body }, params, plane }, res, next) =>
  Plane.findById(params.id)
    .then(notFound(res))
    .then((plane) => {
      if (!plane) return null;
      const purifiedBody = Object.keys(body).reduce((acc, key) => body[key] ? { ...acc, [key]: body[key] } : acc, {});     
      return Object.assign(plane, purifiedBody).save();
    })
    .then((plane) => plane ? plane.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Plane.findById(params.id)
    .then(notFound(res))
    .then((plane) => {
      deleteFlights(plane)
      return plane
    })
    .then((plane) => plane ? plane.remove() : null)
    .then(success(res, 204))
    .catch(next)

    async function deleteFlights (plane) {
      if (!plane || !plane.flights.length) return null
      plane.flights.forEach(async flight => {
        const foundFlight = await Flight.findById(flight._id)
        removeFlightFromPassenger(foundFlight)
        foundFlight.remove()
      })
    }
    
    async function removeFlightFromPassenger (removableFlight) {
      if (!removableFlight || !removableFlight.passengers.length) return null
      removableFlight.passengers.forEach(async passenger => {
        const user = await User.findById(passenger._id)
        user.flights = user.flights.filter(flight => flight._id.toString() !== removableFlight._id.toString())
        user.save()
      })
    }
