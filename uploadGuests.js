import admin from "firebase-admin";
import fs from "fs";

// Read the service account key JSON file
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const guests = [
  { name: "Pahal", entryCode: "060610", rulesAccepted: false, badge: false },
  { name: "Aditi", entryCode: "090726", rulesAccepted: false, badge: false },
  { name: "Sarvagya", entryCode: "220422", rulesAccepted: false, badge: false }
];

async function uploadGuests() {
  try {
    for (const guest of guests) {
      await db.collection("guests").add(guest);
      console.log("Added:", guest.name);
    }
    console.log("Upload finished");
  } catch (err) {
    console.error("Error uploading guests:", err);
  }
}

uploadGuests();