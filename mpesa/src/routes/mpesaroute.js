import express from "express";
import Validator from "../helpers/validators.js";
import MpesaController from "../controllers/mpesaController.js"

const mpesaRoute = express.Router();

/**
 * @api {post} /api/pay Create user
 * @apiName Mpesa Payment
 * @apiPermission User
 * @apiGroup User
 *
 * @apiParam  {String} [amount] username
 * @apiParam  {String} [phone] Phone number
 *
 * @apiSuccess (200) {Object} Mpesa response status
 * @apiFail (400) {Error} Validation or Mpesa response
 */

mpesaRoute.post("/", Validator.payvalidator, MpesaController.pay);

export { mpesaRoute };
