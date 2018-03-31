var inp = '{"error":true,"data":"unauthorized"}';

var o = JSON.parse(inp);

console.log(o.error);