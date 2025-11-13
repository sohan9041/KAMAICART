import admin from "firebase-admin";
import serviceAccount from "../Config/kamaikart-firebase-adminsdk-fbsvc-95c65a7dc5.json" with { type: "json" };


// ✅ Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

class FirebaseHelper {
  static async sendNotification(token, notification, data = {}) {
    try {
      const message = {
        token, // ✅ required here (that’s what the error said was missing)
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [String(k), String(v)])) : {},
      };

      const response = await admin.messaging().send(message);
      return { success: true, response };
    } catch (error) {
      console.error("🔥 Firebase Send Error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default FirebaseHelper;
