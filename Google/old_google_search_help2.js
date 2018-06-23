    try {
        var URL="";
        var Name = "";
        
        if (ie.GenericWriterName === '') {
            Name = "Google Search";
        } else {
            Name = ie.GenericWriterName;
        }

        re.Google_key = "AIzaSyAOoXTVgplTqj7rYjT4MRBcMAzbD4lKpxY";
        
        if (ie.Url===""){
            if (ie.Keyword.match(/^http/)){
                URL = 'https://images.google.com/searchbyimage?image_url=' + ie.Keyword;
			} else {
				URL = 'https://www.google.com/search?q=' + encodeURIComponent(ie.Keyword);
			}
        } else {
            URL = ie.Url;
        }
           
       re.Keyword = URL.replace('/#q','/search?q');
       
       if (ie.DomainName) {
           
           re.Keyword = re.Keyword + '+site:' + ie.DomainName;
           re.Url = re.Keyword + '+site:' + ie.DomainName;
           
       } else {
            re.Url = URL;//+'&start=60';
       }
      
       var numtag = toHex(Name);
       // holds the topic ID
       re.Fake_Url = "gs_"+numtag.toString();
       executor.addEntity({Keyword:Name,Fake_Url:"gs_"+numtag.toString(),Google_key:re.Keyword,Url:"https://www.google.com/"});
    } catch (e) {
        executor.addEntity({Url:e.message});
    }
