import mongo from "mongodb";
import dotenv from "dotenv";

export default class MongoServices {
  static async save( res, trxData) {
      console.log("mongo",trxData)
    mongo.connect(
      process.env.MONGO_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (err) process.exit(0);
        let db0 = db.db("LNMDB");
        let collection = db0.collection("LNMTransactions");
        collection.insertOne(trxData, (err, result) => {
          if (err) process.exit();

        });
      });
    let message = {"ResponseCode": "0", "ResponseDesc": "success"}
    res.json(message)
  }
}
