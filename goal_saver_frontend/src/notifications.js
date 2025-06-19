//
// Push notification abstraction: supports OneSignal and Firebase Cloud Messaging (FCM) for web
// Loads credentials from environment variables (see .env.example)
//
/**
 * Initializes push notification services as available (OneSignal, FCM).
 * Handles: registration, permission prompt, and basic notification send helpers.
 *
 * USAGE:
 *   import { initNotifications, sendPushNotification } from './notifications';
 *   Call initNotifications() early in app lifecycle.
 *   Use sendPushNotification({title, message, ...}) for custom triggers (optional).
 */

// PUBLIC_INTERFACE
export async function initNotifications() {
  // Prefer OneSignal if available, else try FCM
  if (
    window.OneSignal ||
    process.env.REACT_APP_ONESIGNAL_APP_ID
  ) {
    await loadOneSignal();
    return;
  }
  if (window.firebase || process.env.REACT_APP_FIREBASE_API_KEY) {
    await loadFirebase();
    return;
  }
  // No supported push service configured
}

async function loadOneSignal() {
  if (window.OneSignal) return;
  // Load the OneSignal SDK if not loaded
  if (!document.getElementById('onesignal-sdk')) {
    const script = document.createElement('script');
    script.id = 'onesignal-sdk';
    script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
    script.async = true;
    document.head.appendChild(script);
    await new Promise((res) => {
      script.onload = res;
      script.onerror = res;
    });
  }
  // Init with env var
  const appId = process.env.REACT_APP_ONESIGNAL_APP_ID;
  if (!appId) return;
  window.OneSignal = window.OneSignal || [];
  window.OneSignal.push(function () {
    window.OneSignal.init({
      appId,
      notifyButton: {
        enable: true,
      },
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: "push",
              autoPrompt: true,
              text: {
                actionMessage: "Get reminders & progress updates from Goalie!",
                acceptButton: "Allow",
                cancelButton: "No thanks"
              }
            }
          ]
        }
      }
    });
  });
}

// Optional FCM integration (requires web Firebase config)
async function loadFirebase() {
  if (window.firebase) return;
  if (!document.getElementById('firebase-sdk')) {
    const script = document.createElement('script');
    script.id = 'firebase-sdk';
    script.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
    script.async = true;
    document.head.appendChild(script);

    const msgScript = document.createElement('script');
    msgScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js';
    msgScript.async = true;
    document.head.appendChild(msgScript);

    await Promise.all([
      new Promise((res) => { script.onload = res; script.onerror = res; }),
      new Promise((res) => { msgScript.onload = res; msgScript.onerror = res; }),
    ]);
  }

  const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
  const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
  const messagingSenderId = process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.REACT_APP_FIREBASE_APP_ID;
  const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

  if (!(apiKey && authDomain && projectId && messagingSenderId && appId)) return;
  window.firebase.initializeApp({
    apiKey,
    authDomain,
    projectId,
    messagingSenderId,
    appId,
  });
  const messaging = window.firebase.messaging();
  try {
    await messaging.getToken({ vapidKey });
  } catch (err) {
    // Permission denied or error
  }
}

// PUBLIC_INTERFACE
/**
 * Send a push notification to the user (in-browser, as available)
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.url]
 */
export async function sendPushNotification({ title, message, url }) {
  // Use OneSignal if available
  if (window.OneSignal) {
    window.OneSignal.push(function () {
      window.OneSignal.showSlidedownPrompt();
      window.OneSignal.sendSelfNotification(
        title,
        message,
        url || window.location.href,
        null,
        {
          notificationType: "reminder"
        }
      );
    });
    return;
  }
  // FCM is not natively supported for foreground notifications w/o backend, fallback to Notification API
  if (window.Notification && Notification.permission === "granted") {
    new window.Notification(title, { body: message, icon: '/favicon.ico' });
    return;
  }
}
