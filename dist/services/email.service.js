"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendMagicLinkEmail = sendMagicLinkEmail;
exports.sendOTPEmail = sendOTPEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config/config"));
// Create a transporter object using Zoho SMTP settings
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.email.host,
    port: config_1.default.email.port,
    secure: config_1.default.email.secure, // true for 465, false for other ports
    auth: {
        user: config_1.default.email.user,
        pass: config_1.default.email.pass
    }
});
/**
 * Render an EJS template from the templates folder.
 * @param templateName - Template filename (e.g., 'magicLink.ejs')
 * @param data - Data to be passed to the template
 * @returns Rendered HTML string
 */
function renderTemplate(templateName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const templatePath = path_1.default.join(__dirname, '..', 'templates', templateName);
        return ejs_1.default.renderFile(templatePath, data);
    });
}
/**
 * Send an email using Nodemailer.
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param htmlBody - HTML email body
 */
function sendEmail(to, subject, htmlBody) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const mailOptions = {
                from: `"NxtGenAiDev" <${config_1.default.email.user}>`,
                to,
                subject,
                html: htmlBody
            };
            const info = yield transporter.sendMail(mailOptions);
            console.log(`Email sent to ${to}: ${info.messageId}`);
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    });
}
/**
 * Send a magic link email.
 * @param email - Recipient's email address
 * @param link - Magic link URL
 */
function sendMagicLinkEmail(email, link) {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlBody = yield renderTemplate('magicLink.ejs', {
            link,
            year: new Date().getFullYear()
        });
        const subject = 'Your Verification Link - Complete Your Registration';
        yield sendEmail(email, subject, htmlBody);
    });
}
/**
 * Send an OTP email.
 * @param email - Recipient's email address
 * @param otp - One-time password code
 */
function sendOTPEmail(email, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlBody = yield renderTemplate('otp.ejs', {
            otp,
            year: new Date().getFullYear()
        });
        const subject = 'Your One-Time Password (OTP)';
        yield sendEmail(email, subject, htmlBody);
    });
}
