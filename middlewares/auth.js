const jwt = require("jsonwebtoken");
const JWT_SECRET= process.env.JWT_SECRET;
const auth = async (req,res,next) => {
try{
    const authHeader =req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
return res.status(401).json({ message: "Please sign in to continue." })
    }
    const token =authHeader.split(" ")[1];
    const decoded =jwt.verify(token,JWT_SECRET);

    req.user={
        id:decoded.id,
        email:decoded.email,
        role:decoded.role
    };

    next();
}
catch(err)
{
res.status(401).json({ message: "Session expired, please sign in again." })
}
};
module.exports = { auth };
