class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }

    static badRequest(message) {
        return new ApiError(400, message);
    }

    static unauthorized(message) {
        return new ApiError(401, message);
    }

    static forbidden(message) {
        return new ApiError(403, message);
    }

    static notFound(message) {
        return new ApiError(404, message);
    }

    static internal(message) {
        return new ApiError(500, message);
    }
}

module.exports = function(err, req, res, next) {
    if (err instanceof ApiError) {
        res.status(err.status).json({message: err.message})
    }
    return res.status(500).json({message: 'unexpected error'})
}