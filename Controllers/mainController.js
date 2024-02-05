const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const fs = require("fs");
const axios = require('axios');

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// Function to download an image from a URL and convert it to a Buffer
const downloadImage = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};
const getImageMimeType = async (imageUrl) => {
  try {
    const response = await axios.head(imageUrl);
    const contentType = response.headers['content-type'];
    
    if (!contentType) {
      throw new Error('Content-Type header not found');
    }

    return contentType;
  } catch (error) {
    console.error('Error getting image MIME type:', error.message);
    throw error;
  }
};
exports.createResponse = async (req, res) => {
    console.log("start response...");
    let file  = req.body.image;
    console.log(req.body)
  
    if (!file) {
      return res.status(400).json({ message: "File not found", success: false });
    }

    let responseText = '';
    try {
      

      dotenv.config();
      const genAI = new GoogleGenerativeAI(process.env.API_KEY);

      
  
      const imageBuffer = await downloadImage(file);
      // For text-and-image input (multimodal), use the gemini-pro-vision model
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const prompt = "This is a face of a human and what is the emotion this face express?Give me only a expression with only two words";
        let mimeType
        
        mimeType = await getImageMimeType(file)
        

        console.log("mimeType : "+mimeType)
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(mimeType)) {
          return res.status(400).json({ message: 'Invalid file format. Only JPG and PNG are allowed.', success: false });
        }
        const imageParts = [
          fileToGenerativePart(imageBuffer, mimeType),
        ];

        try {
          const result = await model.generateContent([prompt, ...imageParts],safety_settings=[
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE",
            },
        ]);
          const response = await result.response;
          responseText = response.text();
          console.log(responseText);
        
          // Handle response here or store it in a variable for later use
          console.log("Generated response:", responseText);
        } catch (error) {
          console.error("Error generating content:", error);
          return res.status(503).json({ message: error, success: false });
        } 
      
    } catch (error) {
      console.error("Error initializing GoogleGenerativeAI:", error);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  
    
    return res.status(200).json({ message: responseText, success: true });
  };
  