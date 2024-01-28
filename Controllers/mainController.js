exports.createResponse = async (req, res) => {
    console.log("start response...");
    console.log(req.file);
    let { file } = req;
    
  
    if (!file) {
      return res.status(200).json({ message: "Incomplete image inputted", success: false });
    }

    let responseText = '';
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const dotenv = require("dotenv");
      const fs = require("fs");
  
      dotenv.config();
      const genAI = new GoogleGenerativeAI(process.env.API_KEY);

      // Converts local file information to a GoogleGenerativeAI.Part object.
      function fileToGenerativePart(buffer, mimeType) {
        return {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType
          },
        };
      }
  
      // For text-and-image input (multimodal), use the gemini-pro-vision model
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const prompt = "This is a face of a human and what is the emotion this face express?Give me only a expression with only two words";

        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return res.status(400).json({ message: 'Invalid file format. Only JPG and PNG are allowed.', success: false });
        }
        const imageParts = [
          fileToGenerativePart(file.buffer, file.mimetype),
        ];

        
      
        
        try {
          const result = await model.generateContent([prompt, ...imageParts]);
          const response = await result.response;
          responseText = response.text();
          console.log(responseText);
        
          // Handle response here or store it in a variable for later use
          console.log("Generated response:", responseText);
        } catch (error) {
          console.error("Error generating content:", error);
        } 
      
    } catch (error) {
      console.error("Error initializing GoogleGenerativeAI:", error);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  
    // You might want to return a response indicating that the generation process has started
    return res.status(200).json({ message: responseText, success: true });
  };
  