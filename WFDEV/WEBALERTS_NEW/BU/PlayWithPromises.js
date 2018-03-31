
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest;

//const url1 = "https://stackoverflow.com/questions/7683596/xmlhttprequest-for-local-files";
const url2 = "https://webalert.verint.com/api/v1/queries/live/list";

function loadPage(url){
    return new Promise( (resolve, reject) => {
        //xhr.open('GET', url1);
        xhr.open("GET", url2, true, "Moran.livkind@verint.com ", "Webalert1!");
        xhr.send();
    
        xhr.addEventListener('load', () => {
            //console.log(xhr.responseText);
            resolve(xhr.responseText);
        })
    
        xhr.addEventListener('error', () => {
            //console.log('ERROR:' + xhr.statusText);
            reject(xhr.statusText);
        });
    }
    )
    
}

loadPage(url2)
    .then((ans) => {
            console.log(ans);
            return('BBBBBBBBBBBBBBBBB');
    })
    .then((ans => {
        console.log(ans + ' UUURRRRAAAAAA!!!!    ' );
    }))
    //.then(loadPage(url2))
    .catch((err) => {
        console.log('КАТАСТРОФА! ' + err.message);
    });

