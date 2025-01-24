const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      req.file.stream.pipe(stream);
    });

    res.status(200).send({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send({ error: 'Error uploading file', details: error.message });
  }
});

// Endpoint to fetch files from Cloudinary
app.get('/get-files', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'auto', // Specify the resource type
      max_results: 30, // Limit the number of results
    });

    res.status(200).send(result.resources);
  } catch (error) {
    console.error('Error fetching files from Cloudinary:', error);
    res.status(500).send({
      error: 'Error fetching files from Cloudinary',
      details: error.message,
    });
  }
});

// Endpoint to delete a file from Cloudinary
app.delete('/delete-file', async (req, res) => {
  const { public_id } = req.body;
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    res.status(200).send({ message: 'File deleted successfully', result });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send({ error: 'Error deleting file', details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
