const express = require('express');
const path = require('path');
const faker = require('faker');
const superb = require('superb');
const { default: axios } = require('axios');

// Init App
const app = module.exports = express();

app.use(express.json());

var cacheSearchResults = [];

function scrapWebForImg(param) {
    return new Promise((resolve, reject) => {
        axios.get("https://www.google.com/search?q=" + param)
            .then(function (response) {
                let result = response.data;
                let start = result.indexOf("imgurl=", 0);
                if (start < 0) return;
                let end = result.indexOf("&", start + 1);
                let imgurl = result.substring(start + 7, end);
                resolve(imgurl);
            }, function (err) {
                reject(err);
            })
    });
}

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Get all products
app.get('/products', function (req, res) {
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    var products = [];
    var promises = [];
    for (i = 1; i <= 7; i++) {
        const id = i;
        const title = `${capitalizeFirstLetter(superb.random())} ${faker.commerce.product()}`; // Product
        const price = faker.commerce.price(); // 458.00
        const color = faker.commerce.color(); // Cyan
        let product = { id, title, price, color, imgurl: "" };
        products.push(product);
        promises.push(scrapWebForImg(title));
    }
    Promise.all(promises).then(function(values) {
        console.log(values);
        products = products.map((item, index) => ({...item, imgurl: values[index]}));
        cacheSearchResults = products.map(item => item);
        res.json(products);
    });
});
// Search by product title
app.get('/search', function (req, res) {
    let title = req.query.q;
    if (!title || title == "") return res.json(cacheSearchResults);
    let regex = new RegExp(title, "ig");
    let results = cacheSearchResults.filter(p => regex.test(p.title));
    res.json(results || []);
});
// app.get("/search", function (req, res) {
//     console.log(req.query.q);
//     let param = req.query.q;
//     axios.get("https://www.google.com/search", {
//         params: {
//             q: "bacon top"
//         }
//     })
//         .then(function (response) {
//             let result = response.data;
//             let start = result.indexOf("imgurl=", 0);
//             if (start < 0) return;
//             let end = result.indexOf("&", start + 1);
//             let imgurl = result.substring(start + 7, end);
//             console.log(imgurl);
//             res.send('imgurl');
//         });
// })

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server started on port 3000...');
});
