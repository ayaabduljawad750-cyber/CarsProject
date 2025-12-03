import userModel from"../models/user";
import productModel from"../models/Products";
import mongoose from "mongoose";

const CreateNewProduct =async(req , res)=>{
    if(req.user.role !=="admin"&& req.user.role !== "seller"){
    return res.status(403).json({message:"admins and sallers only"})
    }
    const newProduct=req.body;
    if (!newProduct) {
    res.status(401).json("plz enter the product");
    } else {
    
    const product = await productModel.create({
    ...newProduct,
    seller: req.user.id,
    });
    res.status(200).json({ message: "new product created", data: product });
    }
};

const updateProduct = async(req,res)=>{

    try {
    const id = req.params.id;
    const updateProduct = req.body;

    if (!updateProduct || Object.keys(updateProduct).length===0) {
    return res.status(400).json({message: "Please enter the updated information"});
    }
    const product = await productModel.findById(id); 
    if (!product) {
    return res.status(404).json({ message: "product not found" });
    }
    if (req.user.role === "seller"){
        if(product.seller.toString() !== req.user.id){
            return res.status(403).json({ message: "You cannot update this product" });
        }}

 else if(req.user.role !=="admin"){
     return res.status(403).json({ message: "You cannot update products" });
 }
  Object.assign(product,updateProduct);
  await product.save();

  res.status(200).json({ message: "Product updated", data: product });
    }
  catch (err) {
    res.status(500).json({ message: "Error when updating product." });
  }
  
  };

    const deleteProduct =async(req,res) => {
    try{
    const id = req.params.id;

    const product = await productModel.findById(id); 
    if (!product) {
    return res.status(404).json({ message: "product not found" });
    };
    if (req.user.role === "seller"){
        if(product.seller.toString() !== req.user.id){
            return res.status(403).json({ message: "You cannot Delete this product" });
        }}
    else if(req.user.role !=="admin"){
    return res.status(403).json({ message: "You cannot Deleted products" });
    }
    await productModel.deleteOne({ _id: id });
    return res.status(200).json({ message: "Product deleted successfully" });


    }
    catch(err){
    res.status(500).json({ message: "Error when Deleting product." });
}};

const getAllProducts=async(req,res)=>{
    try{
    if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: admin only" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter= {};
    if (req.query.category) filter.category = req.query.category;


    const sort={};
    if(req.query.sortBy) sort[req.query.sortBy] = req.query.order === "desc" ? -1 : 1;

    const products = await productModel.find(filter).skip(skip).limit(limit).sort(sort);
    
    const total = await productModel.countDocuments(filter);

    return res.status(200).json({
        message:"All products",
        page,
        limit,
        total,
        data:products,
    });
    }catch(err){
    res.status(500).json({ message: "Error getting products" });
    }};


    const getProductById=async (req,res)=>{
try{
    const {id}=req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid product ID"});
    }
    const product=await productModel.findById(id);
    if(!product){
        return res.status(404).json({message:"product not found"});
    }
    res.status(200).json({message:"product found",data:product})

    }catch(err){
    res.status(500).json({ message: "Error while retrieving product" });
}};


    const getFilteredProducts =async(req,res)=>{
        try{
            const{name,
                brand,
                carModel,
                minPrice,maxPrice,
                description,
                }=req.query;

                const filter={};

                if(name) filter.name={ $regex: name, $options: "i" }
                if(brand) filter.brand={$regex: brand, $options: "i"}
                if(carModel) filter.carModel={$regex: carModel, $options: "i"}
                if(description) filter.description={$regex: description, $options: "i"}
                if(minPrice || maxPrice) {
                    filter.price ={};
                    if(minPrice) filter.price.$gte =Number(minPrice);
                    if(maxPrice) filter.price.$lte =Number(maxPrice);
                }
                const products =await productModel.find(filter);
                res.status(200).json(products);
        }catch(err){
                res.status(500).json({ message: "Error while retrieving products" });
        }
    };


    export default{
    CreateNewProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    getFilteredProducts};




