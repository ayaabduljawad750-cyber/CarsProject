import cartModel from "../models/cart.js";
import mongoose from "mongoose";

const getAllCart =async(req ,res)=>{
try{
if(req.user.role !=="admin"){
    return res.status(403).json({message:"admins only"})
};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const minPrice=parseFloat(req.query.min) || 0;
    const maxPrice=parseFloat(req.query.max) || Infinity;

    const filter ={};
    filter.totalPrice={$gte:minPrice,$lte:maxPrice}
    const total = await cartModel.countDocuments(filter);
    const carts = await cartModel
    .find(filter)
    .populate("userId", "name email")
    .populate("items.product", "name price")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
return res.status(200).json({
    message:"All carts",
    page,
    limit,
    total,
    data:carts
});
}
catch(err){
res.status(500).json({ message: "Error getting carts" });
}};


const createcart =async(req , res)=>{
    try{
        if(req.user.role !=="admin" && req.user.role !=="user"){
        return res.status(403).json({message:"admins only and users"})
        }
        const { items } =req.body;
        if(!items || items.length === 0){
            return res.status(400).json({message:"Cart items are required"});

        }
        const cart =await cartModel.create({userId:req.user.id,items});
        res.status(201).json({message:"Cart created",data:cart});


    }
    catch(err){
    res.status(500).json({ message: "Error creat cart" });
    }
};

const getCartByUserId =async(req , res)=>{
    try{
        if(req.user.role !== "admin" && req.user.id !== id){
            return res.status(403).json({message:"Access denied"});
        }
        const {id} =req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: "Invalid cart ID" });
        }
        const cart =await cartModel.findById(id);

        if(!cart){
        return res.status(404).json({message:"Cart not found"});
  }
  res.status(200).json({message:"Cart found",data:cart});

    }
    catch(err){
        res.status(500).json({ message: "Internal server error" });
    }
};
const getCartById =async(req ,res)=>{
    try{
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid cart ID"});
        }
        if(req.user.role !== "admin" && req.user.id !==id){
            return res.status(403).json({message:"Access denied"});
        }
        const cart=await cartModel.findById(id);
        if(!cart){
        return res.status(404).json({message:"Cart not found"});
        }
        res.status(200).json({message:"Cart found",data:cart})


    }catch(err){
        res.status(500).json({ message: "Internal server error" });
    }};




    const updateCartByUserId =async(req , res)=>{
    try{
        const updateCart = req.body;
        if (Object.keys(updateCart).length === 0) {
      return res.status(400).json({message: "Enter the updated information"});
    }
     const cart = await cartModel.findOne({ userId: req.user.id });
     if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
       if (updateCart.items) {
      cart.items = updateCart.items;
    }
    await cart.save();
         res.status(200).json({message:"Cart updated",data:cart});
  }
    catch(err){
        res.status(500).json({ message: "Internal server error" });
    }
};




    const updateCartById =async(req ,res)=>{
    try{
        const {id}=req.params;
        const updateCart = req.body;
        if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid cart ID"});
        }
         if (Object.keys(updateCart).length === 0) {
      return res.status(400).json({message: "Enter the updated information"});
    }
     const cart = await cartModel.findById(id);
     if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
        if(req.user.role !== "admin" && req.user.id !== cart.userId.toString()){
            return res.status(403).json({message:"Access denied"});
        }
        
       if (updateCart.items) {
      cart.items = updateCart.items;
    }
    await cart.save();
        res.status(200).json({message:"Cart updated",data:cart});

    }catch(err){
        res.status(500).json({ message: "Internal server error" });
    }};



const deleteByUserId=async(req , res)=>{
try{
     const cart = await cartModel.findOne({ userId: req.user.id });
     if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  await cart.remove();
 res.status(200).json({message:"Cart deleted"})
}
catch(err){
     res.status(500).json({ message: "Internal server error" });
}
};


const deleteById=async(req , res)=>{
try{ 
    const {id}=req.params;
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid cart ID"});
        }
       
     const cart = await cartModel.findById(id);
     if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
   if(req.user.role !=="admin"&& req.user.id !== cart.userId.toString()){
     return res.status(403).json({ message: "Access denied" });
   }
  await cart.remove();
 res.status(200).json({message:"Cart deleted"})
}
catch(err){
     res.status(500).json({ message: "Internal server error" });
}
};


export default {getAllCart,getCartById,getCartByUserId,updateCartById,updateCartByUserId,deleteById,deleteByUserId,createcart};

