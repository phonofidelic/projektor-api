const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const workRoutes = require('./routes/work.routes');
const { DB_CONNECTION } = require('../config/keys');

const app = express();

// Configure db
mongoose.connect(DB_CONNECTION, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB connection error'));
db.on('open', () => console.log('DB connection successfull!'));

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

// Configure access-control headers
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   );
//   next();
// });
app.use(cors());

app.get('/', (req, res, next) => {
  res.send('Hello World!');
});

// Register API routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/work', workRoutes);

// Catch all unhandled routes
app.use('/*', (req, res) => {
  res.status(404).json({ message: 'Recource not found' });
});

app.use((err, req, res, next) => {
  console.error('\n### FROM ERROR HANDLER:', err);
  res
    .status(500)
    .json({ message: err.message || STRINGS.default_server_error });
});

module.exports = app;
