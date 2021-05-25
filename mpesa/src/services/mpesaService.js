import axios from "axios";
import https from "https";
/**
 * Handling the Daraja API
 */
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
    let currentDate = new Date();
    let currentTime = new Date(
      currentDate.toLocaleString("en-us", { timeZone: "Africa/Nairobi" })
    );
    let month = currentTime.getMonth() + 1;
    let date = currentTime.getDate();
    let hour = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    let seconds = currentTime.getSeconds();

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
      console.log(this.generateTimestamp())
    const postBody = JSON.stringify({
      BusinessShortCode: process.env.SHORTCODE,
      Password: Buffer.from(
        process.env.SC + process.env.PASSKEY + this.generateTimestamp()
      ).toString("base64"),
      TimeStamp: this.generateTimestamp(),
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: process.env.SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: "https://ngrok.adfasdf.com",
      AccountReference: "LMNOnPow",
      TransactionDesc: "@SandboxTest",
    });
    //Verify the  AT
    this.getAT()
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
              console.log(resp)
            resp.setEncoding("utf-8");
            resp.on("data", (resp_data) => {
                console.log(resp_data)
              resolve(JSON.parse(resp_data));
            });
            resp.on("error", (e) => {
                reject(e)
            });
          });
          post.write(postBody);
          post.end();
        });
      })
      .catch(err => {
          console.log(err)
      })
  }
}
export default MpesaServices;
