const router = require('express').Router();
const Project = require('../models/project.model');
const Work = require('../models/work.model');
const faker = require('faker');
const moment = require('moment');

/** Test data input example
 * JSON body sent to /testdata/work
 * 
  {
    "projectId": "5ef79e925a8ba71a8f7b9145",
    "userId": "5e1e4a5942c48a164a3e04a0",
    "amount": 5
  }
 */
router.post('/work', async (req, res, next) => {
  console.log('*** POST /work, req.body:', req.body);
  const { projectId, userId, amount } = req.body;

  let project;
  try {
    project = await Project.findById(projectId);
  } catch (err) {
    console.error(err);
    return next(err);
  }

  console.log('project:', project);

  const durationMultipliers = [0.5, 1, 2, 3, 4, 5, 6, 7, 8];
  const startWeek = moment().day(0);
  const endWeek = moment().day(7);

  for (let i = 0; i < amount; i++) {
    const start = faker.date.between(startWeek, endWeek);
    const duration =
      3.6e6 *
      durationMultipliers[
        Math.floor(Math.random() * durationMultipliers.length)
      ];
    const end = new Date(Date.parse(start) + duration);

    let newWork;
    try {
      newWork = await new Work({
        userId,
        projectId,
        project: projectId,
        date: start,
        start,
        end,
        duration,
        // notes: faker.lorem.sentence(),
        notes: faker.hacker.phrase(),
      }).save();
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  res.send('Done!');
});

module.exports = router;
