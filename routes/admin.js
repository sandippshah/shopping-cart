var express = require("express");
var router = express.Router();
var User = require("../models/users");
var cloudinary = require('cloudinary');
var upload = require('../handlers/multer');
var auth = require("../middlewares/auth")
var Product = require("../models/product")

// Show Admin Page With Product List
router.get("/", auth.isLoggedin, async (req, res, next) => {
  try {
    var product = await Product.find({})
    res.render("admin", {product: product, messages: req.flash('error') || req.flash('success')});    
  } catch (error) {
    next(error);
  }
});

// Delete Product
router.get('/product/:id/delete', auth.isLoggedin, (req, res, next) => {
  var id = req.params.id;
  Product.findByIdAndDelete(req.params.id, (err, product) => {
    if(err) return next(err);
    console.log('deleted');
    req.flash('success', "Product Deleted")
    res.redirect("/admin");
  })
});

// GET Product Edit
router.get('/product/:id/edit', auth.isLoggedin, (req, res, next) => {
  Product.findById(req.params.id, (err, product) => {
      if(err) return next(err);
      res.render("updateproduct", { product: product })
  });
});

// POST Edit Product
router.post('/product/:id/edit', auth.isLoggedin, upload.single('images'), async (req, res, next) => {
  try {
    if(!req.file === undefined) {
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      req.body.images = result.url;  
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { runValidators: true }, (err, product) => {
      req.flash('success', "Product Updated")
      return res.redirect("/admin");
    });    
  } catch (error) {
    next(error); 
  }
});

module.exports = router;