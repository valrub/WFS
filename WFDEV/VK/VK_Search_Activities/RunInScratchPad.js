var ie = {
                externalId: 'dfddsfdfd',
                title: "KYな安倍靖国参拝に米国も批判－思想の左右でなく経済で外交を考えてみよう",
                keyword: "安倍 晋三",
                parent_externalId: "p1321168801",
                url: "https://www.newsgeorgia.ge/v-tbilisi-otrestavriruyut-unikalnye-raboty-hudozhnika-petre-otsheli/"
};
var re = {

};
re.placeholder2 = 1;
var oe = {};
var executor = {
                reportError: function (a, b, c, d) {
                                console.log(a, b, c, d)
                },
                addEntity: function (a) {
                                console.log(a);
                },
                ready: function () {
                                console.log('ready!');
                },
                saveBinary: function (a, b, c, d) {
                                console.log(d);
                },
                flushEntities: function () {
                                console.log('flushing...');
                }
};
//-----------------------------------------------------------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// (#) STANDARD LIBRARY  (002.002.004) ///////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// (#) STANDARD LIBRARY  (002.002.013) ///////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------// 
/*
var _executor;
var _re;
var _ie;
change this in CA if you need other values for "flushAt" for example 
persistDataSettings.flushAt = 300 ~~ */
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var persistDataSettings = {
	flushAt: 250,
	useSaveBinaryForVideos: false,
};
//---------------------------------------------- LOGGER -----------------------------------------------//
var Logger = {
	_debugLevel: 2,
	//-------------------------------------------------------------------------------------------------//
	//KNOWN CUSTOM ERRORS
	_customErrors: {
		'801': 'Configuration Not Found',
		'600': 'Wrong Input Params',
		'666': 'FATAL ERROR! PROCESS ENDED.',
		'400011': 'XPATH NOT FOUND',
		'204': 'No content for this part'
	},
	//-------------------------------------------------------------------------------------------------//
	_statisticsMessage: ""
		//-------------------------------------------------------------------------------------------------//
		,
	production: function (pMessage, pErrCode) {
			this._log(pMessage, pErrCode, 'INFO', '777', 1, false);
		}
		//-------------------------------------------------------------------------------------------------//
		,
	error: function (pMessage, pErrCode) {
			this._log(pMessage, pErrCode, 'ERROR', '13', 1, false);
		}
		//-------------------------------------------------------------------------------------------------//
		,
	failure: function (pMessage, pErrCode) {
			this._log(pMessage, pErrCode, 'ERROR', '666', 1, true);
		}
		//-------------------------------------------------------------------------------------------------//
		,
	warning: function (pMessage, pErrCode) {
			this._log(pMessage, pErrCode, 'WARNING', '101', 2, false);
		}
		//-------------------------------------------------------------------------------------------------//
		,
	debug: function (pMessage, pErrCode) {
			this._log(pMessage, pErrCode, 'INFO', '11', 4, false);
		}
		//-------------------------------------------------------------------------------------------------//
		,
	statistic: function (pMessage, pErrCode) {
			var _self = this,
				_msg = pMessage;
			_self._readStatistics();
			_msg += "\n" + _self._statisticsMessage;
			_self.production(_msg, '778');
		}
		//-------------------------------------------------------------------------------------------------//
		,
	_readStatistics: function () {
			var _self = this,
				txt = "Data collection statistic";
			if (_re._statistics) {
				try {
					var tmp = JSON.parse(_re._statistics),
						sum = 0;
					txt += ":\n";
					for (var key in tmp) {
						if (tmp.hasOwnProperty(key)) {
							txt += "  " + key + ": " + tmp[key] + ",\n";
							sum += tmp[key];
						}
					}
					txt += "Total recodrs: " + sum;
					_self._statisticsMessage = txt;
				} catch (e) {
					_self.error("readStatistics() :: " + e + " at line " + e.lineNumber);
				}
			} else {
				_self.production(txt + " was not applied.");
			}
		}
		//-------------------------------------------------------------------------------------------------//
		,
	_log: function (pMsg, pErr, pSeverity, pDefaultError, pLevel, pFail) {
			var _self = this;
			if (pLevel <= _self._debugLevel) {
				if (pMsg === undefined)
					console.log('ERROR: Message not passed to Logger function');
				else {
					var _msg = '';
					var _code = '';
					if (pErr === undefined) {
						_msg += pMsg;
						_code = pDefaultError;
					} else {
						try {
							var _errMsg = _self._customErrors[pErr];
							if (_errMsg !== undefined) {
								_msg = _errMsg + ' : ' + pMsg;
								_code = pErr;
							} else {
								_msg = pMsg;
								_code = pErr;
							}
						} catch (e) {
							_msg = pMsg;
							_code = pErr;
						}
					}
					_executor.reportError(_code, pSeverity, _msg, pFail);
				}
			}
		}
		//-------------------------------------------------------------------------------------------------//
};

function validateInput(inputJson) {
	try {
		var validatedMSG = "Input values to be used by WF: \n";
		var validatedInput = {};
		for (var param in inputJson) {
			var result = validateParam(inputJson[param], param);
			if (result.returnCode === "200") {
				validatedMSG += param + ": " + result.value + "\n";
				validatedInput[param] = result.value;
			} else if (result.returnCode === "100340") {
				Logger.failure("The input parameter was not valid: " + result.description, "100340");
			} else if (result.returnCode === "100310") {
				validatedMSG += param + ": " + result.value + "\n";
				validatedInput[param] = result.value;
				Logger.warning("The input parameter was not valid: " + result.description, "100310");
			} else if (result.returnCode === "100320") {
				validatedMSG += param + ": " + result.value + "\n";
				validatedInput[param] = result.value;
				Logger.warning(result.description, "100320");
			} else if (result.returnCode === "100330") {
				Logger.warning("The input parameter was not valid: " + result.description, "100330");
			}
		}

		Logger.production(validatedMSG);
		return validatedInput;
	} catch (e) {
		Logger.failure("Error while validating input :: " + e.message);
	}
}

function validateParam(paramObj, inputName) {
	try {
		var res = {
			value: "",
			returnCode: "",
			description: ""
		}
		var isValid = true;
		var failedChecks = "The input parameter did not pass the ";
		res.description = "Validation check for input parameter '" + inputName + "':\n ";

		if (paramObj.default_value && !paramObj.user_input_value) {
			res.description += "Input parameter not set. Will use the preset default value of: " + paramObj.default_value;
			res.value = paramObj.default_value;
			res.returnCode = "100320";
			return res;
		}
		if (paramObj.validate === "false") {
			res.returnCode = "200";
			res.description += "The parameter did not require validation!";
			res.value = paramObj.user_input_value;
			return res;
		}
		if (paramObj.regex) {
			var reg = new RegExp(paramObj.regex);
			if (reg.test(paramObj.user_input_value)) {
				res.description += "Passed the regex check!\n";
				res.value = paramObj.user_input_value;
			} else {
				isValid = false;
				failedChecks += "regex, ";
			}
		}
		if (paramObj.min_value) {
			if (isNumeric(paramObj.user_input_value)) {
				if (parseFloat(paramObj.min_value) <= parseFloat(paramObj.user_input_value)) {
					res.description += "Passed the minimum value check!\n";
					res.value = paramObj.user_input_value;
				} else {
					isValid = false;
					failedChecks += "min value, ";
				}
			} else {
				isValid = false;
				failedChecks += "min value, ";
			}
		}
		if (paramObj.max_value) {
			if (isNumeric(paramObj.user_input_value)) {
				if (parseFloat(paramObj.max_value) >= parseFloat(paramObj.user_input_value)) {
					res.description += "Passed the maximum value check!\n";
					res.value = paramObj.user_input_value;
				} else {
					isValid = false;
					failedChecks += "max value, ";
				}
			} else {
				isValid = false;
				failedChecks += "max value, ";
			}
		}
		if (paramObj.lookupTable) {
			if (paramObj.user_input_value) {
				paramObj.user_input_value = paramObj.user_input_value.toLowerCase();
				if (paramObj.lookupTable.hasOwnProperty(paramObj.user_input_value)) {
					res.value = paramObj.lookupTable[paramObj.user_input_value];
				} else {
					isValid = false;
					failedChecks += "valid option name, ";
				}
			} else {
				isValid = false;
				failedChecks += "valid option name, ";
			}
		}
		if (!isValid) {
			if (paramObj.default_value) {
				res.description += failedChecks.slice(0, -2) + " validation and will use the preset default value of: " + paramObj.default_value;
				res.value = paramObj.default_value;
				res.returnCode = "100310";
			} else if (paramObj.mandatory === "true") {
				res.description += failedChecks.slice(0, -2) + " This is a mandatory parameter. The flow will fail!";
				res.returnCode = "100340";
			} else {
				res.description += failedChecks.slice(0, -2) + " This is an optional parameter with no default value. The flow will continue without this parameter!";
				res.returnCode = "100330";
			}
		} else {
			res.returnCode = "200";
			res.description += " Passed!";
		}

		return res;
	} catch (e) {
		Logger.failure("Error while validating specific parameter :: " + e.message + " :: " + JSON.stringify(paramObj));
	}
}

function setGlobalLogger(pRTE, pIE, pOE, pExecutor) {
	//Prompt only in DEBUG
	if (Logger._debugLevel == 4) pExecutor.reportError('200', 'INFO', 'setGlobalLogger STARTED with debugLevel = ' + Logger._debugLevel, false);
	_executor = pExecutor;
	_re = pRTE;
	_ie = pIE;
	var _tmpData = Object.create(PersistObject);
	_tmpData._persistSettings.flushAt = persistDataSettings.flushAt;
	_tmpData._persistSettings.useSaveBinaryForVideos = persistDataSettings.useSaveBinaryForVideos;
	_tmpData._persistSettings.downloadVideoFiles = (_ie.downloadVideoFiles == "true");
	if (_re._statistics) {
		_tmpData._statistics = JSON.parse(_re._statistics);
	} else {
		console.log("We wait for statistics calculation.");
	}
	window.addEntity = _tmpData.addEntity.bind(_tmpData);
	window.addImage = _tmpData.addImage.bind(_tmpData);
	window.onSuccess = _tmpData.onSuccess.bind(_tmpData);
	window.onError = _tmpData.onError.bind(_tmpData);
	window.finalize = _tmpData.finalize.bind(_tmpData);
	window.callStackAdd = _tmpData.callStackAdd.bind(_tmpData);
	window.callStackRemove = _tmpData.callStackRemove.bind(_tmpData);

}
//---------------------------------------------- PROCESS ----------------------------------------------//
function Process() {
	this.Run = function (pFunctionName, pIsMandatory, pExecutionContext) {
		var runStatus = {};
		var msgForceStop;
		runStatus = pFunctionName(pExecutionContext.pMarker, pExecutionContext);
		if (runStatus.returnCode === "200")
			Logger.production("[" + pExecutionContext.pMarker + "] " + pFunctionName.name + " Done. Total " + runStatus.totalCollected + " items saved", runStatus.returnCode.toString());
		else {
			if (pIsMandatory === true) {
				msgForceStop = "WF is forced to end execution";
			} else {
				msgForceStop = " ";
			}
			if ((pIsMandatory === true))
				Logger.failure("[" + pExecutionContext.pMarker + "] " + pFunctionName.name + " FAILED." + msgForceStop, runStatus.returnCode.toString());
			else
				Logger.error("[" + pExecutionContext.pMarker + "] " + pFunctionName.name + " FAILED." + msgForceStop, runStatus.returnCode.toString());
		}
	}
	this.GetStatistics = function () {}
}

//---------------------------------------------- EXTRACT ----------------------------------------------//
function Extract(pExecutionContext) {
	this.globalLogExtracted = pExecutionContext.globalLogExtracted;
	this.globalWPXP = pExecutionContext.globalWPXP;

	//-------------------------------------------------------------------------------------------------//
	this.GetXPATH = function (pXP) {
			var _ans = NaN;
			WPXP = this.globalWPXP;
			if ((pXP.indexOf("/") > 0) || (pXP.indexOf("[") > 0) || (pXP.indexOf("*") > 0) || (pXP.indexOf(".") > 0)) //That's not abstract name, but a real XPATH notation
			{
				_ans = pXP;
			} else {
				try {
					_ans = WPXP[pXP];
				} catch (enumex) {
					Logger.error("XPATH ENUM NOT DEFINED");
					Logger.error(pXP);
					_ans = "403";
				}
			}
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//
	this.LoadPage = function (pURL, Marker) {
			Marker = Marker === undefined ? '*' : Marker;
			var _ans = {
				Value: NaN,
				returnCode: NaN,
				Description: NaN
			}
			var _xhr = new XMLHttpRequest();
			try {
				_xhr.open("GET", pURL, false);
				_xhr.send();
				var _result = _xhr.responseText;
				var _parser = new DOMParser();
				_ans.Value = _parser.parseFromString(_result, "text/html");
				_ans.returnCode = "200";
			} catch (er) {
				_ans.Description = "EXCEPTION2: After attempt to open " + pURL + " -> " + er.message;
				_ans.returnCode = "404";
				Logger.error(_ans.Description, "404");
			}
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//
	this.GetAttribute = function (pInpParams, Marker) {
			//This function tries to process DOM structure on given XPATH (pInpParams.xpathName) - logical name or real XPATH
			//And returns attribute value found in pInpParams.attributeName.
			// Marker is an optional parameter used for adding [Line Number] to log entries
			// pInpParams.mandatory - specify either in case of not found value error code should be 400011 (XPATH NOT Found)
			// pInpParams.context - specifies search context for XPATH Evaluation (by default - "document" will be used)
			//In case the value is found it will be returned
			//Return codes:
			//200 - OK
			//204 - Empty Value
			//404 -  Value was not found and this XPATH considered by caller as NOT mandatory
			//400011 -  Value was not found and this XPATH considered by caller as mandatory
			//---------------------------------------------------------------------------------------------------//
			var TheContext = pInpParams.context === undefined ? document : pInpParams.context;
			var ThePage = pInpParams.page === undefined ? document : pInpParams.page;
			Marker = Marker === undefined ? '*' : Marker;
			_flagLogExtracted = this.globalLogExtracted;
			// ... check parameters .............
			var _xpathName = pInpParams.xpathName;
			var _attributeName = pInpParams.attributeName;
			var _errCode;
			var Mandatory;
			if ((typeof pInpParams.mandatory == 'undefined') || (isNaN(pInpParams.mandatory))) {
				Mandatory = false;
			} else {
				if (pInpParams.mandatory > 0)
					Mandatory = true;
				else
					Mandatory = false;
			}
			if (Mandatory) {
				_errCode = "400011";
			} else {
				_errCode = "404";
			}
			var xp = this.GetXPATH(_xpathName);
			var _ans = {
				Value: null,
				returnCode: _errCode,
				Description: 'NotFound'
			}
			try {
				_ans.Value = ThePage.evaluate(xp, TheContext, null, 9, null).singleNodeValue.getAttribute(_attributeName);
				if (_ans.Value.length > 0) //There is value
				{
					_errCode = "200";
				} else //empty string
				{
					_errCode = "204"; // No content
					_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "[" + _attributeName + "]} is empty";
					_ans.returnCode = parseInt(_errCode, 10);
					Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
				}
				if (_flagLogExtracted) {
					Logger.debug("[" + Marker + "] " + _xpathName + " = " + _ans.Value);
				}
			} catch (extext) {
				_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "[" + _attributeName + "]} is empty";
				_ans.returnCode = parseInt(_errCode, 10);
				Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
			}
			_ans.returnCode = _errCode;
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//
	this.GetText = function (pInpParams, Marker) {
			//This function tries to process DOM structure on given XPATH (pInpParams.xpathName) - logical name or real XPATH
			//And returns textContent found over there.
			// Marker is an optional parameter used for adding [Line Number] to log entries
			// pInpParams.mandatory - specify either in case of not found value error code should be 400011 (XPATH NOT Found)
			// pInpParams.context - specifies search context for XPATH Evaluation (by default - "document" will be used)
			//In case the value is found it will be returned
			//Return codes:
			//200 - OK
			//204 - Empty Value
			//404 -  Value was not found and this XPATH considered by caller as NOT mandatory
			//400011 -  Value was not found and this XPATH considered by caller as mandatory
			//--------------------------------------------------------------------------------------------------//
			Marker = Marker === undefined ? '*' : Marker;
			var TheContext = pInpParams.context === undefined ? document : pInpParams.context;
			var ThePage = pInpParams.page === undefined ? document : pInpParams.page;
			_flagLogExtracted = this.globalLogExtracted;
			// ... check parameters .............
			var _xpathName = pInpParams.xpathName;
			var _errCode;
			var Mandatory;
			if ((typeof pInpParams.mandatory == 'undefined') || (isNaN(pInpParams.mandatory))) {
				Mandatory = false;
			} else {
				if (pInpParams.mandatory > 0)
					Mandatory = true;
				else
					Mandatory = false;
			}
			if (Mandatory) {
				_errCode = "400011";
			} else {
				_errCode = "404";
			}
			var xp = this.GetXPATH(_xpathName);
			var _ans = {
				Value: null,
				returnCode: _errCode,
				Description: 'NotFound'
			}
			try {
				_ans.Value = ThePage.evaluate(xp, TheContext, null, 9, null).singleNodeValue.textContent.trim();
				if (_ans.Value.length > 0) //There is value
				{
					_errCode = "200";
				} else //empty string
				{
					_errCode = "204" // No content
					_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "} is empty";
					_ans.returnCode = parseInt(_errCode, 10);
					Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
				}
				if (_flagLogExtracted) {
					Logger.debug("[" + Marker + "] " + _xpathName + " = " + _ans.Value);
				}
			} catch (extext) {
				_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "} not found";
				_ans.returnCode = parseInt(_errCode, 10);
				Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
			}
			_ans.returnCode = _errCode;
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//
	this.GetCollection = function (pInpParams, Marker) {
			//This function tries to process DOM structure on given XPATH (pInpParams.xpathName) - logical name or real XPATH
			//And returns collection of elements found over there.
			// Marker is an optional parameter used for adding [Line Number] to log entries
			// pInpParams.mandatory - specify either in case of not found value error code should be 400011 (XPATH NOT Found)
			// pInpParams.context - specifies search context for XPATH Evaluation (by default - "document" will be used)
			//In case the value is found it will be returned
			//Return codes:
			//200 - OK
			//204 - Empty Collection
			//404 -  Value was not found and this XPATH considered by caller as NOT mandatory
			//400011 -  Value was not found and this XPATH considered by caller as mandatory
			//---------------------------------------------------------------------------------------------------//
			var TheContext = pInpParams.context === undefined ? document : pInpParams.context;
			var ThePage = pInpParams.page === undefined ? document : pInpParams.page;
			Marker = Marker === undefined ? '*' : Marker;
			_flagLogExtracted = this.globalLogExtracted;
			// ... check parameters .............
			var _xpathName = pInpParams.xpathName;
			var _errCode;
			var Mandatory;
			if ((typeof pInpParams.mandatory == 'undefined') || (isNaN(pInpParams.mandatory))) {
				Mandatory = false;
			} else {
				if (pInpParams.mandatory > 0)
					Mandatory = true;
				else
					Mandatory = false;
			}
			if (Mandatory) {
				_errCode = "400011";
			} else {
				_errCode = "404";
			}
			var xp = this.GetXPATH(_xpathName);
			var _ans = {
				Value: NaN,
				returnCode: _errCode,
				Description: NaN
			}
			try {
				var _col = ThePage.evaluate(xp, TheContext, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				_ans.Length = parseInt(_col.snapshotLength, 10);
				if (_ans.Length > 0) {
					_errCode = "200";
					var _col = ThePage.evaluate(xp, TheContext, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
					_ans.Value = _col;
					if (_flagLogExtracted) {
						Logger.debug("[" + Marker + "] " + _xpathName + " #" + _ans.Length + " elements found");
					}
				} else {
					_ans.Length = 0;
					_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "} not found";
					_ans.returnCode = parseInt(_errCode, 10);
					Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
				}
			} catch (extext) {
				_ans.Length = 0;
				_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "} not found";
				_ans.returnCode = parseInt(_errCode, 10);
				Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
			}
			_ans.returnCode = _errCode;
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//
	this.GetPageText = function (pURL, pLeft, pRight, Marker) {
			_flagLogExtracted = false;
			Marker = Marker === undefined ? '*' : Marker;
			var RG = pLeft + "(.*)" + pRight;
			var _ans = {
				Value: NaN,
				returnCode: NaN,
				Description: NaN
			}
			var _xhr = new XMLHttpRequest();
			try {
				_xhr.open("GET", pURL, false);
				_xhr.send();
				var _result = _xhr.responseText;
				_ans.Value = _result.match(RG);
				if (_flagLogExtracted) {
					Logger.debug("[" + Marker + "]  = " + _ans.Value);
				}
				_ans.returnCode = "200";
			} catch (er) {
				_ans.Description = "EXCEPTION1: After attempt to open " + pURL + " -> " + er.message;
				_ans.returnCode = "404";
				Logger.error(_ans.Description, "404");
			}
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//

	this.ClickButtons = function (pXpathName, pMarker, pMaxIterations, pCallbackFunction, pProcess) {

			var _maxIterations = pMaxIterations === undefined ? 10 : pMaxIterations;

			window.scrollBy(0, 2000); // scroll a bit first

			var _res = {
				totalCollected: 0,
				returnCode: ""
			};

			var _xp = this.GetXPATH(pXpathName);

			var keepClicking = true;
			var cntClick = 0;

			var keepClickingInterval = setInterval(function () {
				if (keepClicking && (cntClick++ <= _maxIterations)) {
					Logger.debug("------------------------- Start Click Btn ---------------------------------");
					window.scrollBy(0, 500); // scroll a bit first
					// ------------ CHECK THAT THERE IS STILL WHAT TO EXPAND ----------------------------------

					var resultPosts = document.evaluate(_xp, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

					var len = resultPosts.snapshotLength;

					keepClicking = (len > 0);

					Logger.debug("[LEN = " + len + "] -- [Cnt = " + cntClick + "]");

					if (keepClicking) {
						try {
							var el = resultPosts.snapshotItem(0); //First element to be processed

							if (el.fireEvent) {
								el.fireEvent('onclick');

							} else {
								var evObj = document.createEvent('Events');

								evObj.initEvent("click", true, false);

								el.dispatchEvent(evObj);
							}
						} catch (e) {
							console.log("500", "ERROR", "eventFire() :: " + e + " at line " + e.lineNumber, false);
						}
					}
					Logger.debug("------------------------- Stop Click Btn -----------------------------------");
				} else {
					Logger.debug("-------------------------- Enough clicking. Execute function");
					clearInterval(keepClickingInterval);
					pCallbackFunction(pProcess);
				}
			}, 3000)

			return _res;
		}
		//-------------------------------------------------------------------------------------------------//
		// This is the getUrls function. It takes two arguments.
		// 1) an object consisiting of the following fields:
		//     - collectionXpath (the name of the xpath (from your Xpath library) which finds the collection of elements that have the URLS in them).
		//     - attributeXpath (the name of the xpath (from your Xpath library) which finds the specific element taht has the attribute that contains the URL).
		//     - attributeName (name of the attribute which contains the URL ("href")).
		//     - bulkSize (the size of the bulks that you are going to resieve as an output).
		// 2) a Marker for logging.
		//
		// The result of this function is an array containing bulks of urls (delimited by ",") depending on "bulkSize". 
	this.getUrls = function (pInpParams, pMarker) {
		var _res = {
			totalCollected: 0,
		};
		try {
			var collectionXpath = pInpParams.collectionXpath;
			var attributeXpath = pInpParams.attributeXpath;
			var attributeName = pInpParams.attributeName;
			var bulkSize = pInpParams.bulkSize;

			var errorCode = "400011";
			var cntItems = 0;
			var cntBulk = 0;
			var bulkHolder = '';

			var elementsCollection = this.GetCollection({
					xpathName: collectionXpath,
					mandatory: "0"
				},
				pMarker
			);

			if (elementsCollection.returnCode === "200") {

				var iterator = elementsCollection.Value;
				var thisNode = iterator.iterateNext();
				var urls = [];

				while (thisNode) {

					var vAttribute = this.GetAttribute({
						context: thisNode,
						attributeName: attributeName,
						xpathName: attributeXpath,
						mandatory: "0"
					}, attributeXpath).Value;

					if (elementsCollection.Length <= bulkSize) {
						bulkHolder = bulkHolder + vAttribute + ',';
						cntBulk++;
						console.log(vAttribute);
						if (cntBulk === elementsCollection.Length) {
							urls.push(bulkHolder);
						}
					} else if (cntBulk <= bulkSize) {
						bulkHolder = bulkHolder + vAttribute + ',';
						cntBulk++;
					} else {
						cntBulk = 0;

						urls.push(bulkHolder);
						bulkHolder = '';
						bulkHolder = bulkHolder + vAttribute + ',';
						cntBulk++;
					}
					cntItems++;
					thisNode = iterator.iterateNext();
				}

				_res.totalCollected = cntItems;
				_res.result = urls;
				_res.returnCode = "200";

				return _res
			} else {
				_res.Description = "[" + pMarker + "] <" + errorCode + ">  Element located at XPATH {" + collectionXpath + "} not found";
				Logger.error(_res.Description, errorCode);
			}
		} catch (e) {
			Logger.error("getUrls() :: " + e.message + " at line " + e.lineNumber, "404");
		}
		return _res;
	}
}

// ADD_ENTITY, ADD_IMAGE AND FINALIZE
var PersistObject = {
		// Holds statistic counts
		_statistics: {},
		_callStack: [],
		_persistSettings: {
			collectedRecords: 0,
			scheduledImages: 0,
			flushAt: 0,
			downloadVideoFiles: true,
			useSaveBinaryForVideos: false,
			testVar: "Pesho"
		},
		_itemTypeEnum: {
			"2": "Topic",
			"3": "Comment",
			"4": "Web Entity",
			"5": "Image",
			"6": "Album",
			"12": "Relations",
			"15": "Address",
			"16": "Identifier",
			"17": "Date",
			"18": "Account Object",
			"22": "Video",
			"23": "Email",
			"24": "Key Value",
			"25": "File",
		},
		_type2Enum: {
			"1": "Comment",
			"2": "Like",
			"3": "Link",
			"4": "Friends Added",
			"5": "Event Attendance",
			"6": "Picture",
			"7": "Video",
			"8": "Profile Change",
			"9": "Shared Link",
			"10": "Join Group",
			"11": "Media",
			"12": "Removed Comment",
			"13": "Recent Activities",
			"14": "Regular Post",
			"15": "Article",
			"16": "Search Results",
			"17": "Unstructured Data",
			"18": "Tagged",
			"19": "Endorse",
			"20": "Attend Event",
			"21": "Decline Event",
			"22": "Maybe Event",
			"23": "Awaiting Reply",
			"24": "Recommended",
			"25": "Status Changed",
			"26": "With Media",
			"27": "Dislike",
			"28": "Regular Image",
			"29": "Avatar",
			"30": "Avatar Background",
			"31": "Attached Image",
			"32": "Regular Album",
			"33": "Love",
			"34": "Haha",
			"35": "Yay",
			"36": "Wow",
			"37": "Sad",
			"38": "Angry",
			"39": "Thankful",
		},
		_type3Enum: {
			"1": "Comment",
			"2": "Like",
			"3": "Link",
			"4": "Friends Added",
			"5": "Event Attendance",
			"6": "Picture",
			"7": "Video",
			"8": "Profile Change",
			"9": "Shared Link",
			"10": "Join Group",
			"11": "Media",
			"12": "Removed Comment",
			"13": "Recent Activities",
			"14": "Regular Post",
			"15": "Article",
			"16": "Search Results",
			"17": "Unstructured Data",
			"18": "Tagged",
			"19": "Endorse",
			"20": "Attend Event",
			"21": "Decline Event",
			"22": "Maybe Event",
			"23": "Awaiting Reply",
			"24": "Recommended",
			"25": "Status Changed",
			"26": "With Media",
			"27": "Dislike",
			"28": "Regular Image",
			"29": "Avatar",
			"30": "Avatar Background",
			"31": "Attached Image",
			"32": "Regular Album",
			"33": "Love",
			"34": "Haha",
			"35": "Yay",
			"36": "Wow",
			"37": "Sad",
			"38": "Angry",
			"39": "Thankful",
		},
		_type4Enum: {
			"1": "Person",
			"2": "Event",
			"3": "Group",
			"4": "Company",
			"5": "Location",
			"6": "Education",
			"7": "Page",
		},
		_type5Enum: {
			"1": "Image",
			"2": "Avatar",
			"3": "Background image",
			"4": "Cover image",
		},
		_type6Enum: {
			"1": "Regular",
			"2": "Profile",
			"3": "Wall Photos",
			"4": "Cover photos",
			"5": "Mobile uploads",
		},
		_type12Enum: {
			"1": "Web Friend",
			"2": "Attending",
			"3": "Maybe attending",
			"4": "Awaiting reply",
			"5": "Not attending",
			"6": "Brother",
			"7": "Sister",
			"8": "Daughter",
			"9": "Mother",
			"10": "Father",
			"11": "Uncle",
			"12": "Aunt",
			"13": "Cousin (male)",
			"14": "Cousin (female)",
			"15": "Study",
			"16": "Teach",
			"17": "Relationship",
			"18": "Member",
			"19": "Owner",
			"20": "Admin",
			"21": "Creator",
			"22": "For",
			"23": "Employee",
			"24": "Employer",
			"25": "Recommendation",
			"26": "Interested",
			"27": "Tagged",
			"28": "nephew",
			"29": "CheckIn",
			"30": "Like",
			"31": "Share",
			"32": "Shared",
			"33": "Created By",
			"34": "FOLLOWING",
			"35": "FOLLOWER",
			"36": "TALKING_ABOUT",
			"37": "BORN_IN",
			"38": "IS_BORN_PLACE_OF",
			"39": "LIVE_IN",
			"40": "IS_CURRENT_ PLACE_OF",
			"41": "BEEN_TO",
			"42": "IS_VISIT_LOCATION",
			"43": "BORN_ON",
			"44": "IS_BIRTHDAY_OF",
			"45": "JOIN_ON",
			"46": "IS_JOIN_DATE_OF",
			"47": "LAST_ACTIVE_ON",
			"48": "IS_LAST_ ACTIVITY_OF",
			"49": "PARENT",
			"50": "CHILD",
			"51": "SPOUSE",
			"52": "RELATIVE",
			"53": "POSTED_FROM",
			"54": "HAS_A_POST_OF",
			"55": "TO",
			"56": "CC",
			"57": "BCC",
			"58": "LOCATED_AT",
			"59": "LOCATION_OF",
		},
		_type15Enum: {
			"1": "Born at",
			"2": "Live in",
			"3": "Location",
			"4": "Located at",
			"5": "education",
			"6": "work",
		},
		_type16Enum: {
			"1": "Home Page",
			"2": "EMail",
			"3": "IM Screen Name",
			"4": "Phone",
			"5": "user Id",
		},
		_type17Enum: {
			"1": "Born",
			"2": "Created",
			"3": "Start time",
			"4": "End time",
			"5": "Join date",
			"6": "Last Activity",
		},
		_updateStatistics: function (entity) {
			var _self = this;
			try {
				var thisItemType = _self._itemTypeEnum[entity.itemType],
					typeEnum = "_type" + entity.itemType + "Enum",
					thisType, toIncrement;
				// if we have value in 'type' property try to get 'type' enumuration (ENUM)
				if (entity.type) {
					try {
						thisType = _self[typeEnum][entity.type];
					} catch (e) {
						Logger.production("Please check data you persist. No 'Entity type' ENUM present for Entity of itemType: " + entity.itemType);
					}
				}
				// build string for statistics count
				toIncrement = thisItemType + (thisType ? " (" + thisType + ")" : "");
				if (_self._statistics[toIncrement]) {
					_self._statistics[toIncrement] += 1;
				} else {
					_self._statistics[toIncrement] = 1;
				}
			} catch (e) {
				Logger.error("_updateStatistics():: " + e + " at line " + e.lineNumber);
			}
		},
		addEntity: function addEntity(entity) {
			var _self = this;
			try {
				_executor.addEntity(entity);
				_self._persistSettings.collectedRecords += 1;
				_self._updateStatistics(entity);
				if (_self._persistSettings.collectedRecords % _self._persistSettings.flushAt === 0) {
					_executor.flushEntities();
				}
			} catch (e) {
				Logger.error("addEntity() :: " + e + " at line " + e.lineNumber);
			}
		},
		addImage: function addImage(entity) {
			var _self = this;
			Logger.production("downloadVideoFiles: " + (_self._persistSettings.downloadVideoFiles));
			Logger.production("itemType22: " + (entity.itemType));
			Logger.production("NOT useSaveBinarForVideos: " + !_self._persistSettings.useSaveBinarForVideos);
			
			try {
				if (_self._persistSettings.downloadVideoFiles && entity.itemType == "22" && !_self._persistSettings.useSaveBinaryForVideos) {
					_self._persistSettings.testVar = "1";
					Logger.production("vutre sum Video");
					_self._persistSettings.collectedRecords += 1;
					_self._updateStatistics(entity);
					_executor.downloadVideo(
						_executor.createVideoDownloadRequest(entity.url, "image", entity)
					);
				} else {
					if (entity.imageUrl) {
						_self._persistSettings.testVar = "2";
						Logger.production("vutre sum saveBinary");
						_self._persistSettings.scheduledImages += 1;
						_executor.saveBinary(entity.imageUrl, onSuccess, onError, entity);
					} else {
						_self._persistSettings.testVar = "3";
						Logger.production("vutre sum addEntity");
						addEntity(entity);
					}
				}

			} catch (e) {
				Logger.error("addImage() :: " + e + " at line " + e.lineNumber);
			}
		},
		onSuccess: function onSuccess(filePath, entity) {
			var _self = this;
			try {
				//Logger.production(_self._persistSettings.testVar);
				//Logger.production("vutre sum success");
				_self._persistSettings.scheduledImages -= 1;
				entity.image = filePath;
				addEntity(entity);
			} catch (e) {
				Logger.error("onSuccess() :: " + e + " at line " + e.lineNumber);
			}
		},
		onError: function onError() {
			var _self = this;
			try {
				//Logger.production(_self._persistSettings.testVar);
				//Logger.production("vutre sum error");
				_self._persistSettings.scheduledImages -= 1;
			} catch (e) {
				Logger.error("onError() :: " + e + " at line " + e.lineNumber);
			}
		},
		callStackAdd: function callStackAdd(fName) {
			var _self = this;
			_self._callStack.push(fName);
			Logger.production(" === ADD-CALL-STACK [" + _self._callStack.length + "] {" + _self._callStack + "}");
		},
		callStackRemove: function callStackRemove(fName) {
			var _self = this;
			_self._callStack = _self._callStack.filter(item => item !== fName);
			Logger.production(" === REMOVE-CALL-STACK [" + _self._callStack.length + "] {" + _self._callStack + "}");
		},

		finalize: function finalize(isLast) {
			var _self = this;
			try {
				var finalizeInterval = setInterval(function () {
					if ((_self._persistSettings.scheduledImages === 0) && (_self._callStack.length == 0)) { //CHAMGE CONDITION TO "_self._persistSettings.scheduledImages <= 2" TBD
						// Write statistic if this is last finalize() for the WF
						_re._statistics = JSON.stringify(_self._statistics);
						if (isLast) Logger.statistic();
						clearInterval(finalizeInterval);
						Logger.production("DONE: End Time: " + new Date());
						_executor.ready();
					} else {
						Logger.debug("INFO. Waiting for " + _self._persistSettings.scheduledImages + " photos to be downloaded... [callStack = " + _self._callStack + "]");
					}
				}, 1000);
			} catch (e) {
				Logger.error("finalize() :: " + e + " at line " + e.lineNumber);
				_executor.ready();
			}
		}
	}
	//* Object create shim *//
if (typeof Object.create !== 'function') {
	Object.create = function (o) {
		var Fn = function () {};
		Fn.prototype = o;
		return new Fn();
	}
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

if (typeof Object.hasOwnPropertyCaseInsensitive !== 'function') {
	Object.defineProperty(Object, 'hasOwnPropertyCaseInsensitive', {
		enumerable: false,
		value: function hasOwnPropertyCaseInsensitive(prop) {
			return (Object.keys(this).filter(function (v) {
				return v.toLowerCase() === prop.toLowerCase();
			}).length > 0)
		}
	});
}

//-----------------------------------------------------------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// (#) STANDARD LIBRARY: (END) ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// (#) STANDARD LIBRARY: (END) ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
//----------------------------------------------------------------------------------------------------------------------------- PUT YOUR XATH LIBRARY HERE -------------------------------------------------------------------------------------------------------------------------------//
var xpaths;

xpaths = {
	VK_Target: {
		loginForm: ".//*[contains(@id,'login_form')]",
		vHiddenProfile: ".//*[contains(@id, 'page_current_info')]",
		vBlockedProfile: ".//*[contains(@class, 'profile_blocked page_block')]",
		vWallHidden: ".//*[@class='message_page page_block']//*[@class='message_page_body']",
		vUnableToLogInMessage: ".//*[@id='login_message']/div/div/b[1]",
		vProfileHiddenMessage: ".//*[@class='profile_deleted_text']",
		vUserNameSecurityCheck: ".//*[contains(@id, 'check_msg') and contains(@class, 'error')]",
		tTargetName: ".//*[@class='page_name']",
		aAvatarURL: ".//*[@id='profile_photo_link']/img",
		vInfoRowLabel: ".//*[contains(@class,'label fl_l')] | .//*[contains(@class,'label fl_l')]/a",
		vInfoRowValue: ".//*[contains(@class,'label fl_l')]/following-sibling::div | .//*[contains(@class,'label fl_l')]/following-sibling::div//*",
		vPosts: ".//*[contains(@id, 'post') and contains(@class, '_post post')]",
		commentContainers: ".//*[@class='reply_content']",
		lGroups: ".//*[@class='profile_label_link' and text()='Groups:']",

		vPostText: ".//*[contains(@class,'_wall_post_cont')]/*[@class='wall_post_text']",
		vCopyPostAuthor: ".//*[@class='copy_post_author']/a",
		vCopyPostText: ".//*[@class='_post_content']//*[@class='copy_quote']//*[@class='wall_post_text']",
		vPublishedCommentText: ".//*[@class='published_comment']//*[@class='wall_post_text']",
		vCommentText: ".//*[@class='reply_text']//*[@class='wall_reply_text']",
		vCommentAuthor: ".//*[@class='reply_author']/a",
		likersXpath : ".//*[contains(@class, 'fans_fan_row inl_bl')]",
        sharersXpath : ".//div[contains(@class, '_post post post_copy')]//a[contains(@class, 'post_image _online')]",

		postLikesKeyValue: ".//*[contains(@class, 'post_like_count')]",
		postSharesKeyValue: ".//*[contains(@class, 'post_share_count')]",
		postViewsKeyValue: ".//*[contains(@class, 'post_views_count')]",

		aPostImg: ".//*[@class='_wall_post_cont' and not(../*[@class='copy_quote'])]//*[contains(@class,'page_post_sized_thumbs')]//a[not(contains(@class, 'video'))]",
		aCommentImg: ".//*[contains(@class,'reply_text')]//*[contains(@class,'page_post_sized_thumbs')]//a[not(contains(@class, 'video'))]",
		aCopyPostImg: ".//*[@class='_post_content']//*[@class='copy_quote']//*[contains(@class,'page_post_sized_thumbs' )]//a[not(contains(@class, 'video'))]",
		aPublishedCommentImg: ".//*[@class='published_comment']//*[contains(@class,'page_post_sized_thumbs')]//a[not(contains(@class, 'video'))]",

		aPostVideo: ".//*[@class='_wall_post_cont' and not(../*[@class='copy_quote'])]//*[contains(@class,'page_post_sized_thumbs' )]/a[(contains(@aria-label, 'video'))]",
		aCommentVideo: ".//*[contains(@class,'reply_text')]//*[contains(@class,'page_post_sized_thumbs' )]/a[(contains(@aria-label, 'video'))]",
		aCopyPostVideo: ".//*[@class='_post_content']//*[@class='copy_quote']//*[contains(@class,'page_post_sized_thumbs' )]/a[(contains(@aria-label, 'video'))]",
		aPublishedCommentVideo: ".//*[@class='published_comment']//*[contains(@class,'page_post_sized_thumbs')]/a[(contains(@aria-label, 'video'))]",

		aCopyPostDate: ".//*[contains(@class,'copy_post_date')]/a[contains(@class,'published_by_date')]",
		vPostDate: ".//*[contains(@class,'post_date')]//*[contains(@class,'post_link')]/span",
		vCommentDate: ".//*[@class='reply_date']//span",
		aPostUrl: ".//*[contains(@class,'post_date')]//*[contains(@class,'post_link')]",
		vKeyValueCounters: ".//*[contains(@class, 'page_counter')]",
		vFriends: ".//*[contains(@class,'friends_user_row')]",
		vFriendName: ".//*[contains(@class,'friends_field friends_field_title')]/a",
		vFriendAdditionalInfo: ".//*[@class = 'friends_field']",
		aFriendImg: ".//*[@class='friends_photo_img']",
		aFriendsPageUrl: ".//*[@class='page_counter']/*[@class='label' and text()='friends']/..",
		aPhotosPageUrl: ".//*[@class='page_counter']/*[@class='label' and text()='photos']/..",
		aPhotos: ".//*[contains(@id,'photo_row')]",
		aPhotosRow: ".//*[@class='photos_row_wrap']"

	},
	VK_Search_Profiles: {
		loginForm: ".//*[contains(@id,'login_form')]",
		vHiddenProfile: ".//*[contains(@id, 'page_current_info')]",
		vBlockedProfile: ".//*[contains(@class, 'profile_blocked page_block')]",
		vWallHidden: ".//*[@class='message_page page_block']//*[@class='message_page_body']",
		vUserNameSecurityCheck: ".//*[contains(@id, 'check_msg') and contains(@class, 'error')]",
		searchResults: ".//*[contains(@class,'people_row search_row')]",
		aSearchItemHref: ".//a[contains(@class,'search_item_img')]",
		aSearchItemImg: ".//a[contains(@class,'search_item_img')]/img",
		vSearchItemAdditionalInfo: ".//a[@class='labeled ')] || .//a[@class='labeled ')]/a"
	},
	VK_Search_Activities: {
		loginForm: ".//*[contains(@id,'login_form')]",
		searchResults: ".//div[contains(@class, 'post page_block')]",
		vWallHidden: ".//*[@class='message_page page_block']//*[@class='message_page_body']",
		vUserNameSecurityCheck: ".//*[contains(@id, 'check_msg') and contains(@class, 'error')]",
		vHiddenProfile: ".//*[contains(@id, 'page_current_info')]",
		vBlockedProfile: ".//*[contains(@class, 'profile_blocked page_block')]",

		postWriter: ".//div[@class='post_header']//h5[contains(@class, 'post_author')]//a", //text , href, date-from-id
		postDate: ".//div[@class='post_header']//div[contains(@class, 'post_date')]//a//span[contains(@class, 'rel_date')]", //text
		postUrl: ".//*[contains(@class,'post_date')]//*[contains(@class,'post_link')]",
		parentPost: ".//div[@class='post_header']//div[contains(@class, 'post_date')]//a[contains(@class, 'reply_parent_link')]", //src text
		postBody: ".//div[contains(@class, 'post_info')]//div[contains(@class, 'wall_post_text')]", //text
		expandText: ".//div[contains(@class, 'post_info')]//div[contains(@class, 'wall_post_text')]//a[contains(@class, 'wall_post_more')]",
		hidenText: ".//div[contains(@class, 'post_info')]//div[contains(@class, 'wall_post_text')]//span[contains(@style, 'none')]", //text

		postLikes: ".//div[contains(@class, 'post_info')]//span[contains(@class, 'post_like_count')]", //text
		postShares: ".//div[contains(@class, 'post_info')]//span[contains(@class, 'post_share_count')]", //text
		postCommentsValue: ".//div[contains(@class, 'post_info')]//*[contains(@class, 'comments_summary')]", //text

		commentContainers: ".//*[@class='reply_content']", //collection
		commentText: ".//*[@class='reply_text']//*[@class='wall_reply_text']", //text, href, data-from-id
		commentAuthor: ".//*[@class='reply_content']//*[@class='reply_author']/a", //text

		copyPostVideo: ".//*[@class='_post_content']//*[@class='copy_quote']//*[contains(@class,'page_post_sized_thumbs' )]/a[(contains(@aria-label, 'video'))]",
		postVideo: ".//*[@class='_wall_post_cont' and not(../*[@class='copy_quote'])]//*[contains(@class,'page_post_sized_thumbs' )]/a[(contains(@aria-label, 'video'))]", //href
		commentVideo: ".//*[contains(@class,'reply_text')]//*[contains(@class,'page_post_sized_thumbs' )]/a[(contains(@aria-label, 'video'))]",
		publishedCommentVideo: ".//*[@class='published_comment']//*[contains(@class,'page_post_sized_thumbs')]/a[(contains(@aria-label, 'video'))]",

		commentAuthorImg: ".//*[@class='reply_image']//img", //src
		copyPostImg: ".//*[@class='_post_content']//*[@class='copy_quote']//*[contains(@class,'page_post_sized_thumbs' )]//a[not(contains(@class, 'video'))]",
		commentImg: ".//*[contains(@class,'reply_text')]//*[contains(@class,'page_post_sized_thumbs')]//a[not(contains(@class, 'video'))]",
		postImage: ".//*[@class='_wall_post_cont' and not(../*[@class='copy_quote'])]//*[contains(@class,'page_post_sized_thumbs')]//a[not(contains(@class, 'video'))]", //style or href
		publishedCommentImg: ".//*[@class='published_comment']//*[contains(@class,'page_post_sized_thumbs')]//a[not(contains(@class, 'video'))]",
		postWriterImage: ".//div[@class='post_header']//img", //src

		publishedCommentText: ".//*[@class='published_comment']//*[@class='wall_post_text']",
		copyPostAuthor: ".//*[CONTAINS(@class, '_author')]/a",
		copyPostText: ".//*[@class='_post_content']//*[@class='copy_quote']//*[@class='wall_post_text']",
		copyPostDate: ".//*[contains(@class,'copy_post_date')]/a[contains(@class,'published_by_date')]",

	}
};

var WPXP = xpaths.VK_Target; //Assign currently relevant WEB PLATFORM XPATH ENUM
//----------------------------------------------------------------------------------------------------------------------------- START ----------------------------------------------------------------------------------------------------------------------------------------------------------//
console.clear();

//# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

function main(re, ie, oe, executor) {
    //=====================================================================
        //Initialize Global Settings
        setGlobalLogger(re, ie, oe, executor);
        var WPXP = xpaths.VK_Search_Activities;
        executionContext = {
            globalLogExtracted: false, //change to false before release;
            globalWPXP: xpaths.VK_Search_Activities
        };
    
        var _extract = new Extract(executionContext);
        var _process = new Process();
    
        //=====================================================================
        // GLOBAL VARIABLES
        var collectedAuthors = [];
        var cntItems = 0;
        var totalAuthors = 0;
        var _tmp;
    
        //=====================================================================
    
        /*if (re.url === "") {
         re.gender = "false";
         } else {
         urlsForAccountInfo = re.allUrls.split(";");
         re.url = "" + urlsForAccountInfo.shift();
         if ((re.url == NaN || re.url == "") || re.url == undefined) {
         Logger.production("next url is undefined " + re.url);
         re.gender = "false";
         re.url = "" + urlsForAccountInfo.shift();
         } else {
         re.allUrls = urlsForAccountInfo.join(";");
         Logger.production("next url " + re.url);
         re.gender = "true";
         }
    
         }*/
        if (/https:\/\/vk\.com/.test(re.url.toString())) {
            urlsForAccountInfo = re.allUrls.split(";");
            re.url = "" + urlsForAccountInfo.shift();
            re.allUrls = urlsForAccountInfo.join(";");
            re.gender = "true";
        } else {
            re.gender = "false";
            Logger.debug("end url " + re.url);
            finalize(true);
        }
    
        //===============================================================================
        // -------------------  Here extract logic begins  ------------------------------
    
        _process.Run(getPosts,false, {pMarker:'1:', functionName: 'getPosts'});
    
        // ----------------------------- HANDLERS  --------------------------------------
    
    
        function getPosts(pMarker, pContext) {
    
            Logger.production("Start collection");
    
            postsCounter = 0;
            var _res= {
                totalCollected:0,
                returnCode: ""
            };
    
            try {
                
                var vWallHidden = _extract.GetText(
                    {
                        xpathName: "vWallHidden",
                        mandatory: "0"
                    },
                    pMarker + "vWallHidden"
                ).Value;
                
                if (vWallHidden) {
                    Logger.error("This post is hidden.");
                    executor.ready();
                }
    
                var writerName = _extract.GetText(
                    {
                        xpathName: "postWriter",
                        mandatory: "0"
                    },
                    pMarker + "writerName"
                ).Value;
    
                var writerId = _extract.GetAttribute(
                    {
                        xpathName: "postWriter",
                        attributeName: "data-from-id",
                        mandatory: "0",
                    },
                    pMarker + "writerId"
                ).Value;
    
                var postWriterImage = _extract.GetAttribute(
                    {
                        xpathName: "postWriterImage",
                        attributeName: "src",
                        mandatory: "0"
                    },
                    pMarker + "postWriterImage"
                ).Value;
    
                var writerUrl = _extract.GetAttribute(
                    {
                        xpathName: "postWriter",
                        attributeName: "href",
                        mandatory: "0",
                    },
                    pMarker + "writerUrl"
                ).Value;
    
                var writeDate = _extract.GetText(
                    {
                        xpathName: "postDate",
                        mandatory: "0"
                    },
                    pMarker + "writeDate"
                ).Value;
    
                var postUrl = _extract.GetAttribute(
                    {
                        xpathName: "postUrl",
                        attributeName: "href",
                        mandatory: "0"
                    },
                    pMarker + "postUrl"
                ).Value;
    
                var parentPost = _extract.GetText(
                    {
                        xpathName: "parentPost",
                        mandatory: "0"
                    },
                    pMarker + "parentPost"
                ).Value;
    
                var postBody = _extract.GetText(
                    {
                        xpathName: "postBody",
                        mandatory: "0"
                    },
                    pMarker + "postBody"
                ).Value;
    
                postBody += _extract.GetText(
                    {
                        xpathName: "hidenText",
                        mandatory: "0"
                    },
                    pMarker + "postBody - hiden"
                ).Value;
    
                /* var postImage = _extract.GetAttribute(
                 {
                 xpathName: "postImage",
                 attributeName: "style",
                 mandatory: "0"
                 },
                 pMarker + "postImage"
                 ).Value;
    
                 if (postImage != null) {
                 postImage = postImage.match(/http.+jpg/)[0];
                 }
    
                 var postVideo = _extract.GetAttribute(
                 {
                 xpathName: "postVideo",
                 attributeName: "href",
                 mandatory: "0"
                 },
                 pMarker + "postVideo"
                 ).Value;*/
    
                var postImage = _extract.GetCollection({
                    xpathName: "postImage",
                    mandatory: "0"
                }, "postImage");
    
                var postVideo = _extract.GetCollection({
                    xpathName: "postVideo",
                    mandatory: "0"
                }, "postVideo");
    
                var postLikesValue = _extract.GetText(
                    {
                        xpathName: "postLikes",
                        mandatory: "0"
                    },
                    pMarker + "postLikesValue"
                ).Value;
    
                var postSharesValue = _extract.GetText(
                    {
                        xpathName: "postShares",
                        mandatory: "0"
                    },
                    pMarker + "postSharesValue"
                ).Value;
    
                var postCommentsValue = _extract.GetText(
                    {
                        xpathName: "postCommentsValue",
                        mandatory: "0"
                    },
                    pMarker + "postCommentsValue"
                ).Value;
    
                var comments = _extract.GetCollection(
                    {
                        xpathName: "commentContainers",
                        mandatory: "0"
                    },
                    pMarker +  "commentContainers"
                );
    
    
                var copyPostText = _extract.GetText(
                    {
                        xpathName: "copyPostText",
                        mandatory: "0"
                    }, "copyPostText"
                ).Value;
    
                var copyPostAuthor = _extract.GetText(
                    {
                        xpathName: "copyPostAuthor",
                        mandatory: "0"
                    }, "copyPostAuthor"
                ).Value;
    
                Logger.production("VAL: copyPostAuthor = " + copyPostAuthor);
    
                var copyPostAuthorUrl = _extract.GetAttribute(
                    {
                        xpathName: "copyPostAuthor",
                        mandatory: "0",
                        attributeName: "href"
                    }, "copyPostAuthorUrl"
                ).Value;
    
                Logger.production("VAL: copyPostAuthorUrl = " + copyPostAuthorUrl);
    
                var copyPostUrl = _extract.GetAttribute(
                    {
                        xpathName: "copyPostDate",
                        attributeName: "href",
                        mandatory: "0"
                    }, "copyPostUrl"
                ).Value;
    
                var copyPostDate = _extract.GetText(
                    {
                        xpathName: "copyPostDate",
                        mandatory: "0"
                    },
                    "copyPostDate"
                ).Value;
    
                var copyPostImg = _extract.GetCollection({
                    xpathName: "copyPostImg",
                    mandatory: "0"
                }, "copyPostImg");
    
                var copyPostVideo = _extract.GetCollection({
    
                    xpathName: "copyPostVideo",
                    mandatory: "0"
                }, "copyPostVideo");
    
                var publishedCommentText = _extract.GetText({
    
                        xpathName: "publishedCommentText",
                        mandatory: "0"
                    },
                    "publishedCommentText"
                ).Value;
    
                var publishedCommentImg = _extract.GetCollection({
    
                    xpathName: "publishedCommentImg",
                    mandatory: "0"
                }, "publishedCommentImg");
    
                var publishedCommentVideo = _extract.GetCollection({
    
                    xpathName: "publishedCommentVideo",
                    mandatory: "0"
                }, "publishedCommentVideo");
    
                //-------------------Save writer--------------------------
    
    
                if (writerId.toString() !== "NaN") {
                    Logger.production("We will collect writer with ID :: " + writerId);
                    var writer = {};
                    writer.externalId = "writer_Id_" + hashCode(writerId);
                    writer.itemType = "4"; // Web entity
                    writer.type = "1"; //Person
                    writer.activityType = "1"; //Social Network
                    writer.url = writerUrl;
                    writer.title = writerName;
                    writer.imageUrl = postWriterImage;
    
                    //Check is the writer already collected
                    if (!(' ' + writerId in collectedAuthors)) {
                        collectedAuthors[(' ' + writerId)] = true;
                        addImage(writer);
                        cntItems++;
                    } else {
                        Logger.production(writerId + " is already collected");
                    }
                }
    
    
                //-------------------Save post--------------------------
                if (copyPostAuthor.toString() !== "NaN") {
                    Logger.production("we will collect copy post");
                    var originalPoster = {};
                    originalPoster.externalId = "writer_Id_" + hashCode(copyPostAuthor);
                    originalPoster.itemType = "4";
                    originalPoster.url = re.url + copyPostAuthorUrl;
                    originalPoster.type = "1";
                    originalPoster.title = copyPostAuthor;
                    originalPoster.extractDate = "";
    
                    if (!(' ' + writerId in collectedAuthors)) {
                        collectedAuthors[(' ' + writerId)] = true;
                        addEntity(originalPoster);
                        cntItems++;
                    } else {
                        Logger.production(writerId + " is already collected");
                    }
    
                    var cTopic = {};
                    cTopic.parent_externalId = writer.externalId;
                    cTopic.parentObjectType = "4";
                    cTopic.type = "";
                    cTopic.itemType = "2";
                    cTopic.url = re.url + copyPostUrl;
                    cTopic.body = copyPostText;
                    cTopic.title = "";
                    cTopic.description = "";
                    cTopic.writeDate = copyPostDate;
                    cTopic.writer_externalId = originalPoster.externalId;
                    cTopic.extractDate = "";
                    cTopic.externalId = "repostId_" + hashCode(cTopic.writeDate + cTopic.body);
                    addEntity(cTopic);
                    cntItems++;
    
    
                    if (copyPostVideo.returnCode === "200") {
                        //collectVideo(cTopic, copyPostVideo);
                    }
                    else if (copyPostImg.returnCode === "200") {
                        collectImage(cTopic, copyPostImg);
    
                    }
    
                    if (publishedCommentText.toString() !== "NaN") {
                        var publishedComment = {};
                        publishedComment.writer_externalId = writer.externalId;
                        publishedComment.parent_externalId = cTopic.externalId;
                        publishedComment.parentObjectType = "4";
                        publishedComment.body = publishedCommentText;
                        publishedComment.itemType = "3"; //comment
                        publishedComment.url = re.url + copyPostUrl;
                        publishedComment.type = "9"; //shared link
                        publishedComment.writeDate = writeDate;
                        publishedComment.externalId = "pComment_id_" + hashCode(publishedComment.writeDate + publishedComment.body);
    
                        addEntity(publishedComment);
    
                        if (publishedCommentImg.returnCode === "200") {
                            Logger.production("we will collect image from share");
                            collectImage(publishedComment, publishedCommentImg);
    
                        }
    
                        if (publishedCommentVideo.returnCode === "200") {
                            //collectVideo(publishedComment, publishedCommentVideo);
    
                        }
    
                        if (comments.returnCode === "200") {
                            //collectComments(publishedComment, comments);
                        }
                    }
    
                }
                else if (postBody.toString() !== "NaN") {
                    Logger.production("we will collect  post");
                    var post = {};
    
                    post.externalId = postUrl;
                    post.url = postUrl;
                    post.itemType = "2"; // Topic
                    post.activityType = "1"; // Social Network
                    post.body = postBody;
                    post.writer_externalId = writer.externalId;
                    post.writeDate = writeDate;
                    post.parent_externalId = writer.externalId;
                    post.parentObjectType = writer.itemType;
    
    
                    addEntity(post);
                    cntItems++;
                    if (postImage.returnCode === "200") {
                        Logger.production("we will collect image from post");
                        collectImage(post, postImage);
    
                    } else { //No info found
                        Logger.debug("No images for this post.");
                    }
    
                    if (postVideo.returnCode === "200") {
                        Logger.production("we will collect video from post");
                        collectVideo(post, postVideo);
                    } else { //No info found
                        Logger.debug("No video for this post.");
                    }
                    var likesKeyValue = {};
                    likesKeyValue.itemType = "24"; //Key-value
                    likesKeyValue.activityType = "1"; //Numeric
                    likesKeyValue.body = postLikesValue;
                    likesKeyValue.title = "LIKES";
                    likesKeyValue.description = "likes_count";
                    likesKeyValue.parent_externalId = post.externalId;
                    likesKeyValue.parentObjectType = "2"; //Topic
    
                    addEntity(likesKeyValue);
                    cntItems++;
    
                    var sharesKeyValue = {};
                    sharesKeyValue.itemType = "24"; //Key-value
                    sharesKeyValue.activityType = "1"; //Numeric
                    sharesKeyValue.body = postSharesValue;
                    sharesKeyValue.title = "SHARES";
                    sharesKeyValue.description = "shares_count";
                    sharesKeyValue.parent_externalId = post.externalId;
                    sharesKeyValue.parentObjectType = "2"; //Topic
    
                    addEntity(sharesKeyValue);
                    cntItems++;
    
                    if(postCommentsValue != null) {
                        var commentsKeyValue = {};
                        commentsKeyValue.itemType = "24"; //Key-value
                        commentsKeyValue.activityType = "1"; //Numeric
                        commentsKeyValue.body = postCommentsValue;
                        commentsKeyValue.title = "COMMENTS";
                        commentsKeyValue.description = "comments_count";
                        commentsKeyValue.parent_externalId = post.externalId;
                        commentsKeyValue.parentObjectType = "2"; //Topic
    
                        addEntity(commentsKeyValue);
                        cntItems++;
                    }
                    if (comments.returnCode === "200") {
                        Logger.production("We will collect comments.");
                        collectComments(post, comments);
                    } else {
                        postsCounter = cntItems;
                        _res.totalCollected = postsCounter;
                        _res.returnCode = "200";
                    }
                }
            }
            catch(e) {
                Logger.error("getPosts('getPosts', '5' - DID NOT WORK - " + e.message);
                _res.totalCollected = postsCounter;
                _res.returnCode = "504 " + e.message;
            }
            return _res;
    
        }
    
        function collectComments(parent, currNode) {
            Logger.production("we will collect comments of : " + currNode);
            var iterator = currNode.Value;
            var curr = iterator.iterateNext();
            var i = 0; //iterator for the comment id
    
            while (curr) {
                i++;
                var commentText = _extract.GetText({
                    context: curr,
                    xpathName: "commentText",
                    mandatory: "0"
                }, "commentText").Value;
    
                var commentImg = _extract.GetCollection({
                    context: curr,
                    xpathName: "commentImg",
                    mandatory: "0"
                }, "commentImg");
    
                var commentVideo = _extract.GetCollection({
                    context: curr,
                    xpathName: "commentVideo",
                    mandatory: "0"
                }, "commentVideo");
    
                var commentAuthor = _extract.GetText({
                    context: curr,
                    xpathName: "commentAuthor",
                    mandatory: "0"
                }, "commentAuthor").Value;
    
                var commentAuthorUrl = _extract.GetAttribute({
                    context: curr,
                    xpathName: "commentAuthor",
                    attributeName: "href",
                    mandatory: "0"
                }, "commentAuthorUrl").Value;
    
                var commentAuthorId = _extract.GetAttribute({
                    context: curr,
                    xpathName: "commentAuthor",
                    attributeName: "data-from-id",
                    mandatory: "0"
                }, "commentAuthorId").Value;
    
                var commentAuthorImg = _extract.GetAttribute({
                    context: curr,
                    xpathName: "commentAuthorImg",
                    attributeName: "src",
                    mandatory: "0"
                }, "commentAuthorImg").Value;
    
    
                if (commentAuthorId.toString() !== "NaN") {
    
                    var commnetWriter = {};
    
                    commnetWriter.externalId = "writer_Id_" + hashCode(commentAuthorId);
                    commnetWriter.itemType = "4"; // Web entity
                    commnetWriter.type = "1"; //Person
                    commnetWriter.activityType = "1"; //Social Network
                    commnetWriter.url = commentAuthorUrl;
                    commnetWriter.title = commentAuthor;
                    commnetWriter.imageUrl = commentAuthorImg;
    
                    //Check is the writer already collected
                    if (!(' ' + commnetWriter in collectedAuthors)) {
                        collectedAuthors[(' ' + commnetWriter)] = true;
                        addEntity(commnetWriter);
                    } else {
                        console.log(commnetWriter + " is already collected");
                    }
                }
    
    
                var comment = {};
                comment.itemType = "3";
                comment.type = "1";
                comment.parent_externalId = parent.externalId;
                comment.parentObjectType = parent.itemType;
                comment.url = parent.url;
                comment.writer_externalId = "";
                comment.writeDate = "";
                comment.externalId = "comment_id_" + hashCode(comment.url + i);
    
                if (commentText.toString() !== "NaN") {
                    comment.body = commentText.toString();
                    addEntity(comment);
                }
                
                if (commentImg.returnCode === "200") {
                    //Logger.production("we will collect image from comment");
                    //collectImage(comment, commentImg);
                }
                if (commentVideo.returnCode === "200") {
                    //Logger.production("we will collect video from comment");
                    //collectVideo(comment, commentVideo);
                }
                curr = iterator.iterateNext();
            }
        }
    
    
        function collectImage(parent, currImgNode) {
    
            Logger.production("we will collect image of : " + parent.externalId);
            var iterator = currImgNode.Value;
            var curr = iterator.iterateNext();
    
            while (curr) {
                var img = {};
                img.parent_externalId = parent.externalId;
                img.parentObjectType = parent.itemType;
                img.writer_externalId = parent.writer_externalId;
                img.writeDate = parent.writeDate;
                img.itemType = "5";
                img.imageUrl = curr.getAttribute("style").match(/http(.+\b)/g)[0];
                img.url = curr.getAttribute("style").match(/http(.+\b)/g)[0];
                img.externalId = "img_id_" + hashCode(img.imageUrl);
                curr = iterator.iterateNext();
    
                addImage(img);
    
                /*if (img.externalId != 0) {
                 addImage(img);
                 } else {
                 Logger.debug("Check the image element for this post: " + parent.externalId);
                 }*/
            }
    
        }
    
        function collectVideo(parent, currVideoNode) {
            Logger.production("we will collect video of : " + parent.externalId);
            var iterator = currVideoNode.Value;
            var curr = iterator.iterateNext();
    
            while (curr) {
                var video = {};
                video.parent_externalId = parent.externalId;
                video.parentObjectType = parent.itemType;
                video.writer_externalId = parent.writer_externalId;
                video.writeDate = parent.writeDate;
                video.itemType = "22";
                video.imageUrl = curr.href;
                video.url = video.imageUrl;
                video.body = "<iframe src=" + video.imageUrl + "></iframe>";
                video.externalId = "video_id_" + hashCode(video.imageUrl);
                curr = iterator.iterateNext();
                addImage(video);
            }
            /*var video = {};
             video.parent_externalId = parent.externalId;
             video.parentObjectType = parent.itemType;
             video.writer_externalId = parent.writer_externalId;
             video.writeDate = parent.writeDate;
             video.itemType = "22";
             video.imageUrl = currVideoNode;
             video.url = video.imageUrl;
             video.body = "<iframe src=" + video.imageUrl + "></iframe>";
             video.externalId = "video_id_" + hashCode(video.imageUrl);
    
             if (video.externalId != 0) {
             addImage(video);
             } else {
             Logger.debug("Check the video element for this post: " + parent.externalId);
             }*/
    
        }
    
        function timeConverter(UNIX_timestamp){
            var a = new Date(UNIX_timestamp * 1000);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();
            var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
            return time;
        }
        //......................................................................
        function hashCode(input) {
            var hash = 0;
            if (input.length === 0) return hash;
            for (var i = 0; i < input.length; i++) {
                var character = input.charCodeAt(i);
                hash = ((hash << 5) - hash) + character;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash.toString();
        }
        finalize();
    }

/*////////////////////////////////////////////////////
///////////  LET IT RUN:    ////////////////////////////
////////////////////////////////////////////////////*/

main(re, ie, oe, executor);

