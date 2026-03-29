"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleClientError = (error) => {
    var _a;
    let errors = [];
    let message = "";
    const statusCode = 400;
    switch (error.code) {
        case "P2025":
            message = ((_a = error.meta) === null || _a === void 0 ? void 0 : _a.cause) || "Record not found!";
            errors = [
                {
                    path: "",
                    message,
                },
            ];
            break;
        case "P2003":
            if (error.message.includes("delete()` invocation:")) {
                message = "Delete failed";
            }
            else {
                message = "Foreign key constraint failed";
            }
            errors = [
                {
                    path: "",
                    message,
                },
            ];
            break;
        case "P2000":
            message = "Invalid value for the field!";
            errors = [
                {
                    path: "",
                    message,
                },
            ];
            break;
        case "P2001":
            message = "Record not found!";
            errors = [
                {
                    path: "",
                    message,
                },
            ];
            break;
        case "P2002":
            message = "Unique constraint failed on the field";
            errors = [
                {
                    path: "",
                    message,
                },
            ];
            break;
        case "P2014":
            message = "The provided value for the enum is invalid";
            errors = [
                {
                    path: "",
                    message,
                },
            ];
            break;
        case "P2026":
            message = "There are related records that prevent this operation";
            errors = [
                {
                    path: "",
                    message,
                },
            ];
            break;
        case "P2027":
            message = "The operation would result in a loss of data";
            errors = [
                {
                    path: "",
                    message,
                },
            ];
            break;
        case "P2030":
            message = "There was an issue updating the record";
            errors = [
                {
                    path: "",
                    message,
                },
            ];
            break;
        default:
            message = "An unknown error occurred";
            errors = [
                {
                    path: "",
                    message: "An unexpected error occurred",
                },
            ];
            break;
    }
    return {
        statusCode,
        message,
        errorMessages: errors,
    };
};
exports.default = handleClientError;
//"//\nInvalid `prisma.semesterRegistration.delete()` invocation:\n\n\nAn operation failed because it depends on one or more records that were required but not found. Record to delete does not exist.",
