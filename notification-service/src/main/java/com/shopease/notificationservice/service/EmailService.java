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
    private static final String TO_EMAIL = "shopeasemicroservices@gmail.com"; // For testing
    private static final DecimalFormat DF = new DecimalFormat("#,##0.00");

    public void sendOrderConfirmation(Long userId, String orderNumber, BigDecimal totalAmount, String shippingAddress) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String subject = "Order Confirmation: " + orderNumber;
            String amountFormatted = DF.format(totalAmount);

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
                            .btn { display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; text-align: center; margin-top: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>ShopEase</h1>
                            </div>
                            <div class="content">
                                <div class="greeting">Hello User %d,</div>
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
                                        <span class="value">$%s</span>
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
                    .formatted(userId, orderNumber, amountFormatted, shippingAddress.replace("\n", "<br>"));

            helper.setFrom(FROM_EMAIL);
            helper.setTo(TO_EMAIL);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indicates HTML content

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [HTML Confirmation] -> {}", TO_EMAIL);
        } catch (Exception e) {
            log.warn("Failed to send HTML order confirmation email for order {}. Cause: {}", orderNumber,
                    e.getMessage());
        }
    }

    public void sendOrderCancellation(Long userId, String orderNumber) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String subject = "Order Cancellation: " + orderNumber;

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
                                <div class="greeting">Hello User %d,</div>

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
                    .formatted(userId, orderNumber);

            helper.setFrom(FROM_EMAIL);
            helper.setTo(TO_EMAIL);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            log.info("Email sent successfully: [HTML Cancellation] -> {}", TO_EMAIL);
        } catch (Exception e) {
            log.warn("Failed to send HTML order cancellation email for order {}. Cause: {}", orderNumber,
                    e.getMessage());
        }
    }
}
