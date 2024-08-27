const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./models');
const userRoutes = require('./routes/userRoutes');
const tourRoutes = require('./routes/tourRoutes');
const hotspotRoutes = require('./routes/hotspotRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', tourRoutes);
app.use('/api', hotspotRoutes);
app.use('/uploads', express.static('uploads'));

// Sync the database and start the server
db.sequelize.sync().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
