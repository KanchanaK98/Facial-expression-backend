const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const sendResponse = require("./Routes/mainRoute")
// Enable CORS
app.use(cors());
app.use(bodyParser.json());



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/image",sendResponse);
