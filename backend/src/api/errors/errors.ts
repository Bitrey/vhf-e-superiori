/**
 * @swagger
 *  components:
 *    schemas:
 *      ResErr:
 *        type: object
 *        required:
 *          - err
 *        properties:
 *          err:
 *            type: string
 *            description: Error message
 */

export enum Errors {
    USER_NOT_FOUND = "USER_NOT_FOUND",
    INVALID_PW = "INVALID_PW",
    DOC_NOT_FOUND = "DOC_NOT_FOUND",
    SERVER_ERROR = "SERVER_ERROR",
    LOGIN_TOKEN_EXPIRED = "LOGIN_TOKEN_EXPIRED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    MISSING_ENV = "MISSING_ENV",
    ALREADY_REGISTERED = "ALREADY_REGISTERED",
    QRZ_NO_KEY = "QRZ_NO_KEY",
    QRZ_OM_NOT_FOUND = "QRZ_OM_NOT_FOUND",
    QTH_NOT_FOUND = "QTH_NOT_FOUND",
    INVALID_OBJECT_ID = "INVALID_OBJECT_ID",
    INVALID_LOGIN = "INVALID_LOGIN",
    NOT_LOGGED_IN = "NOT_LOGGED_IN",
    MALFORMED_REQUEST_BODY = "MALFORMED_REQUEST_BODY",
    NOT_AN_ADMIN = "NOT_AN_ADMIN",
    EVENT_NOT_FOUND = "EVENT_NOT_FOUND",
    EVENT_JOIN_ALREADY_REQUESTED = "EVENT_JOIN_ALREADY_REQUESTED",
    EVENT_JOIN_TIME_EXPIRED = "EVENT_JOIN_TIME_EXPIRED",
    EVENT_JOIN_TIME_TOO_EARLY = "EVENT_JOIN_TIME_TOO_EARLY",
    JOIN_REQUEST_NOT_FOUND = "JOIN_REQUEST_NOT_FOUND",
    URL_NOT_FOUND = "URL_NOT_FOUND",
    INVALID_EMAIL = "INVALID_EMAIL",
    EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE",
    INVALID_PHONE_NUMBER = "INVALID_PHONE_NUMBER",
    PHONE_NUMBER_ALREADY_IN_USE = "PHONE_NUMBER_ALREADY_IN_USE",
    MUST_ACCEPT_SIGNUP_TOS = "MUST_ACCEPT_SIGNUP_TOS",
    MUST_ACCEPT_EVENT_TOS = "MUST_ACCEPT_EVENT_TOS",
    CAPTCHA_FAILED = "CAPTCHA_FAILED",
    WEAK_PW = "WEAK_PW",
    USER_NOT_VERIFIED = "USER_NOT_VERIFIED",
    USER_ALREADY_VERIFIED = "USER_ALREADY_VERIFIED",
    VERIFICATION_CODE_NOT_FOUND = "VERIFICATION_CODE_NOT_FOUND",
    INVALID_VERIFICATION_CODE = "INVALID_VERIFICATION_CODE",
    INVALID_PW_RESET_CODE = "INVALID_PW_RESET_CODE",
    INVALID_PICS_NUM = "INVALID_PICS_NUM",
    INVALID_VIDS_NUM = "INVALID_VIDS_NUM",
    INVALID_FREQUENCY_BAND = "INVALID_FREQUENCY_BAND",
    INVALID_FILE_MIME_TYPE = "INVALID_FILE_MIME_TYPE",
    FILE_SIZE_TOO_LARGE = "FILE_SIZE_TOO_LARGE",
    FILE_NOT_FOUND = "FILE_NOT_FOUND",
    INVALID_POST = "INVALID_POST"
}
