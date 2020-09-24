import { success, notFound } from '../../services/response/'
import userRoles, { admin } from './user-roles'
import { User } from '.'
import { Flight } from '../flight'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  User.find(query, select, cursor)
    // .populate("flights", "-__v -passengers -createdAt -updatedAt -default")
    .then((users) => users.map((user) => user.view(true)))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  User.findById(params.id)
    // .populate("flights", "-__v -passengers -createdAt -updatedAt -default")
    .then(notFound(res))
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const showMe = ({ user }, res) =>
  res.json(user.view(true))

export const create = ({ bodymen: { body } }, res, next) =>
  User.create(body)
    .then((user) => user.view(true))
    .then(success(res, 201))
    .catch((err) => {
      /* istanbul ignore else */
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: 'email',
          message: 'email already registered'
        })
      } else {
        next(err)
      }
    })

export const update = ({ bodymen: { body }, params, user }, res, next) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isAdmin = user.role === admin
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).json({
          valid: false,
          message: 'You can\'t change other user\'s data'
        })
        return null
      }
      return result
    })
    .then(async (user) => {
      if (!user) return null;
      const purifiedBody = Object.keys(body).reduce((acc, key) => body[key] ? { ...acc, [key]: body[key] } : acc, {});

      if (purifiedBody.flights) {
        if (!user.flights.includes(purifiedBody.flights.flight)) {
          if (purifiedBody.flights.action === 'append') {
            purifiedBody.flights = [...user.flights, purifiedBody.flights.flight];
          } else {
            purifiedBody.flights = user.flights.filter(f => f !== purifiedBody.flights.flight)
          }
          addPassengerToFlight(purifiedBody, params)
        } else {
          purifiedBody.flights = user.flights
        }
      }       
      return Object.assign(user, purifiedBody).save();
    })
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const updatePassword = ({ bodymen: { body }, params, user }, res, next) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate) {
        res.status(401).json({
          valid: false,
          param: 'password',
          message: 'You can\'t change other user\'s password'
        })
        return null
      }
      return result
    })
    .then((user) => user ? user.set({ password: body.password }).save() : null)
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => {
      removePassengerFromFlight(user, params)
      return user
    })
    .then((user) => user ? user.remove() : null)
    .then(success(res, 204))
    .catch(next)

    async function addPassengerToFlight (user, params) {
      if (!user || !user.flights.length) return null
      user.flights.forEach(async flight => {
        await Flight.findByIdAndUpdate(
          { _id: flight },
          { $push: { passengers: params.id } },
          { new: true, useFindAndModify: false }
        );
      })
    }
    
    async function removePassengerFromFlight (user, params) {
      if (!user || !user.flights.length) return null
      user.flights.forEach(async flight => {
        const foundFlight = await Flight.findById(flight._id)
        foundFlight.passengers = foundFlight.passengers.filter(passenger => passenger._id != params.id)
        foundFlight.save()
      })
    }