var scheduledImages = 0;
var collectedEntities = 0;

////////////////////////////////////////////////////////////////////////////////////////////

function setExecutor(ex) {
               executor = ex;
}

function collectTopics(topic, fakeAuthor, keyword) {
               try {
                              // Get title and url of the topic
                              var title = document.evaluate(".//h3/a[@href]", topic, null, 9, null).singleNodeValue;
                              var link = title.getAttribute("href");
                              //addEntity({description: title.textContent + "  title", body: link + "  link"});


                              // Get author of the topic
                              var author = document.evaluate(".//cite|//div[@class='slp']/span[1]", topic, null, 9, null).singleNodeValue;
                              if ((author != undefined) && (author != null)) {
                                             author = author.textContent
                              } else {
                                             author = fakeAuthor;
                              }

                              // Get snippet of the topic
                              var snippet = document.evaluate(".//*[@class='st']", topic, null, 9, null).singleNodeValue;
                              var date = document.evaluate(".//*[@class='f']", snippet, null, 9, null).singleNodeValue;
                              if (date) {
                                             date = date.textContent;
                              }
                              var cleanText = snippet.textContent;
                              cleanText = cleanText.replace(date, "");

                              // Get date of the topic
                              var writeDate = "";
                              var writeDateObj = document.evaluate(".//span[@class='f']|//div[@class='slp']/span[contains(@class, 'f')]", topic, null, 9, null).singleNodeValue;
                              if ((writeDateObj != null) && (writeDateObj != undefined)) {

                                             writeDate = writeDateObj.textContent.replace(" - ", "");

                              } else {
                                             writeDate = "";
                              }

                              // Generate externalId for the topic
                              var noHttpUrl = link.replace("https://", "").replace("http://", "");
                              var externalId = keyword.split(',')[0] + "_" + md5(noHttpUrl);

                              var topicCollect = {
                                             activityType: "1",
                                             itemType: "2",
                                             type: "16",
                                             externalId: externalId,
                                             parentObjectType: "4",
                                             parent_externalId: fakeAuthor,
                                             url: link,
                                             title: title.textContent,
                                             body: cleanText,
                                             writeDate: writeDate,
                                             writer_externalId: md5(author),
                                             placeholder1: link
                              };

                              var writer = {
                                             activityType: "1",
                                             itemType: "4",
                                             type: "1",
                                             externalId: md5(author),
                                             body: author,
                                             title: author,
                                             url: link,
                              }

                              addEntity(topicCollect);
                              addEntity(writer);

                              // Check if there is image for this topic
                              var imageObj = document.evaluate(".//img", topic, null, 9, null).singleNodeValue;
                              if ((imageObj != null) && (imageObj != undefined)) {
                                             collectImages(imageObj, topicCollect);
                              } else {
                                             console.log("collectTopics() :: There is no image for the snippet !");
                              }

               } catch (e) {
                              console.log(e)
               }
};

function collectImages(image, parent) {
               try {
                              var srcAttribute = image.getAttribute("src");

                              // Generate image externalId
                              var externalId = "gsimg_" + md5(srcAttribute);

                              // Create image object
                              var imageObj = {
                                             externalId: externalId,
                                             activityType: "1",
                                             itemType: "5",
                                             writer_externalId: parent.writer_externalId,
                                             parent_externalId: parent.externalId,
                                             parentObjectType: "2",
                                             url: parent.url
                              }
                              if (srcAttribute.indexOf("data:image/" == -1)) {
                                             imageObj.imageUrl = srcAttribute;
                                             addImage(imageObj);
                              }
               } catch (e) {
                              executor.reportError("500", "ERROR", "collectImages() :: Invalid image url! The image cannot be downloaded!", false);
               }
};

function addEntity(obj) {
               try {
                              collectedEntities += 1;
                              executor.addEntity(obj);
                              if (collectedEntities % 50 == 0) {
                                             executor.flushEntities();
                              }
               } catch (e) {
                              console.log("ERROR. addEntity() :: " + e + " at line " + e.lineNumber);
                              executor.reportError("500", "ERROR", "addEntity() :: " + e + " at line " + e.lineNumber, false);
               }
}

function addImage(obj) {
               try {
                              if (obj.imageUrl) {
                                             scheduledImages += 1;
                                             executor.saveBinary(obj.imageUrl, onSuccess, onError, obj);
                                             //console.log("addImage() ::  " + scheduledImages);
                              } else {
                                             addEntity(obj);
                              }
               } catch (e) {
                              console.log("ERROR. addImage() :: " + e + " at line " + e.lineNumber);
                              executor.reportError("500", "ERROR", "addImage() :: " + e + " at line " + e.lineNumber, false);
               }
}

function finalize() {
               try {
                              var finalizeInterval = setInterval(function() {
                                             if (scheduledImages <= 0) {
                                                            clearInterval(finalizeInterval);
                                                            executor.ready();
                                             } else {
                                                            console.log("INFO. Waiting for " + scheduledImages + " photos to be downloaded...");
                                             }
                              }, 1000);


               } catch (e) {
                              console.log("ERROR. finalize() :: " + e + " at line " + e.lineNumber);
                              executor.reportError("500", "ERROR", "finalize() :: " + e + " at line " + e.lineNumber, false);
                              executor.ready();
               }
}

function onSuccess(filePath, entity) {
               try {

                              entity.image = filePath;
                              addEntity(entity);
                              scheduledImages--;

                              //console.log("onSuccess() ::  " + scheduledImages);
               } catch (e) {
                              executor.reportError("500", "ERROR", "onSuccess() :: " + e + " at line " + e.lineNumber, false);
               }
}

function onError() {
               try {
                              scheduledImages--;
                              executor.reportError("500", "ERROR", "onError() :: The picture cannot be downloaded! Check image properties!", false);
                              //console.log("onError() ::  " + scheduledImages);
               } catch (e) {
                              executor.reportError("500", "ERROR", "onError() :: " + e, false);
               }
}

function md5(string) {
               function RotateLeft(lValue, iShiftBits) {
                              return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
               }

               function AddUnsigned(lX, lY) {
                              var lX4, lY4, lX8, lY8, lResult;
                              lX8 = (lX & 0x80000000);
                              lY8 = (lY & 0x80000000);
                              lX4 = (lX & 0x40000000);
                              lY4 = (lY & 0x40000000);
                              lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                              if (lX4 & lY4) {
                                             return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                              }
                              if (lX4 | lY4) {
                                             if (lResult & 0x40000000) {
                                                            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                                             } else {
                                                            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                                             }
                              } else {
                                             return (lResult ^ lX8 ^ lY8);
                              }
               }

               function F(x, y, z) {
                              return (x & y) | ((~x) & z);
               }

               function G(x, y, z) {
                              return (x & z) | (y & (~z));
               }

               function H(x, y, z) {
                              return (x ^ y ^ z);
               }

               function I(x, y, z) {
                              return (y ^ (x | (~z)));
               }

               function FF(a, b, c, d, x, s, ac) {
                              a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
                              return AddUnsigned(RotateLeft(a, s), b);
               };

               function GG(a, b, c, d, x, s, ac) {
                              a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
                              return AddUnsigned(RotateLeft(a, s), b);
               };

               function HH(a, b, c, d, x, s, ac) {
                              a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
                              return AddUnsigned(RotateLeft(a, s), b);
               };

               function II(a, b, c, d, x, s, ac) {
                              a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
                              return AddUnsigned(RotateLeft(a, s), b);
               };

               function ConvertToWordArray(string) {
                              var lWordCount;
                              var lMessageLength = string.length;
                              var lNumberOfWords_temp1 = lMessageLength + 8;
                              var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
                              var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
                              var lWordArray = Array(lNumberOfWords - 1);
                              var lBytePosition = 0;
                              var lByteCount = 0;
                              while (lByteCount < lMessageLength) {
                                             lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                                             lBytePosition = (lByteCount % 4) * 8;
                                             lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                                             lByteCount++;
                              }
                              lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                              lBytePosition = (lByteCount % 4) * 8;
                              lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                              lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                              lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                              return lWordArray;
               };

               function WordToHex(lValue) {
                              var WordToHexValue = "",
                                             WordToHexValue_temp = "",
                                             lByte, lCount;
                              for (lCount = 0; lCount <= 3; lCount++) {
                                             lByte = (lValue >>> (lCount * 8)) & 255;
                                             WordToHexValue_temp = "0" + lByte.toString(16);
                                             WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
                              }
                              return WordToHexValue;
               };

               function Utf8Encode(string) {
                              string = string.replace(/\r\n/g, "\n");
                              var utftext = "";

                              for (var n = 0; n < string.length; n++) {
                                             var c = string.charCodeAt(n);

                                             if (c < 128) {
                                                            utftext += String.fromCharCode(c);
                                             } else if ((c > 127) && (c < 2048)) {
                                                            utftext += String.fromCharCode((c >> 6) | 192);
                                                            utftext += String.fromCharCode((c & 63) | 128);
                                             } else {
                                                            utftext += String.fromCharCode((c >> 12) | 224);
                                                            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                                                            utftext += String.fromCharCode((c & 63) | 128);
                                             }
                              }

                              return utftext;
               };

               var x = Array();
               var k, AA, BB, CC, DD, a, b, c, d;
               var S11 = 7,
                              S12 = 12,
                              S13 = 17,
                              S14 = 22;
               var S21 = 5,
                              S22 = 9,
                              S23 = 14,
                              S24 = 20;
               var S31 = 4,
                              S32 = 11,
                              S33 = 16,
                              S34 = 23;
               var S41 = 6,
                              S42 = 10,
                              S43 = 15,
                              S44 = 21;

               string = Utf8Encode(string);

               x = ConvertToWordArray(string);

               a = 0x67452301;
               b = 0xEFCDAB89;
               c = 0x98BADCFE;
               d = 0x10325476;

               for (k = 0; k < x.length; k += 16) {
                              AA = a;
                              BB = b;
                              CC = c;
                              DD = d;
                              a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                              d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                              c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                              b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                              a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                              d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                              c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                              b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                              a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                              d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                              c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                              b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                              a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                              d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                              c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                              b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                              a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                              d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                              c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                              b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                              a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                              d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                              c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                              b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                              a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                              d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                              c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                              b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                              a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                              d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                              c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                              b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                              a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                              d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                              c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                              b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                              a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                              d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                              c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                              b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                              a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                              d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                              c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                              b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                              a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                              d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                              c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                              b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                              a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                              d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                              c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                              b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                              a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                              d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                              c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                              b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                              a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                              d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                              c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                              b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                              a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                              d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                              c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                              b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                              a = AddUnsigned(a, AA);
                              b = AddUnsigned(b, BB);
                              c = AddUnsigned(c, CC);
                              d = AddUnsigned(d, DD);
               }

               var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

               return temp.toLowerCase();
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///**
//* @desc Google Plus API Library version 1.0
// Angelina Borisova

//*/


//// set executor
//function setExecutor(executor) {
//            googleExecutor = executor;
//}

//// set google plus API access key
//function setKey(key) {
//            googleKey = key;
//}

///*
//// set google plus url and extract thre id/username from it
//function setUrl(url) {
//            try {
//                           setId(targetIdentifierByUrl(url));
//            } catch (e) {
//                           addEntity({
//                                          description: e.message + " while executing " + arguments.callee.toString()
//                           });
//            }
//}*/

//// set Google plus ID/username
//function setGoogleId(id) {
//            googleId = id;
//}

//// by default we are in asynchronous mode
//// Currently ASYCH mode is not supported
//var googlePlusAsynchronousMode = true;
//var parentObject = {};
//var objectLocation = {};


//function setGoogleAsynchronousMode(asynchronousMode) {
//            googlePlusAsynchronousMode = asynchronousMode;
//}

//// addEntity function
//function addEntity(object) {
//            try {
//                           googleExecutor.addEntity(object);
//            } catch (e) {
//                           addEntity({
//                                          description: e.message + " while executing " + arguments.callee.toString()
//                           });
//            }
//} 

////collect account info details
//function collectEntity() {
//            try {
//                           var googlePlusUrl = 'https://www.googleapis.com/plus/v1/people/'+googleId+'?key='+ googleKey;
//                           googlePlusApi(googlePlusUrl);
//                           user = response;

//                           var entity = {
//                                          activityType: '1',
//                                          itemType: '4',
//                                          externalId:user.id,
//                                          imageUrl:user.image.url,
//                                          url:user.url
//                           };

//                           parentObject.externalId = user.id;

//                           if (user.objectType=="person"){
//                                          entity.type = "1";
//                           }

//                           // collect gender
//                           if (user.gender) {
//                                          if (user.gender=="male"){
//                                                         entity.gender = "1";
//                                          } else if (user.gender=="female") {
//                                                         entity.gender = "2";
//                                          }

//                           }

//                           // extract user name
//                           if (user.displayName) {
//                                          entity.title = user.displayName;
//                           }
//                           if (entity.title==null || entity.title == ''){
//                                          entity.title = user.name.givenName + ' '+ user.name.givenName;
//                           } 


//                           // extracts the about me information
//                           if (user.aboutMe) {
//                                          entity.description = user.aboutMe;
//                           }


//                           maritalStatus = "";
//                           // extract the marital status
//                           if (user.relationshipStatus) {
//                                          maritalStatus = user.relationshipStatus;
//                                          if (maritalStatus == "single") {
//                                                         maritalStatus = "1";
//                                          } else if (maritalStatus == "in_a_relationship"){
//                                                         maritalStatus = "2";
//                                          } else if (maritalStatus == "married"){
//                                                         maritalStatus = "3"; 
//                                          } else {
//                                                         maritalStatus = "";
//                                          }

//                                          entity.to_comment_externalId = maritalStatus;
//                           }

//                           addImage(entity);

//            } catch (e) {
//                           addEntity({
//                                          description: e.message + " while executing " + arguments.callee.toString()
//                           });
//                           ready();
//            }

//}


//var images = new Array();
//// add an entity that has an image
//function addImage(image) {

//            try {
//                           if (images[image.externalId] === undefined) {
//                           images[image.externalId] = image;
//     }
//            } catch (e) {
//                           addEntity({
//                                          description: e.message + " while executing " + arguments.callee.toString()
//                           });
//                           ready();
//            }
//}

////call save binary function to download all objects with images
//function downloadGoogleAccountImages() {

//            for (var id in images) {
//                           googleExecutor.saveBinary(images[id].imageUrl, onSuccess, onError, images[id]);
//            }

//}

//// Save all data in the DB
//var finalizing = false;

//function finalize() {
// try {
//     if (!finalizing) {
//         finalizing = true;
//         retries = 0;
//                                          downloadGoogleAccountImages();
//     }
// } catch (e) {
//                           addEntity({
//                                          description: e.message + " while executing " + arguments.callee.toString()
//                           });
//            }
//}

//// collect Google Plus Account Info
//function googlePlusAccountInfo (){
//            user = response;

//            // extracts the birthdate
//            if (user.birthday){
//                           addEntity({itemType:"17", type:"1",parentObjectType:"4", parent_externalId:parentObject.externalId, body:user.birthday, activityType:"1"});
//            }

//            // extracts the current location
//            if (user.currentLocation) {
//                           addEntity({itemType:"15", type:"4",parentObjectType:"4", parent_externalId:parentObject.externalId, body:user.currentLocation, activityType:"1"});
//            }


//            // find the user's website URL
//            if (user.urls) {
//                           for(var i = 0; i < user.urls.length; i++) {
//                                          website = user.urls[i].value;            
//                                          addEntity({itemType:"16", type:"1",parentObjectType:"4", parent_externalId:parentObject.externalId, body:website, activityType:"1"});                        
//                           }
//            }

//            // extract organization - work, education
//            if (user.organizations) {
//                           for(var i = 0; i < user.organizations.length; i++) {
//                                          var name = user.organizations[i].name;
//                                          var organizationTitle = user.organizations[i].title;
//                                          var organizationId = "gso_" + toHex(name);
//                                          var startDate = "";
//                                          var endDate = "";
//                                          var description = "";
//                                          var location = "";
//                                          if (user.organizations[i].startDate) {
//                                                         startDate = user.organizations[i].startDate;
//                                          }
//                                          if (user.organizations[i].endDate) {
//                                                         endDate = user.organizations[i].endDate;
//                                          }

//                                          if (user.organizations[i].description) {
//                                                         description = user.organizations[i].description;
//                                          }

//                                          if (user.organizations[i].location) {
//                                                         location = user.organizations[i].location;                            
//                                                         addEntity({itemType:"15", type:"4", parent_externalId:organizationId, body:location, activityType:"1"});
//                                          }
//                                          if (user.organizations[i].type == "work") {

//                                                         addEntity({itemType:"12", type:"23", parent_externalId:parentObject.externalId, parentObjectType:"4", sideB_externalId:organizationId, sideB_ObjectType:"4" });
//                                                         addEntity({externalId:organizationId, itemType:"4", type:"4", activityType:"1", title:name, body:name, url:encodeURIComponent("www.google.com/"+name)});

//                                          } else if (user.organizations[i].type == "school") {

//                                                         addEntity({itemType:"12", type:"15", parent_externalId:parentObject.externalId, parentObjectType:"4", sideB_externalId:organizationId, sideB_ObjectType:"4" });
//                                                         addEntity({externalId:organizationId, itemType:"4", type:"6", activityType:"1", title:name, body:name, url:encodeURIComponent("www.google.com/"+name)});                            
//                                          }
//                           }                    
//            }

//            // extract google plus account email
//            if (user.emails) {
//                           for(var i = 0; i < user.emails.length; i++) {
//                                          var email = user.emails[i].value;            
//                                          addEntity({itemType:"16", type:"2",parentObjectType:"4", parent_externalId:parentObject.externalId, body:email, activityType:"1"});                        
//                           }
//            }

//            // extract google plus account address
//            if (user.placesLived) {
//                           for(var i = 0; i < user.placesLived.length; i++) {
//                                          var placeLived = user.placesLived[i].value;            
//                                          addEntity({itemType:"15", type:"4",parentObjectType:"4", parent_externalId:parentObject.externalId, body:placeLived, activityType:"1"});                        
//                           }  
//            }

//}

//// do an http request to Google + API
//var googleKey = "";
//function googlePlusApi(googlePlusUrl) {
//            try {
//                           var xhr = new XMLHttpRequest();
//                           xhr.googlePlusUrl = googlePlusUrl;
//                           //xhr.parentObject = parentObject;
//                           xhr.currentRequest = 0;


//                           xhr.open('GET', xhr.googlePlusUrl, googlePlusAsynchronousMode);
//                           xhr.onload = googleResponseListener;
//                           xhr.onerror = googleErrorListener;
//                           xhr.send(null);


//            } catch (e) {
//                           addEntity({
//                                          description: e.message + " while executing " + arguments.callee.toString()
//                           });
//            }
//}

//// handle the response (no paging for now)
//function googleResponseListener() {
//            try {

//                           if (this.status === 200 && this.responseType === "") {
//                                          status = this.status;
//                                          response = JSON.parse(this.responseText);
//                                          console.log(JSON.stringify(response));

//                           } else if (this.status === 403) {
//                                          xhr.open('GET', xhr.googlePlusUrl, googlePlusAsynchronousMode);
//                                          xhr.send(null);
//                           } else {
//                                          status = this.status;
//                                          addEntity({
//                                                         description: "HTTP reply status was " + this.status + " while requesting " + this.googlePlusUrl
//                                          });
//                           }
//            } catch (e) {
//                           addEntity({
//                                          description: e.message + " while executing " + arguments.callee.toString()
//                           });
//            }
//}

//function googleErrorListener() {
//            addEntity({
//                           description: "There was an error during the XHR: " + this.status
//            });
//            ready();
//}

//// call executor.ready()
//function ready() {
//            googleExecutor.ready();

//}


//function onSuccess(filePath, data) {
//            try {
//                           data.image = filePath;
//                           addEntity(data);
//                           ready();
//                           /*
//                           itemCount--;
//                           log("Successfully downloaded " + filePath + ", " + itemCount + " image download(s) remaining.");
//                           if (itemCount === 0) {
//                                          retryImageErrors();
//                           }*/
//            } catch (e) {
//                           addEntity({
//                                          description: e.message + " while executing " + arguments.callee.toString()
//                           });
//                           ready();
//            }
//}

//function onError() {

// addEntity({
//                           description: "There was an error during the XHR"
//            });
//            ready();

//}

//function imagesTimeoutListener() {
// if (!writingImageErrors) {
//     // Downloading images is taking too long.
//     console.log("Downloading images is taking too long.");
//     addEntity({
//         description: "Timeout while downloading images!"
//     });
//     writeImageErrors();
// }
//}

//// Timeout for downloading all images
//var imagesTimeout;

//// convert string to ID
//function toHex(str) {

// var hex = 0;
// for(var i=0;i<str.length;i++) {
//     hex = hex+parseInt(str.charCodeAt(i));
// }
// //return only the numbers from the HEX string
// return (hex.toString());

//}
