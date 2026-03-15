const fs = require('fs');
const text = fs.readFileSync('src/contexts/AuthContext.tsx','utf8');
const names = Array.from(text.matchAll(/name: \"([^\"]+)\"/g), m => m[1]);
const user = [
"Ayushi_das","Shivasheesh","Tanvi","Simar","Pari","Abhishek","Vikram","Hanshika","Arushi","Dipanita","Arya","Puja","Asad","Ayushman","Anusha","Anubhav","Raj_nandani","Hazique","Swarit","Alankrita","Shray","Krisha","Sarvagya","Anshika_suman","Lodh","Ananya","Pahal","Aditi","Navya","Ankita","Ishan","Roshan","Kawal","Atul","Kamali","Anay"
];
const missing = names.filter(n => !user.includes(n));
console.log('total guest profiles', names.length);
console.log('user list', user.length);
console.log('missing count', missing.length);
console.log(missing.join('\n'));
