const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const workRoutes = require('./routes/work.routes');
const taskRoutes = require('./routes/task.routes');
const testdataRoutes = require('./routes/testdata.routes');
const { DB_CONNECTION } = require('../config/keys');

const app = express();

console.log('### NODE_ENV:', process.env.NODE_ENV);

// TODO: Create DB or memory store (Redis?)
refreshTokens = {};

app.use(passport.initialize());

// Configure db
mongoose.connect(DB_CONNECTION, {
  useNewUrlParser: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB connection error'));
db.on('open', () => console.log('DB connection successfull!'));

// Set view engin
app.set('view engine', 'pug');
app.set('views', './app/views');

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure access-control headers
app.use(cors());

app.get('/', (req, res, next) => {
  res.send('Hello World!');
});

// Serve static assets
app.use(express.static('public'));

// Register API routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/work', workRoutes);
app.use('/tasks', taskRoutes);

process.env.NODE_ENV === 'development' && app.use('/testdata', testdataRoutes);

// Catch all unhandled routes
app.use('/*', (req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error('\n### FROM ERROR HANDLER:', err);
  res.status(500).json({ message: err.message || 'Something went wrong...' });
});

module.exports = app;
