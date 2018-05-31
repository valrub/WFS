var inp = "The Hidden Wiki [community] [report: abuse clone cp bestof] http://zqktlwi4fecvo6ri.onion/wiki/Main_Page Official site of The Hidden Wiki Last Response: Wed, 30 May 2018 19:17:00 +0000, Ping (sec): 10.93 Credit Cards - Credit Cards, from the most Trusted Vendor in the union.Fast shipping. AmazingCC - Skimmed Credit Cards for sale. Cheap. Also sell DUMPs. ...Free shipping...Berich Cards - High balance...";

var s = inp.indexOf('L1ast Response: ');

console.log(s);

var e = inp.indexOf(', Ping (sec)');
console.log(inp.substring(s+15,e-6));