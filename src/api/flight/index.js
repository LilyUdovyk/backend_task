import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { password as passwordAuth, master, token } from '../../services/passport'
import { index, show, create, update, destroy } from './controller'
import { schema } from './model'
export Flight, { schema } from './model'

const router = new Router()
const { plain, time, passengers } = schema.tree

/**
 * @api {get} /flight Retrieve flights
 * @apiName RetrieveFlights
 * @apiGroup Flight
 * @apiPermission admin
 * @apiParam {String} access_token User access_token.
 * @apiUse listParams
 * @apiSuccess {Object[]} flights List of flights.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Admin access only.
 */
router.get('/',
  token({ required: true }),
  query(),
  index)

/**
 * @api {get} /flights/:id Retrieve flight
 * @apiName RetrieveFlight
 * @apiGroup flight
 * @apiPermission public
 * @apiSuccess {Object} flight Flight's data.
 * @apiError 404 Flight not found.
 */
router.get('/:id',
  token({ required: true }),
  show)

/**
 * @api {post} /flights Create flight
 * @apiName CreateFlight
 * @apiGroup Fight
 * @apiPermission master
 * @apiParam {String} access_token Master access_token.
 * @apiParam {String=passenger,admin} [role=passenger] User's role.
 * @apiSuccess (Sucess 201) {Object} flight Flight's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Master access only.
 */
router.post('/',
  token({ required: true }),
  body({ plain, time }),
  create)

/**
 * @api {put} /flights/:id Update flight
 * @apiName UpdateFlight
 * @apiGroup Flight
 * @apiPermission flight
 * @apiParam {String} access_token User access_token.
 * @apiSuccess {Object} flight Flight's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Current passanger or admin access only.
 * @apiError 404 Flight not found.
 */
router.put('/:id',
  token({ required: true }),
  body({ plain: { ...plain, required: false }, time }),
  update)


/**
 * @api {delete} /flights/:id Delete flight
 * @apiName DeleteFlight
 * @apiGroup Flight
 * @apiPermission admin
 * @apiParam {String} access_token User access_token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 401 Admin access only.
 * @apiError 404 Flight not found.
 */
router.delete('/:id',
  token({ required: true }),
  destroy)

export default router
