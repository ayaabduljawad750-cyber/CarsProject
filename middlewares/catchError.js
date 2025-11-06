let catchError = (asyncFn) => {
  return  function(req,res,next){
    try {
      asyncFn(req,res,next)
    } catch (err) {
      next(err);
    }
  };
};

export default catchError;
