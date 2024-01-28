import { Schema } from "express-validator";

const createSchema: Schema = {
    fromStation: {
        isString: { options: [] },
        trim: { options: [] },
        isMongoId: { options: [] },
        optional: true
    },
    callsign: {
        isString: { options: [] },
        trim: { options: [] },
        isLength: { options: { min: 1, max: 10 } },
        toUpperCase: { options: [] },
        isAlphanumeric: { options: [] },
        errorMessage:
            "Callsign must be between 1 and 10 alphanumeric characters"
    },
    email: {
        isString: { options: [] },
        trim: { options: [] },
        isEmail: { options: [] },
        optional: true,
        errorMessage: "Email must be a valid email address"
    },
    event: {
        isString: { options: [] },
        trim: { options: [] },
        isMongoId: { options: [] },
        errorMessage: "Event must be a valid ObjectId"
    },
    frequency: {
        isNumeric: { options: [] },
        toFloat: { options: [] },
        isFloat: { options: [] },
        errorMessage: "Frequency must be a number"
    },
    mode: {
        isString: { options: [] },
        trim: { options: [] },
        toUpperCase: { options: [] },
        isAlphanumeric: { options: [] },
        isLength: { options: { min: 1, max: 10 } },
        errorMessage: "Mode must be between 1 and 10 alphanumeric characters"
    },
    qsoDate: {
        isString: { options: [] },
        trim: { options: [] },
        isISO8601: { options: [] },
        errorMessage: "QSO date must be a valid ISO 8601 date"
    },
    notes: {
        isString: { options: [] },
        trim: { options: [] },
        optional: true,
        errorMessage: "Notes must be a string"
    }
};
export default createSchema;