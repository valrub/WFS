//Valentin July 2018
///check that there are no any "buttons" VA should press to approve some disclamer
//usage var ans =  postLogin('twitter');
//-------------------------------------------------------------------------------------------------------------------------------
var domains; //Code will try to click buttons in the right order
domains = {
    "twitter" : [
        {
            "order" : "2",
            "msg" : "t-m-3",
            "btn" : ".//div/a[text() = 'Find people to follow']"
        },
        {
            "order" : "1",
            "msg" : "Got it",
            "btn" : ".//div/button[text() = 'Got it']"
        }
    ] , 
    "instagram" : [
        {
            "order" : "2",
            "msg" : "i-m-1",
            "btn" : "./div//a[text() = 'Go to settings']"
        },
                   {
            "order" : "1",
            "msg" : "i-m-2",
            "btn" : ".//div/button[text() = 'Got it']"
        }
    ] 
};
//-------------------------------------------------------------------------------------------------------------------------------
alert('start');
var ans = postLogin('twitter');
//-------------------------------------------------------------------------------------------------------------------------------
function postLogin(domainName){
    var ans = {};
	  var i = 0;
	
	var stillProcessing = true; 
	
    //check that this domain is registered;
    if(typeof(domains[domainName]) ===  'undefined'){
        ans.message = 'No such Domain ' + domainName;    
        ans.status = 0;
    }else{
    var sortedArray = domains[domainName].sort((a, b) => a.order >  b.order);
      
      if(sortedArray.length > 0){
		    alert('There are ' + sortedArray.length + ' clicks to perform');  
        
		while(stillProcessing){
		
			//var clickAllRelevantButtons = setInterval(function (){   
			  
			  alert('Iteration #' + (i+1)); 
			  alert(JSON.stringify(sortedArray[i]));
			  
			  // Check that "btn" appears
			  var _xp = sortedArray[i].btn;
			  var resultButtons = document.evaluate(_xp, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

			  var len = resultButtons.snapshotLength;
			  alert('len = ' + len);
			  
			  keepClicking = (len > 0);
			  // In case it will be found - click "btn"
			  if (keepClicking) {
				try {
				  var el = resultButtons.snapshotItem(0); //First element to be processed
				  alert(el);
				  
					el.click();
					
				 	alert('Click-ed');
				} catch (e) {
				  alert("500", "ERROR", "eventFire() :: " + e + " at line " + e.lineNumber, false);
				}
				ans.message = 'Processed';
				ans.status = 1;
				i++;

				if (i == sortedArray.length - 1)
				{
				  //clearInterval(clickAllRelevantButtons); 
				  stillProcessing = false;
				  alert('stop iterating');
				}
			  }else{
				  alert('XPATH = ' + _xp + ' not found');
				  ans.message = 'XPATH = ' + _xp + ' not found';
				  ans.status = 0;
				  stillProcessing = false;
			  }

			//}, 3000);
		}
      }else{
        alert('Wrong definition of domain ' + domainName);  
        ans.message = 'Wrong definition of domain ' + domainName;
        ans.status = 0;
		stillProcessing = false;
	  }
	
    }
    
    return ans;
}
