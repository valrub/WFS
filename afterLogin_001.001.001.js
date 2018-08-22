//

//

var domains;
domains = {
    "twitter" : [
        {
            "order" : "3",
            "msg" : "t-m-3",
            "btn" : "t-b-3"
        },
        {
            "order" : "1",
            "msg" : "t-m-1",
            "btn" : "t-b-1"
        },
        {
            "order" : "4",
            "msg" : "t-m-4",
            "btn" : "t-b-4"
        },
        {
            "order" : "2",
            "msg" : "t-m-2",
            "btn" : "t-b-2"
        }
        
    ] , 
    "instagram" : [
        {
            "order" : "2",
            "msg" : "i-m-1",
            "btn" : ".//a[text() = 'Change Profile Photo']"
        },
                   {
            "order" : "1",
            "msg" : "i-m-2",
            "btn" : ".//button/div[text() = 'Edit Profile']"
        }
    ] 
};


console.log('Hi all! ' + postLogin('instagram'));

function postLogin(domainName){
    var ans = {};
	  var i = 0;
	
    //check that this domain is registered;
    if(typeof(domains[domainName]) ===  'undefined'){
        ans.message = 'No such Domain ' + domainName;    
        ans.status = 0;
    }else{
    var sortedArray = domains[domainName].sort((a, b) => a.order >  b.order);
      
      if(sortedArray.length > 0){
		    console.log('There are ' + sortedArray.length + ' clicks to perform');  
        
        var clickAllRelevantButtons = setInterval(function ()                                          {   
          console.log('i=' + i); //current iteration
          console.log('Iteration #' + (i+1)); 
          console.log(sortedArray[i]);
		  
          if (i == sortedArray.length - 1)
          {
            clearInterval(clickAllRelevantButtons); 
            console.log('stop');
          }

          

          
          // Check that "btn" appears
          var _xp = sortedArray[i].btn;
          var resultButtons = document.evaluate(_xp, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

          var len = resultButtons.snapshotLength;

          
          keepClicking = (len > 0);
          // In case it will be found - click "btn"
          if (keepClicking) {
            try {
              var el = resultButtons.snapshotItem(0); //First element to be processed

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
            i++;
          }else{
			  console.log('XPATH = ' + _xp + ' not found');
		  }


        }, 3000);
      }else{
		console.log('Wrong definition of omain ' + domainName);  
	  }
	  

      ans.message = 'Processed';
      ans.status = 1;
    }
      
    return ans;
}