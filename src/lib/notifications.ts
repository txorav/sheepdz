// src/lib/notifications.ts
import { prisma } from '@/lib/prisma';

export async function createNotification(userId: string, message: string) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        message,
        read: false,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function notifyUserReservationUpdate(
  userId: string, 
  status: string, 
  rejectionReason?: string
) {
  let message = '';
  
  switch (status) {
    case 'CONFIRMED':
      message = 'Your sheep reservation has been confirmed! You can now proceed with payment.';
      break;
    case 'CANCELLED':
      message = rejectionReason 
        ? `Your sheep reservation has been cancelled. Reason: ${rejectionReason}`
        : 'Your sheep reservation has been cancelled.';
      break;
    case 'PICKED_UP':
      message = 'Your sheep has been marked as picked up. Thank you for your cooperation!';
      break;
    default:
      message = `Your reservation status has been updated to: ${status}`;
  }

  return await createNotification(userId, message);
}

export async function notifyPickupReminder(userId: string, pickupDate: string, location: string) {
  const message = `Reminder: Your sheep pickup is scheduled for ${pickupDate} at ${location}. Please bring your reservation confirmation.`;
  return await createNotification(userId, message);
}

export async function notifyPaymentConfirmation(userId: string, amount: number) {
  const message = `Your payment of ${amount} DZD has been confirmed. Your reservation is now active.`;
  return await createNotification(userId, message);
}
