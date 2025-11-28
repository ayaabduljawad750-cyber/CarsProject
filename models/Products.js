const mongoose =require("mongoose");
const productSchema= mongoose.Schema({
    name:{
        type:String,
        required:[true,"Product name is required."],
        trim:true,
        minlength: [3, "Product name must be at least 3 characters"],
        maxlength: [100, "Product name cannot exceed 100 characters"],
        index:true
    },
    brand:{
        type:String,
        required:[true,"Brand name is required."],
        trim:true,
        minlength: 1,
        maxlength: [50, "Product name cannot exceed 50 characters"],
        index:true,
        uppercase:true

    },
    carModel:{
        type:String,
        required:[true,"Car model is required."],
        trim:true,
        minlength: 1,
        maxlength: [50, "Product name cannot exceed 50 characters"],
        index:true
    },
    price:{
        type:Number,
        required:[true,"Price is required."],
        trim:true,
        min: [0, "Price cannot be less than 0"]
    },
    stock:{
        type:Number,
        required: [true, "Stock quantity is required"],
        min: [0, "Stock cannot be less than 0"],
        default: 0,
        validate: {
    validator: Number.isInteger,
    message: "Stock must be an integer value"
},
set: value => Number(value)


    },
    description:{
        type:String,
        required: [true, "Product description is required"],
        minlength: [5, "Description must be at least 5 characters"],
        maxlength: [1000, "Description cannot exceed 1000 characters"],
validate:{
    validator:v=>!/(.)\1{4,}/.test(v),
    message:"Description contains too many repeated characters"
},
trim:true,
set:v=>v.trim().replace(/\s+/g, " ")

    },
    category:{
        type:String,
        required:[true,"Product category is required."],
        trim:true,
        uppercase:true,
        enum:[
            "Inner And Outer Spare Parts","Spare Parts", "Engine Oil & Fluids", "Maintenance Services","Tires & Rims & Batteries","Accessories"
        ],
        index:true
     
      
    },
       subcategory:{
            type:String,
            required:true,
            index:true

        },
        subsubcategory:{
            type:String,
        },

        evaluation:{
            type:Number,
            min:0,
            max:5
        },

        image: {
            type:String,
            required:[true,"Product image is required."],
            trim:true,
            validate:{
                validator:function(v){
                    return /\.(jpg|jpeg|png|webp|gif)$/i.test(v);
                },
                message: props => `${props.value} is not a valid image URL!`

            }
        },
        seller: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
            },

            


        
},{ timestamps: true });
  const subcategory={
            "Inner And Outer Spare Parts":["Exhaust Parts","headlights","Bumper Parts","Wipers Blades Parts","Wires & Bolts"],
            "Spare Parts":["Gaskets","oil seal","Engine Spare parts","CV Joint","Brakes","Transmission Gearbox","Engine Cooling & A/C Parts","pulley","Sensors","Spare parts for internal combustion engines","Battery And Electricity","Suspension System","Belts","Filters"],
            "Engine Oil & Fluids":["Greases","Cleaning & Protection Products","Engine Oil Offers","Rust Remover Products","Tire cleaners","Car Body Cleaning Products","Dashboard Cleaners","Coolant Water","Engine Oil","Transmission Oil","Brake Oil"],
            "Maintenance Services":["Offers"],
            "Tires & Rims & Batteries":["Batteries","Wheel Cover","Tires"],
            "Accessories":["Luxuries","Cables","Air Freshener","Full Rear And Front Sunscreen Set","Car Cover","Tools & Equipment","Floor MAT Pedal SET","Control Units","Car Audio Speakers","Screen","Car Dashboard Pad","Seat Belt Skates","Accessories Offers","Car Care","Equalizer","Amplifier","Car Cassette","Car Seat Back Organizer","Transmission Box Stick Cap","Seat Armrest Console","MP3","Car Phone Holder","Mobile Phone Chargers","Steering Wheel Cover"]

        };
        const subsubcategory={
            "Exhaust Parts":["Exhaust"],
            "headlights":["Front Headlight","Lamp"],
            "Bumper Parts":["Bumper Holder","Bumper","Bumper Reinforcement"],
            "Wipers Blades Parts":["Washer water tank"],
            "Wires & Bolts":["Nut-Road Wheel"],

            "Gaskets":["Cylinder Head Cover Gasket","Engine Cover Gasket"],
            "oil seal":["Camshaft Oil Seal"],
            "Engine Spare parts":["Engine cable","Engine Mount","Cooling Water Pump","Engine Oil Pump","Steering Fluid Pump","Chain drive","Engine Belt Tensioner","Accelerator Wire","Oil Gauge"],
            "CV Joint":["Inner CV Joint","Outer CV Joint","CV Joint Boot"],
            "Brakes":["Brake Wire Cable","Brake Disc","Wheel HUB Bearing","Brake Pad"],
            "Transmission Gearbox":["Slave Clutch Master","Transmission Mount","Clutch","Transmission Gearbox Tensioner","Clutch Cable","Clutch Disc Assembly"],
            "Engine Cooling & A/C Parts":["A/C Blower","Radiator Cap","A/C Condenser Assy","Radiator","Thermostat","Radiator Fan"],
            "pulley":["Timing Belt Tensioner Bearing","Alternator Belt Tensioner Bearing","Clutch Bearing","Wheel Bearing","Alternator Belt Pulley Tensioner","A/C Compressor Clutch bearing","Tensioner Belt Bearing"],
            "Sensors":["Turbo sensor","Colant sensor","Crankshaft Sensor","Exhaust Sensor","Idel Sensor","Temperature Sensor"],
            "Spare parts for internal combustion engines":["Diesel pump","diesel feed pumb","Fuel Gate","Igntion Coil","Spark Plug Wire","Fuel Pump ASSY","Fuel Pump","Spark Plug"],
            "Battery And Electricity":["Thermostat Valve","Car Alternator","Contact Switch","Horn"],
            "Suspension System":["Shock Absorber Coil Spring Mounting","Universal joint","Arm","Shock Absorber","Stabilizer Link Bush Rubber","Shock Absorber Boot","Steering Gear Box","Control Arm","Control Arm Bush","Stabilizer Link","Control Arm Ball Joint","Shock Absorber Mount","Steering Wheel Tie Rod","Suspension Beam Bush Rubber"],
            "Belts":["Belt Tensioner","Outer Belt","Steering Pump Belt","A/C Tensioner Pulley","Outer Belt Tensioner","A/C Compressor Belt","Alternator Belt","Timing Belt","Engine Belt","Engine Outer Belts"],
            "Filters":["Oil Filter Element","Engine Oil Filter","A/C Filter","Fuel Filter","Transmission Oil Filter","Air Filter"]


        };




productSchema.pre("save", function(next) {
    if (!subcategory[this.category].includes(this.subcategory)) {
        return next(new Error(`Invalid subcategory for category ${this.category}`));
    }

    if (subsubcategory[this.subcategory] && !subsubcategory[this.subcategory].includes(this.subsubcategory)) {
        return next(new Error(`Invalid subsubcategory for subcategory ${this.subcategory}`));
    }

    next();
});

const productModel = mongoose.model("products", productSchema);
module.exports = productModel;