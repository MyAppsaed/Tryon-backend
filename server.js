import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";
import FormData from "form-data";

const app = express();
const upload = multer();
app.use(cors());

app.get("/", (req, res) => res.send("Virtual Try-On API is running ✅"));

app.post("/api/tryon", upload.fields([
  { name: "user_photo", maxCount: 1 },
  { name: "cloth_photo", maxCount: 1 }
]), async (req, res) => {
  try {
    const userPhoto = req.files["user_photo"][0].buffer;
    const clothPhoto = req.files["cloth_photo"][0].buffer;

    const form = new FormData();
    form.append("user_image", userPhoto, "user.jpg");
    form.append("cloth_image", clothPhoto, "cloth.jpg");

    const response = await fetch("https://api.revery.ai/v1/tryon", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.REVERY_API_KEY}` },
      body: form
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Revery API error:", errText);
      return res.status(500).json({ error: "Revery AI failed." });
    }

    const result = await response.json();
    return res.json({ success: true, imageUrl: result.generated_image_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Try-on failed" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Try-On API running on port ${port}`));
