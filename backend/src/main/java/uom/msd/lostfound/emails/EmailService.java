package uom.msd.lostfound.emails;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.notification.from-email}")
    private String fromEmail;

    /**
     * Sends an item-match alert email asynchronously.
     */
    @Async
    public void sendItemMatchEmail(String toEmail, String recipientName,
                                   String lostItemName, String foundItemDescription,
                                   String foundLocation) {
        Context ctx = new Context();
        ctx.setVariable("recipientName", recipientName);
        ctx.setVariable("lostItemName", lostItemName);
        ctx.setVariable("foundItemDescription", foundItemDescription);
        ctx.setVariable("foundLocation", foundLocation);

        String html = templateEngine.process("email/item-match", ctx);
        sendHtmlEmail(toEmail, "Possible Match Found for Your Lost Item – " + lostItemName, html);
    }

    /**
     * Sends a reward points earned email asynchronously.
     */
    @Async
    public void sendRewardEarnedEmail(String toEmail, String recipientName,
                                      int points, int newBalance, String reason) {
        Context ctx = new Context();
        ctx.setVariable("recipientName", recipientName);
        ctx.setVariable("points", points);
        ctx.setVariable("newBalance", newBalance);
        ctx.setVariable("reason", reason);

        String html = templateEngine.process("email/reward-earned", ctx);
        sendHtmlEmail(toEmail, "You Earned " + points + " Reward Points!", html);
    }

    /**
     * Sends a generic in-app style notification also delivered over email.
     */
    @Async
    public void sendGenericEmail(String toEmail, String subject, String title, String message) {
        Context ctx = new Context();
        ctx.setVariable("title", title);
        ctx.setVariable("message", message);

        String html = templateEngine.process("email/generic-notification", ctx);
        sendHtmlEmail(toEmail, subject, html);
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            log.info("Email sent to {} with subject '{}'", toEmail, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Sends a support request email to the admin team.
     */
    @Async
    public void sendSupportEmail(String userEmail, String subject, String message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(fromEmail); // Send to the support email itself
            helper.setReplyTo(userEmail); // Allow replying directly to the user
            helper.setSubject("Support Request: " + subject);

            String textBody = "New support request from: " + userEmail + "\n\n"
                    + "Subject: " + subject + "\n\n"
                    + "Message:\n" + message;

            helper.setText(textBody, false);
            mailSender.send(mimeMessage);
            log.info("Support email sent from {}", userEmail);
        } catch (MessagingException e) {
            log.error("Failed to send support email from {}: {}", userEmail, e.getMessage());
        }
    }
}
