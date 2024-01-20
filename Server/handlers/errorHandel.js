function errorHandel(err, req, res, next) {
    console.log(err);
    let status = 500;
    let message = "internal server error";
    if (err.name === "SequelizeValidationError") {
        status = 400;
        message = err.errors[0].message;
    } else if (err.name === "SequelizeDatabaseError") {
        status = 500;
        message = err.message;
    } else if (err.name === "SequelizeUniqueConstraintError") {
        status = 400;
        message = err.errors[0].message;
    } else if (err.name === "JsonWebTokenError") {
        status = 401;
        message = err.message;
    } else if (
        err.name === "Register failed" ||
        err.name === "get chat failed" ||
        err.name === "Login failed" ||
        err.name === "post product failed" ||
        err.name === "get product failed" ||
        err.name === "post cart failed" ||
        err.name === "get cart failed"
    ) {
        status = err.status;
        message = err.message;
    }
    res.status(status).json({ message });
}
module.exports = errorHandel;
