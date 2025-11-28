const mongoose = require("mongoose");
const cartschema=mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true,
        immutable: true
    },
    items:[
        {product:{type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true,
            
        },
        price: {
            type:Number,
            required:true,
            min:0
            },
        quantity:{
            type:Number,
            required:true,
            min:1
        }
    }],
    totalPrice:{
        type:Number,
        required:true,
        min:0,

    },
    
},
{ timestamps: true }
);


cartschema.pre("save", function(next) {
     this.totalPrice = this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    next();
});

const cartModel = mongoose.model("cart", cartschema);
module.exports = cartModel;