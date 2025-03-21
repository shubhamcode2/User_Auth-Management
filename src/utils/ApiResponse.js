class ApiResponse {
    constructor(statusCode, data = null, message = null) {
        this.statusCode = statusCode;
        this.data = data;
        this.success = statusCode < 400;
        this.message = message || (this.success ? "Success" : "Error");
    }
}

export { ApiResponse };
