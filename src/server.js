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
  carousel:[
    {key: "shine", img: "/assets/shine.png"},
    {key: "festive", img: "/assets/festive.png"},
    {key: "relax", img: "/assets/relax.png"},
    {key: "water", img: "/assets/water.png"},
    {key: "expert", img: "/assets/expert.png"},
    {key: "deepclean", img: "/assets/deepclean.png"}
  ]
};

// Endpoints
app.get("/api/logo", (req, res) => res.json({ logo: apiData.logo }));
app.get("/api/services", (req, res) => res.json({ services: apiData.services }));
app.get("/api/banner", (req, res) => res.json({ banner: apiData.banner }));
app.get("/api/carousel", (req, res) => res.json({ carousel: apiData.carousel }));

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
