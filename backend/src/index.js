import express from 'express';

const app = express();

// Maintenance message for all routes
app.use((req, res) => {
  res.status(503).json({
    status: "maintenance",
    message: "Server is under maintenance. Please try again later."
  });
});

const port = 4000;

app.listen(port, () => {
  console.log(`Server in maintenance mode on port ${port}`);
});