import axios from "axios";
import https from "https";
import { type } from "os";
/**
 * Handling the Daraja API
 */

// store transactions locally
const localCache = [];
class MpesaServices {
  static async getAT() {
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
    // API expects time stamp of the format YYYYMMDDHHMMSS
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
  static async handleLNM(amount, phone) {
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
      CallBackURL: "http://a02999cccb8e.ngrok.io",
      AccountReference: "LMNOnPow",
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
              resolve(JSON.parse(resp_data));
            });
            resp.on("error", (e) => {
              reject(e);
            });
          });
        //   post.write(postBody);
        //   post.end();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  static handleLMNResponse(resp) {
      console.log(resp)
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
        requestID: resp.MerchantRequestID,
      };
      res.send(message);
    } else {
      let message = {
        success: false,
        status: "Error Handling STK",
      };
      res.status(501).send(message);
    }
  }
}

export default MpesaServices;
