import MpesaServices from "../services/mpesaService.js";

class MpesaController {
  static async pay (req, res) {
    MpesaServices.handleLNM(req, res);
  };
  static lnmResponse = (req, res) => {
    MpesaServices.lmnResponse(req, res)      
    
  };
  static async cacheResponse (req, res) {
    MpesaServices.cacheResponse(req, res)
  }
}
export default MpesaController;
