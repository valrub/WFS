function main(re, ie, oe, executor) {
  try {
    setGlobalLogger(re, ie, oe, executor);
    var t = new Date();
    Logger.production("Fisrt custom action started: " + t);

    var inputRules = {
      QueryName: {
        user_input_value: ie.QueryName,
        mandatory: "true",
        default_value: "",
        min_value: "",
        max_value: "",
        lookupTable: "",
        regex: "",
        validate: "false"
      }
    };

    var vInputs = validateInput(inputRules);
    re.vInputs = JSON.stringify(vInputs);
    Logger.production(re.vInputs);
    re.chunk = "1000";
    re.sequence = "";

    var te = new Date();
    Logger.production("Fisrt custom action ended: " + te);
    finalize();
  } catch (e) {
    Logger.failure(e);
  }
}
