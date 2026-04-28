export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  stops: Stop[];
  color: string;
}

export const SARGODHA_ROUTES: Route[] = [
  {
    id: "91",
    name: "Route 91: University Road - Company Bagh",
    color: "#10b981",
    stops: [
      { id: "gbs", name: "General Bus Stand", lat: 32.0734, lng: 72.6710 },
      { id: "uni", name: "University Road", lat: 32.0834, lng: 72.6750 },
      { id: "sat", name: "Satellite Town", lat: 32.0934, lng: 72.6850 },
      { id: "cb", name: "Company Bagh", lat: 32.0740, lng: 72.6860 }
    ]
  },
  {
    id: "47",
    name: "Route 47: Bhalwal Express",
    color: "#3b82f6",
    stops: [
      { id: "gbs", name: "General Bus Stand", lat: 32.0734, lng: 72.6710 },
      { id: "jhl", name: "Jhal Chakian", lat: 32.1100, lng: 72.7500 },
      { id: "bhl", name: "Bhalwal Terminal", lat: 32.2647, lng: 72.9056 }
    ]
  },
  {
    id: "33",
    name: "Route 33: Cantt Loop",
    color: "#f59e0b",
    stops: [
      { id: "uni", name: "University Road", lat: 32.0834, lng: 72.6750 },
      { id: "paf", name: "PAF Base Gate", lat: 32.0500, lng: 72.6700 },
      { id: "cnt", name: "Cantt Area", lat: 32.0400, lng: 72.6800 }
    ]
  }
];
