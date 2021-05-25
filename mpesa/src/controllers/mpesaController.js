import MpesaServices from "../services/mpesaService.js";

class MpesaController {
  static pay = (req, res) => {
    let { amount, phone } = req.body;
    MpesaServices.handleLNM(amount, phone)
    // console.log("in controle", req.body)
    // res.send({
    //     success:true,
    //     message:"Got to control"
    // })
  };
}
export default MpesaController;
