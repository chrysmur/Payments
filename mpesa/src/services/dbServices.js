import MongoClient from 'mongodb'

export default class DBServices {
  static async mongoSave( res, trxData) {
    try{
      MongoClient.connect(process.env.MONGO_URI, (err, client) => {
        if(err) {
          console.log(err)
        }
        else {
          const dataid = client.db("LNMDB").collection("LNMTransactions").insertOne(trxData)
          console.log("---mongo insert", dataid)
        }
      })
    }
    catch (e) {
      console.log(e)
    }
  }
}
  
    

    //   console.log("mongo",trxData)
    //   mongoose.connect(
    //   process.env.MONGO_URI,
    //   { useNewUrlParser: true },
    //   (err, db) => {
    //     if (err) process.exit(0);
    //     let db0 = db.db("LNMDB");
    //     let collection = db0.collection("LNMTransactions");
    //     collection.insertOne(trxData, (err, result) => {
    //       if (err) process.exit();
    //     });
    //   });
    // let message = {"ResponseCode": "0", "ResponseDesc": "success"}
    // res.json(message)
  

