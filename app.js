const express = require('express');
const path = require('path');
const faker = require('faker');
const superb = require('superb');

// Init App
const app = module.exports = express();

app.use(express.json());

var products = [];
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
for (i = 1; i <= 50; i++) {
    const id = i;
    const title = `${capitalizeFirstLetter(superb.random())} ${faker.commerce.product()}`; // Product
    const price = faker.commerce.price(); // 458.00
    const color = faker.commerce.color(); // Cyan
    let product = { id, title, price, color }
    products.push(product);
}

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Get all products
app.get('/products', function (req, res) {
    res.json(products);
});
// Search by product title
app.get('/products/:title', function (req, res) {
    let title = req.params.title;
    let regex = new RegExp(title, "ig");
    let results = products.filter(p => regex.test(p.title));
    res.json(results);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server started on port 3000...');
});
