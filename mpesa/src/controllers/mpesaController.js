import MpesaServices from "../services/mpesaService.js";

class MpesaController {
  static async pay (req, res) {
    let message = await MpesaServices.handleLNM(req, res);
    console.log("=----------------", message)
    res.send(JSON.stringify(message))
  };
  static lnmResponse = (req, res) => {
    MpesaServices.lmnResponse(req, res)      
    
  };
}
export default MpesaController;
