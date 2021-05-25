import MpesaServices from "../services/mpesaService.js";

class MpesaController {
  static pay = (req, res) => {
    let { amount, phone } = req.body;
    MpesaServices.handleLNM(amount, phone)
        .then(resp => {
            console.log("controller", resp)
            MpesaServices.handleLMNResponse(resp)
        })
        .catch(err => {
            console.log(err)
        })
  };
}
export default MpesaController;
