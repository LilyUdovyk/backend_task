import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { password as passwordAuth, master, token } from '../../services/passport'
import { index, show, create, update, destroy } from './controller'
import userRoles, { admin } from '../user/user-roles'
import { schema } from './model'
export Plane, { schema } from './model'

const router = new Router()
const { name, model, flights } = schema.tree

/**
 * @api {get} /plane Retrieve planes
 * @apiName RetrievePlanes
 * @apiGroup Plane
 * @apiPermission admin
 * @apiParam {String} access_token User access_token.
 * @apiUse listParams
 * @apiSuccess {Object[]} planes List of planes.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Admin access only.
 */
router.get('/',
  // token({ required: true, roles: admin }),
  token({ required: false }),
  query(),
  index)

/**
 * @api {get} /planes/:id Retrieve plane
 * @apiName RetrievePlane
 * @apiGroup plane
 * @apiPermission public
 * @apiSuccess {Object} plane Plane's data.
 * @apiError 404 Flight not found.
 */
router.get('/:id',
  token({ required: false }),
  show)

/**
 * @api {post} /planes Create plane
 * @apiName CreatePlane
 * @apiGroup Plane
 * @apiPermission master
 * @apiParam {String} access_token Master access_token.
 * @apiParam {String=passenger,admin} [role=passenger] User's role.
 * @apiSuccess (Sucess 201) {Object}  plane Plane's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Master access only.
 */
router.post('/',
  token({ required: true, roles: admin }),
  body({ name, model }),
  create)

/**
 * @api {put} /planes/:id Update plane
 * @apiName UpdatePlane
 * @apiGroup Plane
 * @apiPermission plane
 * @apiParam {String} access_token User access_token.
 * @apiSuccess {Object} plane Plane's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Current passanger or admin access only.
 * @apiError 404 Plane not found.
 */
router.put('/:id',
  token({ required: true, roles: admin }),
  body({ name: { ...name, required: false }, model: { ...model, required: false } }),
  update)


/**
 * @api {delete} /planes/:id Delete plane
 * @apiName DeletePlane
 * @apiGroup Plane
 * @apiPermission admin
 * @apiParam {String} access_token User access_token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 401 Admin access only.
 * @apiError 404 Plane not found.
 */
router.delete('/:id',
  token({ required: true, roles: admin }),
  destroy)

export default router
