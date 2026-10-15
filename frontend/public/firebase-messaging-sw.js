importScripts(
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js"
);

const firebaseConfig = self.FIREBASE_CONFIG;

if (firebaseConfig?.apiKey && firebaseConfig?.projectId && firebaseConfig?.appId) {
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log("[PUSH SW] Mesaj primit în background:", payload);

        const title = payload.data?.title || "MIHAIFADE";
        const body = payload.data?.body || "";

        self.registration.showNotification(title, {
            body,
            icon: "/favicon.png",
            badge: "/favicon.png",
        });
    });
} else {
    console.info("[PUSH SW] Firebase nu este configurat în aceasta copie.");
}
