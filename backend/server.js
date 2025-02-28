const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Handle all other routes by serving index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});