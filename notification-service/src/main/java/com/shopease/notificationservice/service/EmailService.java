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
    private static final DecimalFormat DF = new DecimalFormat("#,##,##0.00");
    private static final String FROM_EMAIL = "shopeasemicroservices@gmail.com";

    private static final String COMMON_STYLES = """
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
                body { font-family: 'Inter', system-ui, sans-serif; background-color: #0c0e14; margin: 0; padding: 0; color: #ffffff; -webkit-font-smoothing: antialiased; }
                .wrapper { width: 100%; table-layout: fixed; background-color: #0c0e14; padding-bottom: 40px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #161821; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; margin-top: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
                .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 60px 40px; text-align: center; }
                .header h1 { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; }
                .content { padding: 48px 40px; }
                .greeting { font-size: 24px; font-weight: 800; margin-bottom: 16px; color: #ffffff; }
                .message { font-size: 16px; line-height: 1.6; color: #94a3b8; margin-bottom: 32px; }
                .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px; padding: 24px; margin-bottom: 32px; }
                .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
                .detail-row:last-child { margin-bottom: 0; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-weight: 700; color: #ffffff; font-size: 18px; }
                .label { color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; }
                .value { color: #f8fafc; text-align: right; }
                .btn-container { text-align: center; margin: 40px 0; }
                .btn { display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 18px 36px; border-radius: 14px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3); }
                .footer { padding: 32px 40px; text-align: center; font-size: 12px; color: #475569; border-top: 1px solid rgba(255, 255, 255, 0.04); }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: rgba(79, 70, 229, 0.2); color: #818cf8; border: 1px solid rgba(79, 70, 229, 0.3); }
            </style>
            """;

    public void sendOrderConfirmation(String email, String name, String orderNumber, BigDecimal totalAmount,
            String shippingAddress) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String safeOrderNumber = orderNumber != null ? orderNumber : "Unknown";
            String subject = "Order Secured: " + safeOrderNumber;
            String amountFormatted = totalAmount != null ? DF.format(totalAmount) : "0.00";
            String safeAddress = shippingAddress != null ? shippingAddress.replace("\n", "<br>") : "Not provided";
            String safeName = name != null ? name : "Valued Customer";

            String htmlContent = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        %s
                    </head>
                    <body>
                        <div class="wrapper">
                            <div class="container">
                                <div class="header">
                                    <h1>ShopEase</h1>
                                </div>
                                <div class="content">
                                    <div class="greeting">Component Secured, %s.</div>
                                    <div class="message">
                                        Your acquisition request has been successfully processed. We are now preparing your digital assets for deployment.
                                    </div>

                                    <div class="card">
                                        <div class="detail-row">
                                            <span class="label">Reference ID</span>
                                            <span class="value">%s</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Priority Status</span>
                                            <span class="value"><span class="badge">Confirmed</span></span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Shipping Channel</span>
                                            <span class="value">Standard Priority</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Total Acquisition Cost</span>
                                            <span class="value">₹%s</span>
                                        </div>
                                    </div>

                                    <div class="message" style="font-size: 14px;">
                                        <strong>Destination Layout:</strong><br>
                                        %s
                                    </div>

                                    <div class="btn-container">
                                        <a href="https://shop.praveen-challa.tech/orders" class="btn">Track Deployment</a>
                                    </div>
                                </div>
                                <div class="footer">
                                    &copy; 2026 ShopEase Laboratory. All rights reserved.<br>
                                    Encrypted with bank-grade security protocols.
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(COMMON_STYLES, safeName, safeOrderNumber, amountFormatted, safeAddress);

            helper.setFrom(FROM_EMAIL);
            if (email == null || email.isBlank())
                return;
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [Premium Confirmation] -> {}", email);
        } catch (Exception e) {
            log.warn("Failed to send HTML order confirmation email. Cause: {}", e.getMessage());
        }
    }

    public void sendOrderCancellation(String email, String name, String orderNumber) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String safeOrderNumber = orderNumber != null ? orderNumber : "Unknown";
            String subject = "Deployment Cancelled: " + safeOrderNumber;
            String safeName = name != null ? name : "Valued Customer";

            String htmlContent = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        %s
                    </head>
                    <body>
                        <div class="wrapper">
                            <div class="container">
                                <div class="header" style="background: linear-gradient(135deg, #ef4444 0%%, #b91c1c 100%%);">
                                    <h1>ShopEase</h1>
                                </div>
                                <div class="content">
                                    <div class="greeting">Deployment Terminated, %s.</div>
                                    <div class="message">
                                        As requested, we have halted the shipment of order <strong>%s</strong>. Any captured funds have been released and will reflect in your account within 48-72 hours.
                                    </div>

                                    <div class="card" style="border-left: 4px solid #ef4444;">
                                        <div class="label" style="color: #ef4444; margin-bottom: 8px;">Status Report</div>
                                        <div class="message" style="margin-bottom: 0;">Access to these components has been revoked. If this was unintended, please restart the acquisition process.</div>
                                    </div>

                                    <div class="btn-container">
                                        <a href="https://shop.praveen-challa.tech/products" class="btn" style="background-color: #1e293b; box-shadow: none;">Return to Marketplace</a>
                                    </div>
                                </div>
                                <div class="footer">
                                    &copy; 2026 ShopEase Laboratory. All rights reserved.
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(COMMON_STYLES, safeName, safeOrderNumber);

            helper.setFrom(FROM_EMAIL);
            if (email == null || email.isBlank())
                return;
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [Premium Cancellation] -> {}", email);
        } catch (Exception e) {
            log.warn("Failed to send HTML order cancellation email. Cause: {}", e.getMessage());
        }
    }

    public void sendWelcomeEmail(String email, String firstName) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String subject = "Network Access Granted - Welcome to ShopEase";

            String htmlContent = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        %s
                    </head>
                    <body>
                        <div class="wrapper">
                            <div class="container">
                                <div class="header">
                                    <h1>ShopEase</h1>
                                </div>
                                <div class="content">
                                    <div class="greeting">Welcome to the Network, %s.</div>
                                    <div class="message">
                                        Your account has been successfully initialized. You now have full access to our premium microservice component marketplace.
                                    </div>

                                    <div class="card">
                                        <div class="detail-row">
                                            <span class="label" style="text-align: left;">Available Protocols</span>
                                        </div>
                                        <div class="message" style="font-size: 14px; margin-bottom: 0;">
                                            • Priority acquisition of high-demand assets<br>
                                            • Real-time deployment tracking<br>
                                            • Encrypted session management
                                        </div>
                                    </div>

                                    <div class="btn-container">
                                        <a href="https://shop.praveen-challa.tech/products" class="btn">Initialize Marketplace</a>
                                    </div>
                                </div>
                                <div class="footer">
                                    &copy; 2026 ShopEase Laboratory. All rights reserved.
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(COMMON_STYLES, firstName);

            helper.setFrom(FROM_EMAIL);
            if (email == null || email.isBlank())
                return;
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [Premium Welcome] -> {}", email);
        } catch (Exception e) {
            log.warn("Failed to send HTML welcome email. Cause: {}", e.getMessage());
        }
    }

    public void sendAbandonedCartEmail(String email, String firstName) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String subject = "Action Required: Digital Assets Remaining in Transit";
            String safeName = firstName != null ? firstName : "there";

            String htmlContent = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        %s
                    </head>
                    <body>
                        <div class="wrapper">
                            <div class="container">
                                <div class="header" style="background: linear-gradient(135deg, #6366f1 0%%, #4338ca 100%%);">
                                    <h1>ShopEase</h1>
                                </div>
                                <div class="content">
                                    <div class="greeting">Incomplete Session Detected.</div>
                                    <div class="message">
                                        Hey %s, we noticed your digital inventory contains unassigned components. These assets are currently reserved but at risk of being reallocated to other network users.
                                    </div>

                                    <div class="card">
                                        <div class="label" style="color: #6366f1; margin-bottom: 8px;">Reservation Status</div>
                                        <div class="message" style="margin-bottom: 0; font-size: 14px;">Your selection is being held temporarily. Complete the acquisition process to secure these units permanently.</div>
                                    </div>

                                    <div class="btn-container">
                                        <a href="https://shop.praveen-challa.tech/cart" class="btn">Resume Acquisition</a>
                                    </div>
                                </div>
                                <div class="footer">
                                    &copy; 2026 ShopEase Laboratory. All rights reserved.
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(COMMON_STYLES, safeName);

            helper.setFrom(FROM_EMAIL);
            if (email == null || email.isBlank())
                return;
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [Premium Abandoned Cart] -> {}", email);
        } catch (Exception e) {
            log.warn("Failed to send Abandoned Cart email. Cause: {}", e.getMessage());
        }
    }

    public void sendPasswordResetOtpEmail(String email, String otp) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String subject = "Security Protocol: Identity Verification";

            String htmlContent = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        %s
                    </head>
                    <body>
                        <div class="wrapper">
                            <div class="container">
                                <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%);">
                                    <h1>ShopEase</h1>
                                </div>
                                <div class="content" style="text-align: center;">
                                    <div class="greeting">Authentication Required.</div>
                                    <div class="message">
                                        A request to reset your network access credentials has been initiated. Use the following One-Time Protocol code to proceed.
                                    </div>

                                    <div class="card" style="background: rgba(245, 158, 11, 0.05); border: 2px dashed rgba(245, 158, 11, 0.3);">
                                        <div style="font-family: monospace; font-size: 48px; font-weight: 800; color: #fbbf24; letter-spacing: 12px; margin: 10px 0;">%s</div>
                                    </div>

                                    <div class="message" style="font-size: 13px; color: #ef4444;">
                                        <strong>⚠️ Security Alert:</strong> This code expires in 15 minutes. If you did not initiate this request, contact system security immediately.
                                    </div>
                                </div>
                                <div class="footer">
                                    &copy; 2026 ShopEase Laboratory. Security Division.
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(COMMON_STYLES, otp);

            helper.setFrom(FROM_EMAIL);
            if (email == null || email.isBlank())
                return;
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [Premium OTP] -> {}", email);
        } catch (Exception e) {
            log.warn("Failed to send HTML OTP email. Cause: {}", e.getMessage());
        }
    }
}
