import express from "express";
import Validator from "../helpers/validators.js";
import MpesaController from "../controllers/mpesaController.js"

const mpesaRoute = express.Router();

/**
 * @api {post} /api/pay
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

mpesaRoute.post("/hooks/lnmresponse", MpesaController.lnmResponse) //hook

mpesaRoute.post("/cbresponse", MpesaController.cacheResponse)

export { mpesaRoute };
