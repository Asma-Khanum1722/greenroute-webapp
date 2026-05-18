const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, onValue, update } = require('firebase/database');
const dotenv = require('dotenv');

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const SARGODHA_ROUTES = [
  { id: "bhalwal", name: "GBS — Bhalwal", color: "#10b981", stops: [
    { id: "gbs", name: "GBS Sargodha", lat: 32.0732, lng: 72.6713 },
    { id: "s1", name: "47 Pull", lat: 32.0521, lng: 72.7234 },
    { id: "s2", name: "Bhalwal City", lat: 32.2645, lng: 72.9012 }
  ]},
  { id: "khushab", name: "GBS — Khushab", color: "#3b82f6", stops: [
    { id: "gbs", name: "GBS Sargodha", lat: 32.0732, lng: 72.6713 },
    { id: "k1", name: "Shaheenabad", lat: 32.0845, lng: 72.4512 },
    { id: "k2", name: "Khushab Bridge", lat: 32.2912, lng: 72.3512 }
  ]}
];

const GBS_TERMINAL = { lat: 32.0722, lng: 72.6861 };

console.log("🚀 GREENROUTE DEMO SEEDER STARTED");
console.log("-----------------------------------");

// Listen for VIVA DEMO MODE toggle
const demoModeRef = ref(db, 'system/demoMode');
let isDemoActive = false;

onValue(demoModeRef, (snapshot) => {
  isDemoActive = !!snapshot.val();
  console.log(`[SYSTEM] Demo Mode is now: ${isDemoActive ? 'ACTIVE ✅' : 'DISABLED 🛑'}`);
});

function animate() {
  if (!isDemoActive) {
    setTimeout(animate, 2000);
    return;
  }

  for (let i = 1; i <= 33; i++) {
    const busId = `e${i}`;
    const route = SARGODHA_ROUTES[i % SARGODHA_ROUTES.length];
    
    // Add small random movement
    const lat = GBS_TERMINAL.lat + (Math.random() - 0.5) * 0.05;
    const lng = GBS_TERMINAL.lng + (Math.random() - 0.5) * 0.05;

    update(ref(db, `buses/${busId}`), {
      id: busId.toUpperCase(),
      routeId: route.id,
      routeName: route.name,
      lat: lat,
      lng: lng,
      speed: Math.floor(Math.random() * 40) + 20,
      status: "active",
      lastUpdated: Date.now()
    });
  }
  
  setTimeout(animate, 3000);
}

animate();
