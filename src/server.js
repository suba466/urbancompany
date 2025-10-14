import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use("/assets", express.static(path.join(__dirname, "assets")));

// API data
const apiData = {
  logo: "/assets/Uc.png",
  services: [
    { name: "Salon for women", key: "salon", img: "/assets/salon.webp" },
    { name: "AC & Appliance Repair", key: "ac", img: "/assets/ac.webp" },
    { name: "Cleaning", key: "clean", img: "/assets/clean.webp" },
    { name: "Electrician, Plumber & Carpenters", key: "electric", img: "/assets/electric.webp" },
    { name: "Native Water Purifier", key: "native", img: "/assets/native.webp" },
  ],
  banner: { key: "banner", img: "/assets/banner.webp" },
  carousel: [
    { name: "Shine your bathroom deserves", key: "shine", img: "/assets/shine.png" },
    { name: "Festive packages upto 25% off", descriptions: "Extra 25% off for new users*", key: "festive", img: "/assets/festive.png" },
    { name: "Relax & rejuvenate at home", descriptions: "Massage for men", key: "relax", img: "/assets/relax.png" },
    { name: "RO Water Purifier", descriptions: "Needs no service for 2 years", key: "water", img: "/assets/water.png" },
    { name: "Get experts in 2 hours at ₹149", descriptions: "Electricians, plumbers, carpenters", key: "expert", img: "/assets/expert.png" },
    { name: "Deep clean with foam-jet AC service", descriptions: "AC service & repair", key: "deepclean", img: "/assets/deepclean.png" }
  ],
  book: [
    { name: "Intense cleaning (2 bathrooms)", title: "4.79 (3.1M)",value:"₹1,016",option:"₹1,098", key: "intenseclean", img: "/assets/intenseclean.png" },
    { name: "Classic cleaning (2 bathrooms)", title: "4.82 (1.5M)",value:"₹868",option:"₹938", key: "classic", img: "/assets/classic.png" },
    { name: "Switch/socket replacement", title: "4.85 (72M)",value:"₹49", key: "socket", img: "/assets/socket.png" },
    { name: "Drill & hang (wall decor)", title: "4.86 (99K)",value:"₹49", key: "wall", img: "/assets/wall.png" },
    { name: "Switchboard/switchbox repair", title: "4.85 (69K)",value:"₹79", key: "switch", img: "/assets/switch.png" },
    { name: "Automatic top load machine checkup", title: "4.78 (328K)",value:"₹299", key: "automatic", img: "/assets/automatic.png" },
    { name: "Tap repair", title: "4.81 (122K)", key: "tap",value:"₹49", img: "/assets/tap.png" },
    { name: "Intense cleaning (3 bathrooms)", title: "4.79 (3.1M)",value:"₹1,483",option:"₹1,647", key: "intence", img: "/assets/intense.png" },
    { name: "Fan repair (ceiling/exhaust/wall)", title: "4.81 (95K)",value:"₹109", key: "fan", img: "/assets/fan.png" },
    { name: "Bulb/tubelight holder installation", title: "4.86 (3.3K)",value:"₹69", key: "bulb", img: "/assets/bulb.png" }
  ],
  salon:[
    {key:"waxing",img:"/assets/waxing.png"},
    {key:"cleanup", img:"/assets/cleanup.png"},
    {key:"haircare", img:"/assets/haircare.png"}
  ],
  smartlock:{key:"smartlocks", img:"/assets/smartlocks.png"},
  images:{key:"images",img:"/assets/images.png"},
  salonforwomen:[
    {name:"Super saver packages",key:"super",img:"/assets/super.webp"},
    {name:"Waxing & threading",key:"thread",img:"/assets/thread.webp"},
    {name:"Signature facial",key:"signature",img:"/assets/signature.webp"},
    {name:"Cleanup",key:"cleanup",img:"/assets/cleanup.webp"},
    {name:"Pedicure & manicure",key:"cure",img:"/assets/cure.webp"},
    {name:"Hair, bleach & detan",key:"hairbleach",img:"/assets/hairbleach.webp"},
  ],
  advanced:[
    {price:"₹799",value:"₹1,098",title:"Roll-on waxing",tit:"Full arms, legs & underarms",text:"EXtra 25% off for new users*",key:"facial",img:"/assets/facial.jpg"},
    {pri:"Just launched",title:"Advanced tools",tit:"& ingredients",text:"Facial & clea",key:"advanced",img:"/assets/advanced.jpg"}
  ],
};

// Endpoints
app.get("/api/logo", (req, res) => res.json({ logo: apiData.logo }));
app.get("/api/services", (req, res) => res.json({ services: apiData.services }));
app.get("/api/banner", (req, res) => res.json({ banner: apiData.banner }));
app.get("/api/carousel", (req, res) => res.json({ carousel: apiData.carousel }));
app.get("/api/book", (req, res) => res.json({ book: apiData.book })); 
app.get("/api/salon",(req,res)=>res.json({salon:apiData.salon}))
app.get("/api/smartlock",(req,res)=>res.json({smartlock:apiData.smartlock}));
app.get("/api/images",(req,res)=>res.json({images:apiData.images}));
app.get("/api/salonforwomen",(req,res)=>res.json({salonforwomen:apiData.salonforwomen}));
app.get("/api/advanced",(req,res)=>res.json({advanced:apiData.advanced}));
// Start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
