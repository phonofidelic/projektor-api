const router = require('express').Router();

router.post('/work', (req, res, next) => {
  console.log('*** POST /work, req.body:', req.body);
  res.send('hello');
});

module.exports = router;
