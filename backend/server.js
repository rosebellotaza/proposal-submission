const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const fileRoutes = require('./routes/files');
const proposalRoutes = require('./routes/proposals');

app.use('/api/files', fileRoutes);
app.use('/api/proposals', proposalRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});