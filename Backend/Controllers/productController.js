const Product =require("../Models/productModel.js"); 

const productController={

 createProduct : async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
},

 getAllProducts :async (req, res) => {
  try {
    const products = await Product.find()
    .populate("vendorId").populate("categoryId");

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

getApprovedProducts : async (req, res) => {
  try {
    const approvedProducts = await Product.find({ status: 'approved' })
    .populate("vendorId").populate("categoryId");

    res.status(200).json(approvedProducts)
  
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
},

 getProductById : async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    .populate("vendorId").populate("categoryId");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},
/* 
the easy way :
updateProduct : async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
},*/

//the hard way to make the product pending if vendor uptades 
 updateProduct : async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }


    // Apply the updates
    Object.assign(product, req.body);

    // If a vendor updated it → set status to pending again
    if (req.user.role === 'vendor') {
      product.status = 'pending';
    }

    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
},


deleteProduct :async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

}

module.exports=productController;