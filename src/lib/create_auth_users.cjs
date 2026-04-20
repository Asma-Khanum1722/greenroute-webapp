const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, signOut } = require("firebase/auth");
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
  console.log("Starting Security Resync & Password Update...");

  // 1. Setup Admin
  const adminEmail = "admin@gmail.com";
  const adminPass = "admin123";
  
  try {
    let user;
    try {
      const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
      user = cred.user;
    } catch (e) {
      // If already exists, sign in to update profile/pass
      const cred = await signInWithEmailAndPassword(auth, adminEmail, "admin123").catch(() => 
        signInWithEmailAndPassword(auth, adminEmail, "Sargodha123!") // Try old pass if changed
      );
      user = cred.user;
      await updatePassword(user, adminPass);
    }

    await setDoc(doc(db, "users", user.uid), {
      email: adminEmail,
      role: "admin",
      name: "Sargodha Admin",
      createdAt: new Date().toISOString()
    });
    console.log("✅ Admin Ready: admin@gmail.com / admin123");
    await signOut(auth);
  } catch (e) {
    console.log("⚠️ Admin Error:", e.message);
  }

  // 2. Setup 33 Drivers
  for (let i = 1; i <= 33; i++) {
    const email = `driver${i}@greenroute.com`;
    const newPass = `driver-e${i}`;
    
    try {
      let user;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, newPass);
        user = cred.user;
      } catch (e) {
        // Try to sign in with old pass to update
        const cred = await signInWithEmailAndPassword(auth, email, "Sargodha123!").catch(() => 
          signInWithEmailAndPassword(auth, email, newPass)
        );
        user = cred.user;
        await updatePassword(user, newPass);
      }

      await setDoc(doc(db, "users", user.uid), {
        email: email,
        role: "driver",
        busId: `e${i}`,
        name: `Driver of Bus E${i}`,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Driver ${i} Ready: ${email} / ${newPass}`);
      await signOut(auth);
      await delay(400); 
    } catch (e) {
      console.log(`⚠️ Driver ${i} Error:`, e.message);
    }
  }

  console.log("Done! All profiles synced and passwords simplified.");
  process.exit(0);
};

createAccounts().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
