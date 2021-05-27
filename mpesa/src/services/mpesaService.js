import axios from "axios";
import https from "https";

import DBServices from "./dbServices.js";
import localCache from "./cacheServices.js";
/**
 * Handling the Daraja API
 */
class MpesaServices {
  static async getAT() {
    /**
     * @returns Promise with Auth Token
     */
    var getOptions = {
      host: "sandbox.safaricom.co.ke",
      path: "/oauth/v1/generate?grant_type=client_credentials",
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(process.env.CK + ":" + process.env.CS).toString("base64"),
        Accept: "application/json",
      },
    };
    return new Promise((resolve, reject) => {
      https
        .request(getOptions, (res) => {
          res.setEncoding("utf-8");
          res.on("data", (d) => {
            resolve(JSON.parse(d));
          });
          res.on("error", (e) => {
            reject(e);
          });
        })
        .end();
    });
  }

  static generateTimestamp() {
    /**
     *
     * @param {*} e
     * @returns timestamp of the format YYYYMMDDHHMMSS
     */
    const cleanDate = (e) => {
      return e < 10 ? "0" + e : e;
    };
    let currentDate = new Date();
    let currentTime = new Date(
      currentDate.toLocaleString("en-us", { timeZone: "Africa/Nairobi" })
    );
    let month = cleanDate(currentTime.getMonth() + 1);
    let date = cleanDate(currentTime.getDate());
    let hour = cleanDate(currentTime.getHours());
    let minutes = cleanDate(currentTime.getMinutes());
    let seconds = cleanDate(currentTime.getSeconds());

    return (
      currentTime.getFullYear() +
      "" +
      month +
      "" +
      date +
      "" +
      hour +
      "" +
      minutes +
      "" +
      seconds
    );
  }
  static async handleLNM(req, res) {
    /**
     * @param {req, res}
     * @returns promise Handler for the API response
     */
    let { amount, phone } = req.body;

    const postBody = JSON.stringify({
      BusinessShortCode: process.env.SHORTCODE,
      Password: Buffer.from(
        process.env.SHORTCODE + process.env.PASSKEY + this.generateTimestamp()
      ).toString("base64"),
      Timestamp: this.generateTimestamp(),
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK,
      AccountReference: "LMNOnLoc",
      TransactionDesc: "@SandboxTest",
    });
    //Verify the  AT
    await this.getAT()
      .then((resp) => {
        return resp["access_token"];
      })
      .then((AT) => {
        //valid AT
        let stkOptions = {
          host: "sandbox.safaricom.co.ke",
          path: "/mpesa/stkpush/v1/processrequest",
          method: "POST",
          headers: {
            Authorization: "Bearer " + AT,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postBody, "utf8"),
          },
        };
        return new Promise((resolve, reject) => {
          let post = https.request(stkOptions, (resp) => {
            resp.setEncoding("utf-8");
            resp.on("data", (resp_data) => {
              return resolve(JSON.parse(resp_data));
            });
            resp.on("error", (e) => {
              reject(e);
            });
          });
          post.write(postBody);
          post.end();
        }).then((resp) => {
          let resp_msg = this.handleLMNResponse(resp, phone, amount);
          res.json(resp_msg); //Talk to the FE
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  static handleLMNResponse(resp, phone, amount) {
    /**
     * @params {apiresp, phone, amount}
     * @returns Success / failure message
     */
    if (typeof resp.ResponseCode !== "undefined" && resp.ResponseCode === "0") {
      let requestID = resp.MerchantRequestID;
      let transactionObj = {
        requestID,
        phone,
        amount,
        callBackStatus: false,
        status: "Pending Completion",
      };
      localCache.push(transactionObj);

      let message = {
        success: true,
        requestID,
      };
      return message;
    } else {
      let message = {
        success: false,
        status: "Error Handling STK Push"
      };
      return message;
    }
  }

  static async lmnResponse(req, res) {
    /**
     * @param {http req, res}
     * @returns success on saving on mongo, failure
     */
    let requestID = req.body.Body.stkCallback.MerchantRequestID;
    let resultCode = req.body.Body.stkCallback.ResultCode;
    let status =
      resultCode == "1031"
        ? "Cancelled"
        : resultCode == "1037"
        ? "RequestTimeOut"
        : resultCode == "0"
        ? "Success"
        : "Failed";

    let resultDesc = req.body.Body.stkCallback.ResultDesc;
    const msg = this.updateLocalCache(requestID, status, resultCode, resultDesc, res)
    if (msg) {
      /* Store the data in  the db */
      //DBServices.mongoSave(res, msg)
    }
    let message = {"ResponseCode": "0", "ResponseDesc": "success"}
    console.log("Sending to safaricom",  message)
    res.json(message)
    
  }

  static cacheResponse(req, res) {
    console.log("------cacheresp", req.body)
    let requestID = req.body.requestID
    let resp_obj;
    for (let obj of localCache){
      if (obj.requestID === requestID) {
        console.log(localCache, requestID)
        resp_obj = obj
      }
    }
    res.json({success:resp_obj? true: false, resp_obj})
  }
  static updateLocalCache(requestID, status, resultCode, resultDesc, res) {
    for (let obj of localCache){
      if (obj.requestID === requestID) {
        obj.status = status;
        obj.resultCode = resultCode;
        obj.resultDesc = resultDesc;
        obj.callBackStatus= true
        return obj
      }
    }
  }
}
export { localCache };
export default MpesaServices;
