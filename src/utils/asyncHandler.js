//With Promisses
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch
    ((error) => next(error));
  };
};

export { asyncHandler };


//With Try Catch
/*
const ayncHandler = (fun) => async (req,res,next) => {
    try {
        await fun(req,res.next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}*/ 