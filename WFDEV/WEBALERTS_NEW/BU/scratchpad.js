callVMFcrawlingService();



function callVMFcrawlingService() {

    var req = new XMLHttpRequest();

    req.open('GET', "http://10.164.54.101:3012/");
 
    req.onload = function() {
        if (req.status == 200) {
            try {
                var data = JSON.parse(req.response);//.output; // array with entities
              
                if (data.length == 0) {
                    console.log("WF could not retrieve any data from service.");
                    console.log('finalize(1)');
                } else {
                    console.log(data);
//                     
                }
            } catch (err) {
                console.log("Parsing data failed because: " + err);
                console.log('finalize(3)');
            }
        } else {
            console.log("Network Error. Server returned status code: " + req.status);
            console.log('finalize(4)');
        }
    };

    // Handle network errors
    req.onerror = function() {
        console.log("Network Error " + req.status);
        console.log('finalize(5)');
    };
    req.setRequestHeader("Content-Type", "application/json");
    req.send();
}
