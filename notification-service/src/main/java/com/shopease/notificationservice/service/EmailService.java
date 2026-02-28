package com.shopease.notificationservice.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.DecimalFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private static final String FROM_EMAIL = "shopeasemicroservices@gmail.com";
    private static final DecimalFormat DF = new DecimalFormat("#,##0.00");

    public void sendOrderConfirmation(String email, String name, String orderNumber, BigDecimal totalAmount,
            String shippingAddress) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String safeOrderNumber = orderNumber != null ? orderNumber : "Unknown";
            String subject = "Order Confirmation: " + safeOrderNumber;
            String amountFormatted = totalAmount != null ? DF.format(totalAmount) : "0.00";
            String safeAddress = shippingAddress != null ? shippingAddress.replace("\n", "<br>") : "Not provided";
            String safeName = name != null ? name : "Valued Customer";

            String htmlContent = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333; }
                            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                            .header { background-color: #4f46e5; color: #ffffff; padding: 30px 40px; text-align: center; }
                            .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
                            .content { padding: 40px; }
                            .greeting { font-size: 18px; margin-bottom: 20px; color: #1f2937; }
                            .order-details { background-color: #f9fafb; border-radius: 6px; padding: 25px; margin: 25px 0; border: 1px solid #e5e7eb; }
                            .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
                            .detail-row:last-child { margin-bottom: 0; padding-top: 12px; border-top: 1px solid #e5e7eb; font-weight: 600; font-size: 16px; color: #111827; }
                            .label { color: #6b7280; }
                            .value { color: #111827; text-align: right; }
                            .shippingbox { margin-top: 25px; padding-top: 25px; border-top: 1px solid #e5e7eb; }
                            .shippingbox h3 { font-size: 15px; color: #4b5563; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
                            .shippingbox p { margin: 0; color: #111827; line-height: 1.5; font-size: 15px; }
                            .message { line-height: 1.6; margin-bottom: 30px; font-size: 15px; color: #4b5563; }
                            .footer { background-color: #f9fafb; padding: 20px 40px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>ShopEase</h1>
                            </div>
                            <div class="content">
                                <div class="greeting">Hello %s,</div>
                                <div class="message">
                                    Thank you for shopping with us! We have received your order and we're getting it ready to be shipped.
                                </div>

                                <div class="order-details">
                                    <div class="detail-row">
                                        <span class="label">Order Number</span>
                                        <span class="value">%s</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Status</span>
                                        <span class="value" style="color: #059669; font-weight: 500;">Confirmed</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Total Amount</span>
                                        <span class="value">₹%s</span>
                                    </div>

                                    <div class="shippingbox">
                                        <h3>Shipping Address</h3>
                                        <p>%s</p>
                                    </div>
                                </div>

                                <div class="message">
                                    We'll send you another email when your order has shipped.<br>If you have any questions, reply to this email or contact our support team.
                                </div>
                            </div>
                            <div class="footer">
                                &copy; 2026 ShopEase inc. All rights reserved.<br>
                                This is an automated message, please do not reply.
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(safeName, safeOrderNumber, amountFormatted, safeAddress);

            helper.setFrom(FROM_EMAIL);
            if (email == null || email.isBlank()) {
                log.warn("Skipping email send: recipient email is null or blank");
                return;
            }
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [HTML Confirmation] -> {}", email);
        } catch (Exception e) {
            log.warn("Failed to send HTML order confirmation email for order {}. Cause: {}", orderNumber,
                    e.getMessage());
        }
    }

    public void sendOrderCancellation(String email, String name, String orderNumber) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String safeOrderNumber = orderNumber != null ? orderNumber : "Unknown";
            String subject = "Order Cancellation: " + safeOrderNumber;
            String safeName = name != null ? name : "Valued Customer";

            String htmlContent = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333; }
                            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                            .header { background-color: #dc2626; color: #ffffff; padding: 30px 40px; text-align: center; }
                            .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
                            .content { padding: 40px; }
                            .greeting { font-size: 18px; margin-bottom: 20px; color: #1f2937; }
                            .message { line-height: 1.6; margin-bottom: 20px; font-size: 15px; color: #4b5563; }
                            .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px 20px; margin: 25px 0; color: #991b1b; }
                            .order-id { font-weight: 600; color: #111827; }
                            .footer { background-color: #f9fafb; padding: 20px 40px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>ShopEase</h1>
                            </div>
                            <div class="content">
                                <div class="greeting">Hello %s,</div>

                                <div class="alert-box">
                                    Your order <span class="order-id">%s</span> has been successfully cancelled.
                                </div>

                                <div class="message">
                                    As requested, we have cancelled your recent order. If you have already been charged for this purchase, a full refund has been initiated and will appear on your original payment method within 3-5 business days.
                                </div>

                                <div class="message">
                                    We hope to see you again soon.<br>If this cancellation was a mistake or if you need assistance, please contact our support team.
                                </div>
                            </div>
                            <div class="footer">
                                &copy; 2026 ShopEase inc. All rights reserved.<br>
                                This is an automated message, please do not reply.
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(safeName, safeOrderNumber);

            helper.setFrom(FROM_EMAIL);
            if (email == null || email.isBlank()) {
                log.warn("Skipping cancellation email: recipient email is null or blank");
                return;
            }
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [HTML Cancellation] -> {}", email);
        } catch (Exception e) {
            log.warn("Failed to send HTML order cancellation email for order {}. Cause: {}", orderNumber,
                    e.getMessage());
        }
    }

    public void sendWelcomeEmail(String email, String firstName) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String subject = "Welcome to ShopEase!";

            String htmlContent = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333; }
                            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
                            .header { background: linear-gradient(135deg, #4f46e5 0%%, #7c3aed 100%%); color: #ffffff; padding: 40px; text-align: center; }
                            .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px; }
                            .content { padding: 40px; }
                            .greeting { font-size: 22px; font-weight: 700; margin-bottom: 20px; color: #1f2937; }
                            .message { line-height: 1.6; margin-bottom: 25px; font-size: 16px; color: #4b5563; }
                            .features { background-color: #f9fafb; border-radius: 8px; padding: 25px; margin: 30px 0; border: 1px solid #e5e7eb; }
                            .feature-row { display: flex; align-items: flex-start; margin-bottom: 15px; }
                            .feature-icon { color: #4f46e5; margin-right: 12px; font-size: 18px; }
                            .feature-text { font-size: 14px; color: #6b7280; }
                            .btn-container { text-align: center; margin-top: 35px; }
                            .btn { display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; }
                            .footer { background-color: #f9fafb; padding: 25px 40px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e5e7eb; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>ShopEase</h1>
                            </div>
                            <div class="content">
                                <div class="greeting">Welcome to the family, %s!</div>
                                <div class="message">
                                    We're thrilled to have you on board! ShopEase is more than just a marketplace; it's a showcase of modern microservices architecture and seamless user experiences.
                                </div>

                                <div class="features">
                                    <div class="feature-row">
                                        <div class="feature-icon">✓</div>
                                        <div class="feature-text"><strong>Priority Access:</strong> Be the first to know about new product drops and flash sales.</div>
                                    </div>
                                    <div class="feature-row">
                                        <div class="feature-icon">✓</div>
                                        <div class="feature-text"><strong>Real-time Tracking:</strong> Event-driven architecture ensures you always know where your order is.</div>
                                    </div>
                                    <div class="feature-row">
                                        <div class="feature-icon">✓</div>
                                        <div class="feature-text"><strong>Premium Security:</strong> Enterprise-grade OAuth2 and JWT protection for your peace of mind.</div>
                                    </div>
                                </div>

                                <div class="btn-container">
                                    <a href="http://localhost:5173/products" class="btn">Start Shopping</a>
                                </div>
                            </div>
                            <div class="footer">
                                &copy; 2026 ShopEase Inc. Built with Microservices Architecture.<br>
                                This email was sent to %s.
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(firstName, email);

            helper.setFrom(FROM_EMAIL);
            if (email == null || email.isBlank()) {
                log.warn("Skipping welcome email: recipient email is null or blank");
                return;
            }
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [HTML Welcome] -> {}", email);
        } catch (Exception e) {
            log.warn("Failed to send HTML welcome email to {}. Cause: {}", email, e.getMessage());
        }
    }

    public void sendAbandonedCartEmail(String email, String firstName) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String subject = "You left something behind! - ShopEase";
            String safeName = firstName != null ? firstName : "there";

            String htmlContent = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: 'Segoe UI', sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
                            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
                            .header { background: #6366f1; color: white; padding: 40px; text-align: center; }
                            .header h1 { margin: 0; font-size: 24px; }
                            .content { padding: 40px; text-align: center; }
                            .greeting { font-size: 20px; font-weight: 600; margin-bottom: 16px; }
                            .message { line-height: 1.6; margin-bottom: 30px; color: #475569; }
                            .btn { display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; }
                            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header"><h1>ShopEase</h1></div>
                            <div class="content">
                                <div class="greeting">Hey %s, we noticed you left some items in your cart!</div>
                                <div class="message">
                                    Don't worry, we've saved them for you. But they're selling fast! Come back and finish your checkout now to secure your items.
                                </div>
                                <a href="http://localhost:5173/cart" class="btn">Finish My Order</a>
                            </div>
                            <div class="footer">
                                &copy; 2026 ShopEase Inc.<br>
                                You're receiving this because you have items saved in your ShopEase cart.
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(safeName);

            helper.setFrom(FROM_EMAIL);
            if (email == null || email.isBlank()) {
                log.warn("Skipping email send: recipient email is null or blank");
                return;
            }
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [Abandoned Cart] -> {}", email);
        } catch (Exception e) {
            log.warn("Failed to send Abandoned Cart email. Cause: {}", e.getMessage());
        }
    }

    public void sendPasswordResetOtpEmail(String email, String otp) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String subject = "Your Password Reset OTP - ShopEase";

            String htmlContent = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: 'Inter', 'Segoe UI', sans-serif; background-color: #0f172a; margin: 0; padding: 0; color: #f8fafc; }
                            .container { max-width: 600px; margin: 40px auto; background: rgba(30, 41, 59, 0.7); border-radius: 16px; overflow: hidden; backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                            .header { background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); color: white; padding: 30px; text-align: center; }
                            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
                            .content { padding: 40px; text-align: center; }
                            .message { line-height: 1.6; margin-bottom: 30px; font-size: 16px; color: #cbd5e1; }
                            .otp-container { background: rgba(255, 255, 255, 0.05); border: 1px dashed rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 30px; margin: 30px 0; }
                            .otp-code { font-family: monospace; font-size: 42px; font-weight: 800; color: #fbbf24; letter-spacing: 8px; margin: 0; }
                            .warning { color: #ef4444; font-size: 14px; margin-top: 20px; font-weight: 500; }
                            .footer { background: rgba(15, 23, 42, 0.8); padding: 24px 40px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>ShopEase Security</h1>
                            </div>
                            <div class="content">
                                <div class="message">
                                    We received a request to reset the password for your ShopEase account associated with this email address.
                                    Please use the One-Time Password (OTP) below to reset your password.
                                </div>

                                <div class="otp-container">
                                    <div class="otp-code">%s</div>
                                </div>

                                <div class="message" style="font-size: 14px;">
                                    This OTP is valid for the next <b>15 minutes</b>.
                                </div>
                                <div class="warning">
                                    If you did not request a password reset, please ignore this email or contact support if you have concerns.
                                </div>
                            </div>
                            <div class="footer">
                                &copy; 2026 ShopEase Inc. Built with Microservices Architecture.<br>
                                This email was sent to %s.
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(otp, email);

            helper.setFrom(FROM_EMAIL);
            if (email == null || email.isBlank()) {
                log.warn("Skipping email send: recipient email is null or blank");
                return;
            }
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [HTML OTP] -> {}", email);
        } catch (Exception e) {
            log.warn("Failed to send HTML OTP email to {}. Cause: {}", email, e.getMessage());
        }
    }
}
