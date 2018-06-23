function main(re, ie, oe, executor) {
    //=====================================================================
    //Initialize Global Settings
    setGlobalLogger(re, ie, oe, executor);

    executionContext = {
        globalLogExtracted: false, //change to false before release;
        globalWPXP: xpaths.LinkedInProfile
    }


    re.url = 'https://www.linkedin.com';

    re.flagFriendsOfFreinds = '';

    //=====================================================================
    // GLOBAL VARIABLES
    var scheduledImages = 0;
    var collectedAuthors = [];
    var collectedIllustrations = [];
    var theTargetID = "";
    var cntItems = 0;

    //=====================================================================
    var CAName = "LinkedIn Main Collect";
    Logger.production(CAName + " Start Time: " + new Date());
    var _tmp;

    //=====================================================================
    // Functions for data persisting
    Logger.production("document.URL = " + document.URL);
    var DomainURL = document.URL.match(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)(:([^\/]*))?((\/[\w\/-]+)*\/)([\w\-\.]+[^#?\s]+)(\?([^#]*))?(#(.*))?$/i)[3];
    Logger.production("DomainURL = " + DomainURL);
    var totalAuthors = 0;

    //===============================================================================
    // -------------------  Here extract logic begins  -------------------------------------------------------------
    var _extract = new Extract(executionContext);
    var _process = new Process();

    Logger.production("------------------------- Step 1 ---------------------------------");
    _process.Run(getTargetEntity, true, {
        pMarker: '101',
        functionName: 'getTargetEntity'
    });

    Logger.production("------------------------- Step 2 ---------------------------------");
    callStackAdd("collectEducation");
    _extract.ClickButtons("btnSomeOtherMoreExpandButton", "102", 20, collectEducation, _process);

    Logger.production("------------------------- Step 3 ---------------------------------");
    callStackAdd("collectExperience");
    _extract.ClickButtons("btnExperienceExpandButtons", "103", 20, collectExperience, _process);

    collectInterest();

    Logger.production("------------------------- Step 4(5) ---------------------------------");
    callStackAdd("collectRecommendationsRecieved");
    _extract.ClickButtons("btnCollectRecommendations", "104", 20, collectRecommendationsRecieved, _process);

    Logger.production("------------------------- Step 6 ---------------------------------");
    callStackAdd("collectVolunteerExperience");
    _extract.ClickButtons("btnExperienceExpandButtons", "106", 20, collectVolunteerExperience, _process);


    finalize(true);

    // ----------------------------- HANDLERS  ----------------------------------------------------------------------------------------------------------------------------------------------------
    function collectVolunteerExperience(pProcess) {
        Logger.production("==================================================================================================================================> Hello collectVolunteerExperience");
        pProcess.Run(getVolunteerExperience, false, {
            pMarker: '6',
            functionName: 'getVolunteerExperience'
        });
        callStackRemove("collectVolunteerExperience");
    }

    function collectExperience(pProcess) {
        Logger.production("==================================================================================================================================> Hello collectExperience");
        pProcess.Run(getExperience, false, {
            pMarker: '2',
            functionName: 'getExperience'
        });
        callStackRemove("collectExperience");
    }

    function collectEducation(pProcess) {
        Logger.production("==================================================================================================================================> Hello collectEducation");
        pProcess.Run(getEducation, false, {
            pMarker: '3',
            functionName: 'getEducation'
        });
        callStackRemove("collectEducation");
    }

    function collectInterest() {
        Logger.production("==================================================================================================================================> Hello collectInterest");
        getInterests();
    }

    function collectRecommendationsRecieved(pProcess) {
        Logger.production("==================================================================================================================================> Hello collectRecommendations");
        pProcess.Run(getRecommendationsRecieved, false, {
            pMarker: '4',
            functionName: 'getRecommendationsRecieved'
        });
        callStackRemove("collectRecommendationsRecieved");
    }

    function collectRecommendationsGiven(pProcess) {
        Logger.production("==================================================================================================================================> Hello collectRecommendationsGiven");
        pProcess.Run(getRecommendationsGiven, false, {
            pMarker: '5',
            functionName: 'getRecommendationsGiven'
        });
        callStackRemove("collectRecommendationsGiven");
    }

    // ----------------------------- HANDLERS Implimentations ----------------------------------------------------------------------------------------------------------------------------------------

    function getTargetEntity(pMarker, pContext) {

        cntItems = 0;
        var _res = {
            totalCollected: 0,
            returnCode: ""
        };

        try {
            //var vAccountID =  window.location.href.slice(0, -1); //VAL-004
            //vAccountID = vAccountID.replace('-beta', '');


            var allparts = window.location.href.split('/').filter(e => e != '');
            var vAccountID = allparts[allparts.length - 1];



            //var vAccountID =  window.location.href.slice(0, -1);
            Logger.production("vAccountID = " + vAccountID);
            vAccountID = vAccountID.replace('/?ppe=', '');
            Logger.production("vAccountID = " + vAccountID);



            var vFullName = _extract.GetText({
                    xpathName: "tFullName",
                    mandatory: "1"
                },
                pMarker + "-2"
            ).Value;
            Logger.production("vFullName = " + vFullName);


            var vTitle = _extract.GetText({
                    xpathName: "tTitle",
                    mandatory: "0"
                },
                pMarker + "-3"
            ).Value;

            var vAbout = _extract.GetText({
                    xpathName: "tAbout",
                    mandatory: "0"
                },
                pMarker + "-4"
            ).Value;

            var vImageURL = _extract.GetAttribute({
                    xpathName: "aAvatarURL",
                    attributeName: "style",
                    mandatory: "0"
                },
                pMarker + "-5"
            ).Value;

            Logger.production('VALE-004.1 - ' + vImageURL);

            vImageURL = vImageURL.substring(vImageURL.indexOf('("') + 2, vImageURL.indexOf('")'));

            Logger.production('VALE-004.2 - ' + vImageURL);

            var vALT = _extract.GetAttribute({
                    xpathName: "aAvatarURL",
                    attributeName: "alt",
                    mandatory: "0"
                },
                pMarker + "-5-5-5"
            ).Value;

            //Logger.production('VALEN005-5-5 - ' + vALT);



            if (vImageURL.indexOf('base64') > 0) {
                vImageURL = '';
                Logger.production('VALEN-006 - vImageURL = ' + vImageURL);
            }

            // Save target entity -------------------------------------------
            var target = {};

            target.itemType = "4"; // Web Entity
            target.type = "1"; // Person
            target.activityType = "1"; // Social Network
            target.description = vAbout;
            target.title = vFullName;
            target.body = vTitle;
            target.imageUrl = vImageURL;
            target.url = 'https://www.linkedin.com/in/' + vAccountID; //Current page is of this
            re.placeholder3 = re.placeholder3 + ';' + vAccountID;


            //re.placeholder11 = vAccountID + '/skills';
            re.placeholder11 = 'https://www.linkedin.com/in/' + vAccountID + '/skills';
            //Logger.production('re.placeholder11 = ' + re.placeholder11);

            target.externalId = vAccountID;
            re.placeholder19 = target.externalId;

            theTargetID = target.externalId;
            //Logger.production('VALEN-006 vAccountID' + vAccountID);

            if (!collectedAuthors.hasOwnProperty(target.externalId)) {
                collectedAuthors[target.externalId] = true;
                Logger.production('VALEN-007 - vImageURL = ' + vImageURL);
                totalAuthors++;
                addImage(target);
                //Logger.production(JSON.stringify(target));
                cntItems++;
            }

            //Logger.production('VALEN-1');
            // Save IsMonitored entity -------------------------------------------
            var TargetIsMonitoredEntity = {};

            TargetIsMonitoredEntity.itemType = "18";
            TargetIsMonitoredEntity.parent_externalId = theTargetID.toString();
            TargetIsMonitoredEntity.parentObjectType = "4";

            executor.addEntity(TargetIsMonitoredEntity);
            //Logger.production('VALEN-2');
            //--------------------------------------------------------------------

            _res.totalCollected = cntItems;
            _res.returnCode = "200";
            return _res;
        } catch (e) {
            Logger.error("getTargetEntity - " + e.message);
            _res.returnCode = "504 " + e.message;
            return _res;
        }
    }
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    function getExperience(pMarker, pContext) {

        cntItems = 0;
        var _res = {
            totalCollected: 0,
            returnCode: ""
        };

        re.placeholder1 = ''; // Still no companies to request for additional data from Nightmare service

        try {
            _tmp = _extract.GetCollection({
                    xpathName: "lstExperience",
                    mandatory: "0"
                },
                pMarker
            );

            if (_tmp.returnCode === "200") {
                var iterator = _tmp.Value;
                cnt = 0;

                var thisNode = iterator.iterateNext();

                while (thisNode) {

                    var vCompanyName = _extract.GetAttribute({
                            xpathName: ".//div[contains(@class,'company-logo')]/img",
                            attributeName: "alt",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-1"
                    ).Value;

                    var vCompanyPageURL = _extract.GetAttribute({
                            xpathName: ".//a",
                            attributeName: "href",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-2"
                    ).Value;

                    if ((vCompanyPageURL)) {
                        if (!vCompanyPageURL.match('www.linkedin.com')) {
                            vCompanyPageURL = 'https://www.linkedin.com' + vCompanyPageURL;
                        }

                        vCompanyPageURL = vCompanyPageURL.trim();

                        //Prepare companyID for additional processing
                        re.placeholder1 = re.placeholder1 + ';' + vCompanyPageURL;

                    } else {
                        vCompanyPageURL = 'www.linkedin.com/fake/' + vCompanyName.replace(/[\W_]+/g, '_');
                    }


                    var vCompanyAvatarURL = _extract.GetAttribute({
                            xpathName: ".//a/div/img",
                            attributeName: "src",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-3"
                    ).Value;


                    // ----- New elements for relationship between person and wprk-place ------------
                    var vBeginEndDate = _extract.GetText({
                            xpathName: ".//span[contains(text(),'Dates Employed')]/following-sibling::span",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-4"
                    ).Value;


                    //Logger.production('DATES_F_T = ' + vBeginEndDate);

                    var x = vBeginEndDate.indexOf(' – ');

                    var vBeginDate = vBeginEndDate.substr(0, x);
                    var vEndDate = vBeginEndDate.substr(x + 3, vBeginEndDate.length - x - 3);

                    //Logger.production('FROM/TO ' + vBeginDate + '            ' + vEndDate);


                    if (vEndDate === 'Present')
                        vEndDate = '';

                    var vPositionTitle = _extract.GetText({
                            xpathName: ".//div/h3",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-6"
                    ).Value;


                    var vPositionDescription = _extract.GetText({
                            xpathName: ".//div[@class='pv-entity__extra-details']/p",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-7"
                    ).Value;

                    //------------------- REGISTER "Company" account ---------------------
                    var companyAccount = {};

                    companyAccount.url = vCompanyPageURL;
                    companyAccount.itemType = "4"; // Web Entity
                    companyAccount.type = "4"; // Company
                    companyAccount.activityType = "1"; // Social Network
                    //companyAccount.description = vTitle;
                    companyAccount.title = vCompanyName;
                    companyAccount.body = vCompanyName;
                    companyAccount.imageUrl = vCompanyAvatarURL;

                    //Current page is of this
                    companyAccount.externalId = vCompanyPageURL;


                    if (!collectedAuthors.hasOwnProperty(companyAccount.externalId)) {
                        collectedAuthors[companyAccount.externalId] = true;

                        totalAuthors++;
                        addImage(companyAccount);
                        cntItems++;
                    }
                    // ------------------- REGISTER "Relation" between Target and work place --
                    var companyRelEntity = {};

                    companyRelEntity.itemType = "12"; //relation
                    companyRelEntity.parent_externalId = theTargetID;
                    companyRelEntity.parentObjectType = 4; //person
                    companyRelEntity.type = 23; //employee
                    companyRelEntity.description = vPositionTitle + " : " + (vPositionDescription ? vPositionDescription : '');
                    companyRelEntity.startDate = vBeginDate;
                    companyRelEntity.endDate = vEndDate;
                    companyRelEntity.sideB_externalId = companyAccount.externalId;
                    companyRelEntity.sideB_ObjectType = companyAccount.itemType;

                    executor.addEntity(companyRelEntity);
                    cntItems++;


                    //------------------------------------------------------------
                    thisNode = iterator.iterateNext();

                }
                _res.totalCollected = cntItems;
                _res.returnCode = "200";
            } else { //Block "Experience" not found
                _res.totalCollected = 0;
                _res.returnCode = "204";
            }
        } catch (e) {
            Logger.error("getExperience - " + e.message);
            _res.totalCollected = cntItems;
            _res.returnCode = "504 " + e.message;
        }
        return _res;
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    function getVolunteerExperience(pMarker, pContext) {

        cntItems = 0;
        var _res = {
            totalCollected: 0,
            returnCode: ""
        };

        //re.placeholder1 = ''; // Still no companies to request for additional data from Nightmare service

        try {
            _tmp = _extract.GetCollection({
                    xpathName: "lstVolunteerExperience",
                    mandatory: "0"
                },
                pMarker
            );

            if (_tmp.returnCode === "200") {
                var iterator = _tmp.Value;
                cnt = 0;

                var thisNode = iterator.iterateNext();

                while (thisNode) {

                    var vCompanyName = _extract.GetAttribute({
                            xpathName: ".//div[contains(@class,'logo')]/img",
                            attributeName: "alt",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-1"
                    ).Value;

                    var vCompanyPageURL = _extract.GetAttribute({
                            xpathName: ".//a",
                            attributeName: "href",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-2"
                    ).Value;

                    if ((vCompanyPageURL)) {
                        if (!vCompanyPageURL.match('www.linkedin.com')) {
                            vCompanyPageURL = 'https://www.linkedin.com' + vCompanyPageURL;
                        }

                        vCompanyPageURL = vCompanyPageURL.trim();

                        //Prepare companyID for additional processing
                        re.placeholder1 = re.placeholder1 + ';' + vCompanyPageURL;

                    } else {
                        vCompanyPageURL = 'www.linkedin.com/fake/' + vCompanyName.replace(/[\W_]+/g, '_');
                    }


                    var vCompanyAvatarURL = _extract.GetAttribute({
                            xpathName: ".//a/div/img",
                            attributeName: "src",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-3"
                    ).Value;


                    // ----- New elements for relationship between person and wprk-place ------------
                    var vFromToDates = _extract.GetText({
                            xpathName: "./h4[contains(@class,'date-range')]/span[2]",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-4"
                    ).Value;

                    if (vFromToDates) {
                        var vBeginDate = inp.substring(0, inp.indexOf(' – '));
                        var vEndDate = inp.substring(inp.indexOf(' – ') + 2);
                    } else {
                        var vBeginDate = '';
                        var vEndDate = '';
                    }


                    var vPositionTitle = _extract.GetText({
                            xpathName: ".//div/h3",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-6"
                    ).Value;


                    var vPositionDescription = _extract.GetText({
                            xpathName: ".//div[@class='pv-entity__extra-details']/p",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-7"
                    ).Value;

                    //------------------- REGISTER "Company" account ---------------------
                    var companyAccount = {};

                    companyAccount.url = vCompanyPageURL;
                    companyAccount.itemType = "4"; // Web Entity
                    companyAccount.type = "4"; // Company
                    companyAccount.activityType = "1"; // Social Network
                    //companyAccount.description = vTitle;
                    companyAccount.title = vCompanyName;
                    companyAccount.body = vCompanyName;
                    companyAccount.imageUrl = vCompanyAvatarURL;

                    //Current page is of this
                    companyAccount.externalId = vCompanyPageURL;


                    if (!collectedAuthors.hasOwnProperty(companyAccount.externalId)) {
                        collectedAuthors[companyAccount.externalId] = true;

                        totalAuthors++;
                        addImage(companyAccount);
                        cntItems++;
                    }
                    // ------------------- REGISTER "Relation" between Target and work place --
                    var companyRelEntity = {};

                    companyRelEntity.itemType = "12"; //relation
                    companyRelEntity.parent_externalId = theTargetID;
                    companyRelEntity.parentObjectType = 4; //person
                    companyRelEntity.type = 23; //friend
                    companyRelEntity.description = vPositionTitle + " : " + (vPositionDescription ? vPositionDescription : '');
                    companyRelEntity.startDate = vBeginDate;
                    companyRelEntity.endDate = vEndDate;
                    companyRelEntity.sideB_externalId = companyAccount.externalId;
                    companyRelEntity.sideB_ObjectType = companyAccount.itemType;

                    executor.addEntity(companyRelEntity);
                    cntItems++;


                    //------------------------------------------------------------
                    thisNode = iterator.iterateNext();

                }
                _res.totalCollected = cntItems;
                _res.returnCode = "200";
            } else { //Block "Experience" not found
                _res.totalCollected = 0;
                _res.returnCode = "204";
            }
        } catch (e) {
            Logger.error("getVolunteerExperience - " + e.message);
            _res.totalCollected = cntItems;
            _res.returnCode = "504 " + e.message;
        }
        return _res;
    }
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    function getEducation(pMarker, pContext) {

        cntItems = 0;
        var _res = {
            totalCollected: 0,
            returnCode: ""
        };

        re.placeholder2 = ''; // Still no Education-Places to request for additional data from Nightmare service

        try {
            _tmp = _extract.GetCollection({
                    xpathName: "lstEducation",
                    mandatory: "0"
                },
                pMarker
            );

            if (_tmp.returnCode === "200") {
                var iterator = _tmp.Value;


                var thisNode = iterator.iterateNext();

                while (thisNode) {


                    var vEducationPlaceNameMajor = _extract.GetText({
                            xpathName: ".//h3[contains(@class,'__school-name')]",
                            mandatory: "1",
                            context: thisNode
                        },
                        pMarker + "-1"
                    ).Value;


                    var vEducationDegreeName = _extract.GetText({
                            xpathName: ".//span[contains(text(),'Degree Name')]/following-sibling::span",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-2"
                    ).Value;

                    var vEducationFieldOfStudy = _extract.GetText({
                            xpathName: ".//span[contains(text(),'Field Of Study')]/following-sibling::span",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-3"
                    ).Value;

                    var vEducationDegreeDescription = _extract.GetText({
                            xpathName: ".//div[contains(@class, '__extra-details')]/p[contains(@class, '__description')]",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-4"
                    ).Value;


                    var vEducationDateStart = _extract.GetText({
                            xpathName: ".//span/time[1]",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-4"
                    ).Value;

                    var vEducationDateEnd = _extract.GetText({
                            xpathName: ".//span/time[2]",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-4"
                    ).Value;

                    var vEducationPlaceURL = _extract.GetAttribute({
                            xpathName: ".//a[contains(@href,'/school/')]",
                            mandatory: "0",
                            attributeName: "href",
                            context: thisNode
                        },
                        pMarker + "-5"
                    ).Value;

                    if (vEducationPlaceURL) {

                        vEducationPlaceURL = vEducationPlaceURL.match(/\/school\/(.*)\//)[1];
                        vEducationPlaceURL = "https://" + DomainURL + "/edu/school?id=" + vEducationPlaceURL;

                        //Prepare companyID for additional processing
                        re.placeholder2 = re.placeholder2 + ';' + vEducationPlaceURL;
                    } else {
                        vEducationPlaceURL = "https://" + DomainURL + "/edu/school?id=" + vEducationPlaceNameMajor.replace(/[\W_]+/g, '_');
                    }


                    var vEducationPlaceLogoURL = _extract.GetAttribute({
                            xpathName: ".//h5[@class='education-logo']//strong/img",
                            mandatory: "0",
                            attributeName: "src",
                            context: thisNode
                        },
                        pMarker + "-5"
                    ).Value;


                    if ((!vEducationPlaceLogoURL) || !(vEducationPlaceLogoURL.match(/(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.jpg|\.png|\.jpeg))/))) {
                        vEducationPlaceLogoURL = '';
                    }

                    //--- Save Education Place as Entity -----------------
                    var educationPlace = {};

                    educationPlace.url = vEducationPlaceURL;
                    educationPlace.externalId = vEducationPlaceURL;
                    educationPlace.itemType = "4"; // Web Entity
                    educationPlace.type = "6"; // Education
                    educationPlace.activityType = "1"; // Social Network
                    //companyAccount.description = vTitle;
                    educationPlace.title = vEducationPlaceNameMajor;
                    educationPlace.imageUrl = vEducationPlaceLogoURL;

                    educationPlace.body = vEducationPlaceNameMajor;

                    if (!collectedAuthors.hasOwnProperty(educationPlace.externalId)) {
                        collectedAuthors[educationPlace.externalId] = true;

                        totalAuthors++;
                        addImage(educationPlace);
                        cntItems++;
                    }


                    // ------------------- REGISTER "Relation" between Target and education place --
                    var educationRelEntity = {};

                    educationRelEntity.itemType = "12"; //relation
                    educationRelEntity.parent_externalId = theTargetID;
                    educationRelEntity.parentObjectType = 4; //person
                    educationRelEntity.type = 15; //study
                    educationRelEntity.description = vEducationDegreeName + " : " + vEducationFieldOfStudy + " : " + vEducationDegreeDescription;
                    educationRelEntity.sideB_externalId = educationPlace.externalId;
                    educationRelEntity.sideB_ObjectType = educationPlace.itemType;
                    educationRelEntity.startDate = vEducationDateStart;
                    educationRelEntity.endDate = vEducationDateEnd;


                    executor.addEntity(educationRelEntity);
                    cntItems++;


                    //------------------------------------------------------------
                    cntItems++;
                    thisNode = iterator.iterateNext();

                }
                _res.totalCollected = cntItems;
                _res.returnCode = "200";
            } else { //Block "Educations" not found
                _res.totalCollected = 0;
                _res.returnCode = "204";
            }
        } catch (e) {
            Logger.error("getEducation - " + e.message);
            _res.totalCollected = cntItems;
            _res.returnCode = "504 " + e.message;
        }
        return _res;
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    function getRecommendationsRecieved(pMarker, pContext) {

        cntItems = 0;
        var _res = {
            totalCollected: 0,
            returnCode: "",
            functionName: "getRecommendations"
        };

        window.scrollBy(0, 1500);

        //click on "recieved" (recommendations) link
        //var _xp = ".//li[@role='presentation'][1]/a";
        var _xp = ".//div[@class='recommendations-inlining']//*[@role='tab'][1]";
        var resultPosts = document.evaluate(_xp, document, null, 6, null);

        var len = resultPosts.snapshotLength;

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
            Logger.production("500", "ERROR", "eventFire() :: " + e + " at line " + e.lineNumber, false);
        }



        try {
            _tmp = _extract.GetCollection({
                    xpathName: "lstRecommendations",
                    mandatory: "0"
                },
                pMarker
            );

            if (_tmp.returnCode === "200") {
                var iterator = _tmp.Value;


                var thisNode = iterator.iterateNext();

                while (thisNode) {


                    var vRecommendationText = _extract.GetText({
                            xpathName: ".//blockquote[contains(@class, 'recommendation-entity__text')]",
                            mandatory: "1",
                            context: thisNode
                        },
                        pMarker + "-1"
                    ).Value;

                    var vCommenterAccountID = _extract.GetAttribute({
                            xpathName: ".//a[@class='pv-recommendation-entity__member ember-view']",
                            attributeName: "href",
                            mandatory: "1",
                            context: thisNode
                        },
                        pMarker + "-2"
                    ).Value;


                    var vCommenterName = _extract.GetText({
                            xpathName: ".//a//h3",
                            mandatory: "1",
                            context: thisNode
                        },
                        pMarker + "-3"
                    ).Value;

                    if (vCommenterAccountID) {
                        if (!(vCommenterAccountID.match('www.linkedin.com')))
                            vCommenterAccountID = 'https://www.linkedin.com' + vCommenterAccountID;
                    } else {
                        vCommenterAccountID = 'https://www.linkedin.com/' + vCommenterName.replace(/[\W_]+/g, '_');
                    }


                    var vCommenterAddInfo = _extract.GetText({
                            xpathName: ".//a//p[1]",
                            mandatory: "1",
                            context: thisNode
                        },
                        pMarker + "-4"
                    ).Value;

                    if (!vCommenterAddInfo) {
                        vCommenterAccountID = '';
                    }


                    var vCommenterAvatar = _extract.GetAttribute({
                            xpathName: ".//a/img",
                            mandatory: "0",
                            attributeName: "src",
                            context: thisNode
                        },
                        pMarker + "-5"
                    ).Value;

                    if ((!vCommenterAvatar) || !(vCommenterAvatar.match(/(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.jpg|\.png|\.jpeg))/))) {
                        vCommenterAvatar = '';
                    }

                    //-------------- Save object for Person that gave recommendation to the target ------------------
                    var commenterEntity = {};

                    commenterEntity.externalId = vCommenterAccountID



                    commenterEntity.url = vCommenterAccountID;
                    commenterEntity.itemType = "4"; // Web Entity
                    commenterEntity.activityType = "1"; // Social Network
                    commenterEntity.type = "1"; // Person
                    commenterEntity.body = vCommenterName;
                    commenterEntity.description = vCommenterAddInfo;
                    commenterEntity.imageUrl = vCommenterAvatar;
                    commenterEntity.title = vCommenterName;

                    if (!collectedAuthors.hasOwnProperty(commenterEntity.externalId)) {
                        collectedAuthors[commenterEntity.externalId] = true;

                        re.placeholder3 = re.placeholder3 + ';' + commenterEntity.externalId;

                        totalAuthors++;
                        addImage(commenterEntity);
                        cntItems++;
                    }



                    var vCommentAddContext = _extract.GetText({
                            xpathName: ".//p[contains(@class,'rec-extra')]",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-6"
                    ).Value;

                    if (!vCommentAddContext) {
                        vCommentAddContext = '';
                    }


                    var fc = vCommentAddContext.indexOf(',');
                    var sc = vCommentAddContext.indexOf(',', fc + 1);

                    var strDate = vCommentAddContext.substring(0, sc).trim();
                    var strContext = vCommentAddContext.substring(sc + 1, vCommentAddContext.length).trim();


                    //--- Save Recommendation as relation with description etc. -----------------
                    var RecommendationRelationEntity = {};


                    RecommendationRelationEntity.itemType = "12"; //relation
                    RecommendationRelationEntity.type = 25; //recommendation
                    RecommendationRelationEntity.parentObjectType = 4; //person
                    RecommendationRelationEntity.parent_externalId = commenterEntity.externalId;
                    RecommendationRelationEntity.description = strContext + ': ' + vRecommendationText;
                    RecommendationRelationEntity.startDate = strDate;

                    RecommendationRelationEntity.sideB_ObjectType = 4; //person
                    RecommendationRelationEntity.sideB_externalId = theTargetID;

                    executor.addEntity(RecommendationRelationEntity);
                    cntItems++;

                    var RecTopic = {};

                    RecTopic.externalId = "Rec-" + commenterEntity.externalId + theTargetID;
                    RecTopic.activityType = "1";
                    RecTopic.itemType = "2";
                    RecTopic.body = strContext + ': ' + vRecommendationText;
                    RecTopic.url = document.URL;
                    RecTopic.writeDate = strDate;
                    RecTopic.writer_externalId = commenterEntity.externalId;
                    RecTopic.parentObjectType = "4";
                    RecTopic.parent_externalId = theTargetID;

                    executor.addEntity(RecTopic);

                    cntItems++;
                    //-----------------------------------------------------------------------------------------------

                    thisNode = iterator.iterateNext();

                }
                _res.totalCollected = cntItems;
                _res.returnCode = "200";

                //---- Now, collect Given Recommendations -------------------------------------------------------------------
                Logger.production("------------------------- Step 5 ---------------------------------");
                callStackAdd("collectRecommendationsGiven");
                _extract.ClickButtons("btnCollectRecommendations", "105", 20, collectRecommendationsGiven, _process);
                //------------------------------------------------------------------------------------------------------------
            } else { //Block "Recommendations" not found
                _res.totalCollected = 0;
                _res.returnCode = "204";
            }
        } catch (e) {
            Logger.error("getRecommendations - " + e.message);
            _res.totalCollected = cntItems;
            _res.returnCode = "504 " + e.message;
        }
        return _res;
    }
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    function getRecommendationsGiven(pMarker, pContext) {

        cntItems = 0;
        var _res = {
            totalCollected: 0,
            returnCode: "",
            functionName: "getRecommendationsGiven"
        };


        window.scrollBy(0, 1500);

        //click on "given" (recommendations) link
        //var _xp = ".//li[@role='presentation'][2]/a";
        var _xp = ".//div[@class='recommendations-inlining']//*[@role='tab'][2]";

        var resultPosts = document.evaluate(_xp, document, null, 6, null);

        var len = resultPosts.snapshotLength;

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
            Logger.production("500", "ERROR", "eventFire() :: " + e + " at line " + e.lineNumber, false);
        }

        try {
            _tmp = _extract.GetCollection({
                    xpathName: "lstRecommendations",
                    mandatory: "0"
                },
                pMarker
            );

            if (_tmp.returnCode === "200") {
                var iterator = _tmp.Value;


                var thisNode = iterator.iterateNext();

                while (thisNode) {


                    var vRecommendationText = _extract.GetText({
                            xpathName: ".//blockquote[contains(@class, 'recommendation-entity__text')]",
                            mandatory: "1",
                            context: thisNode
                        },
                        pMarker + "-1"
                    ).Value;


                    var vCommenterAccountID = _extract.GetAttribute({
                            xpathName: ".//a[@class='pv-recommendation-entity__member ember-view']",
                            attributeName: "href",
                            mandatory: "1",
                            context: thisNode
                        },
                        pMarker + "-2"
                    ).Value;


                    var vCommenterName = _extract.GetText({
                            xpathName: ".//a//h3",
                            mandatory: "1",
                            context: thisNode
                        },
                        pMarker + "-3"
                    ).Value;

                    if (vCommenterAccountID) {
                        if (!(vCommenterAccountID.match('www.linkedin.com')))
                            vCommenterAccountID = 'https://www.linkedin.com' + vCommenterAccountID;
                    } else {
                        vCommenterAccountID = 'https://www.linkedin.com/' + vCommenterName.replace(/[\W_]+/g, '_');
                    }


                    var vCommenterAddInfo = _extract.GetText({
                            xpathName: ".//a//p[1]",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-4"
                    ).Value;

                    if (!vCommenterAddInfo) {
                        vCommenterAccountID = '';
                    }


                    var vCommenterAvatar = _extract.GetAttribute({
                            xpathName: ".//a/img",
                            mandatory: "0",
                            attributeName: "src",
                            context: thisNode
                        },
                        pMarker + "-5"
                    ).Value;

                    if ((!vCommenterAvatar) || !(vCommenterAvatar.match(/(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.jpg|\.png|\.jpeg))/))) {
                        vCommenterAvatar = '';
                    }

                    //-------------- Save object for Person that gave recommendation to the target ------------------
                    var commenterEntity = {};

                    commenterEntity.externalId = vCommenterAccountID
                    commenterEntity.url = vCommenterAccountID;
                    commenterEntity.itemType = "4"; // Web Entity
                    commenterEntity.activityType = "1"; // Social Network
                    commenterEntity.type = "1"; // Person
                    commenterEntity.body = vCommenterName;
                    commenterEntity.description = vCommenterAddInfo;
                    commenterEntity.imageUrl = vCommenterAvatar;
                    commenterEntity.title = vCommenterName;

                    if (!collectedAuthors.hasOwnProperty(commenterEntity.externalId)) {
                        collectedAuthors[commenterEntity.externalId] = true;

                        re.placeholder3 = re.placeholder3 + ';' + commenterEntity.externalId;

                        totalAuthors++;
                        addImage(commenterEntity);
                        cntItems++;
                    }



                    var vCommentAddContext = _extract.GetText({
                            xpathName: ".//p[contains(@class,'rec-extra')]",
                            mandatory: "0",
                            context: thisNode
                        },
                        pMarker + "-6"
                    ).Value;

                    if (!vCommentAddContext) {
                        vCommentAddContext = '';
                    }


                    var fc = vCommentAddContext.indexOf(',');
                    var sc = vCommentAddContext.indexOf(',', fc + 1);

                    var strDate = vCommentAddContext.substring(0, sc).trim();
                    var strContext = vCommentAddContext.substring(sc + 1, vCommentAddContext.length).trim();


                    //--- Save Recommendation as relation with description etc. (opposite direction than in CollectRecommendations)-----------------
                    var RecommendationRelationEntity = {};


                    RecommendationRelationEntity.itemType = "12"; //relation
                    RecommendationRelationEntity.type = 25; //recommendation
                    RecommendationRelationEntity.parentObjectType = 4; //person
                    RecommendationRelationEntity.parent_externalId = theTargetID; //### exchanged
                    RecommendationRelationEntity.description = strContext + ': ' + vRecommendationText;
                    RecommendationRelationEntity.startDate = strDate;

                    RecommendationRelationEntity.sideB_ObjectType = 4; //person
                    RecommendationRelationEntity.sideB_externalId = commenterEntity.externalId; //### exchanged

                    executor.addEntity(RecommendationRelationEntity);
                    cntItems++;

                    var RecTopic = {};

                    RecTopic.externalId = "Rec-" + commenterEntity.externalId + theTargetID;
                    RecTopic.activityType = "1";
                    RecTopic.itemType = "2";
                    RecTopic.body = strContext + ': ' + vRecommendationText;
                    RecTopic.url = document.URL;
                    RecTopic.writeDate = strDate;
                    RecTopic.writer_externalId = theTargetID;
                    RecTopic.parentObjectType = "4";
                    RecTopic.parent_externalId = commenterEntity.externalId;

                    executor.addEntity(RecTopic);

                    cntItems++;
                    //-----------------------------------------------------------------------------------------------

                    thisNode = iterator.iterateNext();

                }
                _res.totalCollected = cntItems;
                _res.returnCode = "200";
            } else { //Block "Recommendations" not found
                _res.totalCollected = 0;
                _res.returnCode = "204";
            }
        } catch (e) {
            Logger.error("getRecommendationsGiven - " + e.message);
            _res.totalCollected = cntItems;
            _res.returnCode = "504 " + e.message;
        }
        return _res;
    }

    function getInterests() {
        var enumEntity = {
            "company": "4",
            "school": "6",
            "groups": "3"

        };

        var xpathButtonSeeAll = "(.//h2[contains(text(),'Interests')]/..//*[contains(text(),'See all')])[1]";
        var button = document.evaluate(xpathButtonSeeAll, document, null, 9, null);
        if (button.singleNodeValue) {
            var href = document.evaluate("(.//h2[contains(text(),'Interests')]/..//*[contains(text(),'See all')])[1]/..", document, null, 9, null).singleNodeValue.href;
            re.placeholder20 = document.URL + "detail/interests/companies/";
            re.placeholder16 = document.URL;
        } else {
            re.placeholder20 = document.URL + "detail/interests/companies/";
            re.placeholder16 = document.URL;
            //var xpathInterests = ".//h2[contains(text(),'Interests')]";
            //var interests = document.evaluate(xpathInterests, document, null, 9, null);
            //if (interests.singleNodeValue) {
            //    var itemInterests = document.evaluate(".//h2[contains(text(),'Interests')]/..//li", document, null, 7, null);
            //    if (itemInterests) {
            //        for (var i = 0; i < itemInterests.length; i++) {
            //            var currentEntity = itemInterests.snapshotItem(i);
            //            var entityInterest = {};
            //            entityInterest.externalId = currentEntity.href.split('/')[4];
            //            entityInterest.itemType = "4";
            //            entityInterest.title = currentEntity.textContent;
            //            entityInterest.type = enumEntity[currentEntity.href.split('/')[3]];
            //            entityInterest.url = currentEntity.href;
            //            entityInterest.parentObjectType = "4";
            //            entityInterest.parent_externalId = target.externalId;
            //            var imageUrl = document.evaluate(".//img", currentEntity, null, 9, null);
            //            if (imageUrl.singleNodeValue) {
            //                entityInterest.imageUrl = imageUrl.singleNodeValue.src;
            //            }
            //            addImage(entityInterest);
//
            //            var relatedInterest = {};
            //            relatedInterest.itemType = "12"; // Relation
            //            relatedInterest.type = "26"; // Related resource
            //            relatedInterest.parent_externalId = target.externalId;
            //            relatedInterest.parentObjectType = entityInterest.itemType;
            //            relatedInterest.sideB_externalId = entityInterest.externalId;
            //            relatedInterest.sideB_ObjectType = "4"; // Image
            //            addEntity(relatedInterest);
            //        }
            //    }
            //}
        }

    }
}