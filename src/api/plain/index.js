import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { password as passwordAuth, master, token } from '../../services/passport'
import { index, show, create, update, destroy } from './controller'
import { schema } from './model'
export Plain, { schema } from './model'

const router = new Router()
const { name, model, flights } = schema.tree

/**
 * @api {get} /plain Retrieve plains
 * @apiName RetrievePlains
 * @apiGroup Plain
 * @apiPermission admin
 * @apiParam {String} access_token User access_token.
 * @apiUse listParams
 * @apiSuccess {Object[]} plains List of plains.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Admin access only.
 */
router.get('/',
  token({ required: true }),
  query(),
  index)

/**
 * @api {get} /plains/:id Retrieve plain
 * @apiName RetrievePlain
 * @apiGroup plain
 * @apiPermission public
 * @apiSuccess {Object} plain Plain's data.
 * @apiError 404 Flight not found.
 */
router.get('/:id',
  token({ required: true }),
  show)

/**
 * @api {post} /plains Create plain
 * @apiName CreatePlain
 * @apiGroup Plain
 * @apiPermission master
 * @apiParam {String} access_token Master access_token.
 * @apiParam {String=passenger,admin} [role=passenger] User's role.
 * @apiSuccess (Sucess 201) {Object}  plain Plain's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Master access only.
 */
router.post('/',
  token({ required: true }),
  body({ name, model }),
  create)

/**
 * @api {put} /plains/:id Update plain
 * @apiName UpdatePlain
 * @apiGroup Plain
 * @apiPermission plain
 * @apiParam {String} access_token User access_token.
 * @apiSuccess {Object} plain Plain's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Current passanger or admin access only.
 * @apiError 404 Plain not found.
 */
router.put('/:id',
  token({ required: true }),
  body({ name: { ...name, required: false }, model: { ...model, required: false } }),
  update)


/**
 * @api {delete} /plains/:id Delete plain
 * @apiName DeletePlain
 * @apiGroup Plain
 * @apiPermission admin
 * @apiParam {String} access_token User access_token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 401 Admin access only.
 * @apiError 404 Plain not found.
 */
router.delete('/:id',
  token({ required: true }),
  destroy)

export default router
