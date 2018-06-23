var inp = '30.06.18';
const ddd = formatInputDate(inp);
console.log(convertDateToGoogle(ddd));

function formatInputDate(inp) {
const d = inp.split('.');
d[2] = '20' + d[2];
let temp = d[0];
d[0] = d[1];
d[1] = temp;
return new Date(d.join(' '));
}

function convertDateToGoogle(date) {
return `${date.getDate()}/${zeroPrefixedMonth(date)}/${date.getFullYear()}`;
}

function zeroPrefixedMonth(date) {
let month = date.getMonth() + 1;
if (month < 10) {
month = '0' + month;
}
return month;
} 
