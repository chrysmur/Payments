class Validator {
  static payvalidator = (req, res, next) => {
    let { amount, phone } = req.body;
    //Validate Phone Number
    /*let regExPattern = /^(?:254|\+254|0)?(7(?:(?:[129][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/;
    let isNumberValid = regExPattern.test(phone);*/
    console.log(req.body)
    let isNumberValid = true;
    if (!isNumberValid) {
      res.status(400).json({
        success: false,
        message: "Invalid Phone number",
      });
    }
    //Validate Amount
    if (parseFloat(amount) <= 0 || isNaN(amount)) {
      res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }
    next();
  };
}
export default Validator;
