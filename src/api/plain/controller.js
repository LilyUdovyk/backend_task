import { success, notFound } from '../../services/response'
import { Plain } from '.'
import { Flight } from '../flight'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Plain.find(query, select, cursor)
  // .populate("flights", "-__v -plain -passengers")
    .then((plains) => plains.map((plain) => plain.view(true)))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Plain.findById(params.id)
    .then(notFound(res))
    .then((flight) => flight ? flight.view(true) : null)
    .then(success(res))
    .catch(next)

export const create = ({ bodymen: { body } }, res, next) =>
  Plain.create(body)
    .then((plain) => plain.view(true))
    .then(success(res, 201))
    .catch(next)

export const update = ({ bodymen: { body }, params, plain }, res, next) =>
  Plain.findById(params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
    //   const isAdmin = user.role === 'admin'
    //   if (!isAdmin) {
    //     res.status(401).json({
    //       valid: false,
    //       message: 'You can\'t change flight\'s data'
    //     })
    //     return null
    //   }
      return result
    })
    .then((plain) => plain ? Object.assign(plain, body).save() : null)
    .then((plain) => plain ? plainview(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Plain.findById(params.id)
    .then(notFound(res))
    .then((plain) => plain ? plain.remove() : null)
    .then(success(res, 204))
    .catch(next)
