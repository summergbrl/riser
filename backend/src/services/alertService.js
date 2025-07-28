
import { sendEmailNotification, sendSMSNotification, sendPushNotification } from './notificationService.js';

export async function sendAlert(location, message) {
  // Example: send push/email/SMS notification
  console.log(`Alert for ${location}: ${message}`);
  
  // TODO: Get users in location from database
  const usersInLocation = [
    { id: 1, email: 'user1@example.com', phone: '+639123456789' },
    { id: 2, email: 'user2@example.com', phone: '+639987654321' }
  ];

  // Send notifications to all users in the affected area
  for (const user of usersInLocation) {
    await sendEmailNotification(
      user.email,
      `Flood Alert: ${location}`,
      `Warning: ${message}`
    );
    await sendSMSNotification(
      user.phone,
      `Flood Alert for ${location}: ${message}`
    );
    await sendPushNotification(
      user.id,
      `Flood Alert: ${location}`,
      message
    );
  }
}
