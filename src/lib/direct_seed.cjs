const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set } = require("firebase/database");

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
const rtdb = getDatabase(app);

const seedBuses = async () => {
  console.log("Starting database seed...");
  const sargodhaCenter = { lat: 32.074, lng: 72.686 };
  
  for (let i = 1; i <= 33; i++) {
    const busId = `E${i}`;
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    await set(ref(rtdb, `buses/e${i}`), {
      id: `${busId}-91`,
      lat: sargodhaCenter.lat + latOffset,
      lng: sargodhaCenter.lng + lngOffset,
      speed: Math.floor(Math.random() * 40) + 10,
      heading: Math.floor(Math.random() * 360),
      status: Math.random() > 0.1 ? "active" : "inactive",
      lastUpdated: Date.now()
    });
    console.log(`Seeded Bus ${busId}`);
  }
  console.log("Success: 33 Buses added to Firebase!");
  process.exit(0);
};

seedBuses().catch(err => {
  console.error(err);
  process.exit(1);
});
