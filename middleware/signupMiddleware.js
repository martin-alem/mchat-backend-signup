/**
 * @author Martin Alemajoh
 * @description Holds all the middleware functions  for signup
 */

const path = require("path");
const Validate = require(path.join(__dirname, "../validations/ValidateCredentials"));
const SendSMS = require(path.join(__dirname, "../services/SendSMS"));
const Query = require(path.join(__dirname, "../model/Query"));
const Helper = require(path.join(__dirname, "../utils/Helper"));
const Logger = require(path.join(__dirname, "../utils/Logger"));

const middleware = new Map();

function validatePayLoad(req, res, next) {
    const payload = req.body;
    if (Object.keys(payload).length === 0 || !payload.phone) {
        const statusCode = 400;
        const error = "Please provide a phone number";
        next({ error, statusCode });
        return;
    }
    next();
}

function validate(req, res, next) {

    const phone = req.body.phone;
    if (!Validate.isValidPhone(phone)) {
        const statusCode = 400;
        const error = "Invalid phone number";
        next({ error, statusCode });
        return;
    }
    next();

}

async function alreadyExists(req, res, next) {

    const phone = req.body.phone;
    try {
        const selectResult = await Query.selectOne("temp_users", "phone", phone);
        if (selectResult.length > 0) {
            const statusCode = 400;
            const error = "Phone number already exists";
            next({ error, statusCode });
            return;
        }
        next();
    } catch (err) {
        const statusCode = 500;
        const error = "Internal server error";
        next({ error, statusCode });
        Logger.logWarning(err, __filename, new Date());
        return;
    }
}

async function sendVerificationCode(req, res, next) {

    const phone = req.body.phone;
    const code = Helper.getCode(6);
    req.body.code = code;
    const message = `Your mchat verification code: ${code}. Valid for 5minutes`;
    try {
        const result = await SendSMS.send(phone, message);
        if (result.errorCode && result.status === "failure") {
            const statusCode = 400;
            const error = "Invalid Phone number. Please try using another phone number.";
            next({ error, statusCode });
            return;
        }
        next();
    } catch (err) {
        const statusCode = 500;
        const error = "Internal server error";
        next({ error, statusCode });
        Logger.logWarning(err, __filename, new Date());
        return;
    }
}

middleware.set("validatePayload", validatePayLoad);
middleware.set("validate", validate);
middleware.set("alreadyExists", alreadyExists);
middleware.set("sendVerificationCode", sendVerificationCode);

module.exports = middleware;