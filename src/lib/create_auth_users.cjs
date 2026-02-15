const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signOut } = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDwtQ7X3JWp3za5eqybo60Wq0jCMqGlkt0",
  authDomain: "greenroute-fyp.firebaseapp.com",
  projectId: "greenroute-fyp",
  databaseURL: "https://greenroute-fyp-default-rtdb.firebaseio.com",
  storageBucket: "greenroute-fyp.firebasestorage.app",
  messagingSenderId: "955439154863",
  appId: "1:955439154863:web:aa4a25227670a5ac65b65a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const createAccounts = async () => {
  console.log("Starting Security Account Creation...");

  // 1. Create Admin
  const adminEmail = "admin@gmail.com";
  const adminPass = "admin123";
  
  try {
    const adminCred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
    await setDoc(doc(db, "users", adminCred.user.uid), {
      email: adminEmail,
      role: "admin",
      name: "System Administrator",
      createdAt: new Date().toISOString()
    });
    console.log("✅ Admin Created: admin@gmail.com");
    await signOut(auth);
  } catch (e) {
    console.log("⚠️ Admin already exists or error:", e.message);
  }

  // 2. Create 33 Drivers
  for (let i = 1; i <= 33; i++) {
    const email = `driver${i}@greenroute.com`;
    const pass = "Sargodha123!";
    
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, "users", cred.user.uid), {
        email: email,
        role: "driver",
        busId: `e${i}`,
        name: `Bus Driver ${i}`,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Driver ${i} Created: ${email}`);
      await signOut(auth);
      await delay(500); // Small delay to avoid rate limiting
    } catch (e) {
      console.log(`⚠️ Driver ${i} already exists or error:`, e.message);
    }
  }

  console.log("Done! Security System is now fully populated.");
  process.exit(0);
};

createAccounts().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
