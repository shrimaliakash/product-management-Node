const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.product_image + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage })

const app = express();
const port = 3001;

const options = {
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '123456',
        database: 'akash_techtic'
    }
}

const knex = require('knex')(options);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/add_product', upload.single('product_image'), (req, res) => {
    if(req.body.product_name == '' || req.body.product_name == undefined) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Product Name'}));
    } else if(req.body.product_image == '' || req.body.product_image == undefined) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Product Image'}));
    } else if(req.body.product_description == '' || req.body.product_description == undefined) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Product Description'}));
    } else if(req.body.price == '' || req.body.price == undefined) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Price'}));
    } else if(req.body.category == '' || req.body.category == undefined) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Category'}));
    }
    if(req.body.product_name != '' && req.body.product_image != '' && req.body.product_description != '' 
        && req.body.price != '' && req.body.category) {
        const book =  [{
            product_name : req.body.product_name,
            product_image : req.body.product_image,
            product_description : req.body.product_description,
            price : req.body.price,
            category_id : req.body.category
        }];
        knex('product').insert(book)
            .then((result) => res.send(JSON.stringify({success: true, Inserted: result[0], message: 'Product Inserted.'})))
            .catch((err) => res.send(JSON.stringify({success: false, message: err})));

    } else {
        res.send(JSON.stringify({success: false, message: 'Product Not Inserted.'}));
    }
});

app.get('/get_product', (req, res) => {
    knex('product').select("*")
    .then((rows) => {
        if(rows != '') {
            res.send(JSON.stringify({success: true, message: 'Product Found.', data: rows}))
        } else {
            res.send(JSON.stringify({success: true, message: 'Product Not Found.'}))
        }
    })
    .catch((err) => { res.send(JSON.stringify({success: false, message: 'Product Not Found.'})) });
});

app.get('/get_product/:id', (req, res) => {
    const id = req.params.id;

    knex('product').select("*").where('id', id).first()
    .then((rows) => {
        if(rows != '') {
            res.send(JSON.stringify({success: true, message: 'Product Found.', data: rows}))
        } else {
            res.send(JSON.stringify({success: true, message: 'Product Not Found.'}))
        }
    })
    .catch((err) => { res.send(JSON.stringify({success: false, message: 'Product Not Found.'})) });
});

app.post('/update_product/:id', (req, res) => {
    const id = req.params.id;
    if(req.body != null) {
    	knex('product').select("*").where('id', id).first()
    	.then((rows) => {
    		if(rows != '') {
                const books =  {
                    product_name : req.body.product_name != '' ? req.body.product_name : rows.product_name,
                    product_image : req.body.product_image != '' ? req.body.product_image : rows.product_image,
                    product_description : req.body.product_description != '' ? req.body.product_description : rows.product_description,
                    price : req.body.price != '' ? req.body.price : rows.publish_date,
                    category_id : req.body.category_id != '' ? req.body.category_id : rows.category_id
                };
    			knex('product').where({ id: id }).update(books)
    		    .then((product) => res.send(JSON.stringify({success: true, message: 'Product Updated.'})))
    		    .catch((err) => res.send(JSON.stringify({success: false, message: err})));
    		} else {
    		    res.send(JSON.stringify({success: true, message: 'Product Not Found.'}))
    		}
    	})
    	.catch((err) => { res.send(JSON.stringify({success: false, message: 'Product Not Found.'})) });
    } else {
        res.send(JSON.stringify({success: false, message: 'Product Not Updated.'}));
    }
});

app.delete('/delete_product/:id', (req, res) => {
    const id = req.params.id;
    knex('product').where({ id: id }).del()
        .then((product) => res.send(JSON.stringify({success: true, message: 'Product Deleted.'})))
        .catch((err) => res.send(JSON.stringify({success: false, message: err})));
});

app.get('/search_product/:name', (req, res) => {
    const name = req.params.name;
    if(req.body != null) {
        knex('product').select("*").where('product_name', name).first()
        .then((rows) => {
            if(rows != null) {
                res.send(JSON.stringify({success: true, message: 'Product Found.', data: rows}))
            } else {
                res.send(JSON.stringify({success: true, message: 'Product Not Found.'}))
            }
        })
        .catch((err) => res.send(JSON.stringify({success: false, message: 'Product Not Found.'})));
    } else {
        res.send(JSON.stringify({success: false, message: 'Product Not Updated.'}));
    }
});

app.listen(port, () => console.log(`Product listing app listening on port ${port}!`));
