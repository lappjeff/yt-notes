const response = await fetch("http://backend:3000");
const name = await response.text();

console.log("Hello", name);
