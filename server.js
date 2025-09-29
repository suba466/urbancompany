import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;

app.use(cors());

// __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Mock API data
const apiData = {
  logo1:"/assets/uc.png",
  logo: "/assets/Uc.png",
  services: [
    { name: "Home Cleaning" },
    { name: "Plumbing" },
    { name: "Electrician" },
    { name: "AC Repair" },
    { name: "Carpenter" },
    { name: "Pest Control" }
  ]
};

// Logo endpoint
app.get("/api/logo", (req, res) => res.json({ logo: apiData.logo }));
app.get("/api/logo1",(req,res)=>res.json({logo1:apiData.logo1}))
// Services endpoint
app.get("/api/services", (req, res) => {
  const query = req.query.query?.toLowerCase() || "";
  const filtered = apiData.services.filter(s =>
    s.name.toLowerCase().includes(query)
  );
  res.json(filtered);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
