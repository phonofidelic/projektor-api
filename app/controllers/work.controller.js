const mongoose = require('mongoose');
const tm = require('text-miner');
const pos = require('pos');
const { map } = require('p-iteration');

const Work = require('../models/work.model');
const Project = require('../models/project.model');
const Task = require('../models/task.model');

module.exports.createWork = async (req, res, next) => {
  const { userId } = req;
  const {
    projectId,
    project,
    date,
    start,
    end,
    duration,
    notes,
    tasks,
  } = req.body;

  console.log('\n*** Create new Work ***');

  let newWork;
  try {
    newWork = await new Work({
      userId,
      projectId,
      project,
      date,
      start,
      end,
      duration,
      notes,
    }).save();

    // console.log('\n*** createWork, newWork:', newWork);
  } catch (err) {
    console.error(err);
    return next(err);
  }

  /**
   * Find all Tasks associated with the Work documents Project.
   */
  const addedTasks = await map(tasks, async (task) => {
    let foundTask;
    try {
      foundTask = await Task.findOne({
        userId,
        projects: { $in: task.projects },
        value: task.value,
      });
    } catch (err) {
      console.error('Could not find task:', err);
      return next(err);
    }

    /**
     * If an existing Task is found, add this Work id
     * to its reference array and return the Task id.
     */
    console.log('* Existing Task found, updating reference links');
    if (foundTask) {
      try {
        await Task.updateOne(
          { userId, _id: foundTask._id },
          { $addToSet: { work: newWork._id } }
        );
      } catch (err) {
        console.error('Could not add Work id to the Tasks:', err);
        return next(err);
      }
      return foundTask._id;
    }

    /**
     * Otherwise, create a new Task and add this Work id
     * to its reference array and return the Task id.
     */
    console.log('* No existing Task found, creating new Task...');
    let newTask;
    try {
      newTask = await new Task({
        userId,
        work: [newWork._id],
        projects: [newWork.project],
        displayName: task.displayName,
        value: task.value,
        description: task.description,
      }).save();
    } catch (err) {
      console.error('Could not create new task', err);
      return next(err);
    }

    /**
     * Update project with new Task id
     */
    try {
      await Project.findByIdAndUpdate(
        {
          userId,
          _id: newWork.project,
        },
        {
          $addToSet: { tasks: newTask._id },
        }
      );
    } catch (err) {
      console.error('Could not update project with new task id');
      return next(err);
    }

    return newTask._id;
  });

  /**
   * Update the new Work doc with the added Tasks.
   */
  let newWorkWithTasks;
  try {
    newWorkWithTasks = await Work.findOneAndUpdate(
      { userId, _id: newWork._id },
      { $set: { tasks: addedTasks } },
      { new: true }
    ).populate('tasks');
  } catch (err) {
    console.error('Could not update new Work doc with Task references:', err);
    return next(err);
  }
  console.log('### newWorkWithTasks:', newWorkWithTasks);

  res.json({ data: newWorkWithTasks });
};

module.exports.updateWork = async (req, res, next) => {
  const { userId } = req;
  const { workData } = req.body;

  console.log('\n*** Update Work ***');

  /**
   * Find all Tasks associated with the Work documents Project.
   */
  const tasks = await map(workData.tasks, async (task) => {
    let foundTask;
    try {
      foundTask = await Task.findOne({
        userId,
        projects: { $in: task.projects },
        value: task.value,
      });
    } catch (err) {
      console.error('Could not find task:', err);
      return next(err);
    }

    /**
     * If an existing Task is found, add this Work id
     * to its reference array and return the Task id.
     */
    if (foundTask) {
      console.log('* Existing Task found, updating reference links');
      try {
        await Task.updateOne(
          { userId, _id: foundTask._id },
          { $addToSet: { work: workData._id } }
        );
      } catch (err) {
        console.error('Could not add Work id to the Tasks:', err);
        return next(err);
      }
      return foundTask._id;
    }

    /**
     * Otherwise, create a new Task and add this Work id
     * to its reference array and return the Task id.
     */
    console.log('* No existing Task found, creating new Task...');
    let newTask;
    try {
      newTask = await new Task({
        userId,
        work: [workData._id],
        projects: [workData.project],
        displayName: task.displayName,
        value: task.value,
        description: task.description,
      }).save();
    } catch (err) {
      console.error('Could not create new task', err);
      return next(err);
    }

    /**
     * Update project with new Task id
     */
    try {
      await Project.findByIdAndUpdate(
        {
          userId,
          _id: workData.project,
        },
        {
          $addToSet: { tasks: newTask._id },
        }
      );
    } catch (err) {
      console.error('Could not update project with new task id');
      return next(err);
    }

    return newTask._id;
  });

  /**
   * Update all Tasks associated with this Work item.
   * For each Task found, if it is not in the "tasks" list,
   * pull this Work reference from the Task document.
   */
  try {
    await Task.updateMany(
      {
        userId,
        // work: { $in: [workData._id] },
        _id: {
          $nin: tasks,
        },
      },
      { $pull: { work: workData._id } }
    );
  } catch (err) {
    console.error('Could not unlink referenced Task:', err);
    return next(err);
  }

  /**
   * Update Work document
   */
  let updatedWork;
  try {
    updatedWork = await Work.findOneAndUpdate(
      { _id: workData._id, userId },
      {
        ...workData,
        tasks,
      },
      {
        new: true,
      }
    ).populate('tasks');
  } catch (err) {
    console.error(err);
    next(err);
  }

  /**
   * Use aggregate pipeline to get total timeUsed
   * for Project
   */
  let projectDuration;
  try {
    projectDuration = await Work.aggregate([
      { $match: { projectId: mongoose.Types.ObjectId(workData.projectId) } },
      { $group: { _id: null, duration: { $sum: '$duration' } } },
      { $project: { _id: 0, duration: 1 } },
    ]);
  } catch (err) {
    console.error(err);
    next(err);
  }

  /**
   * Update Project with new timeUsed value
   */
  try {
    await Project.findByIdAndUpdate(workData.projectId, {
      timeUsed: projectDuration[0].duration,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }

  res.json({ data: updatedWork });
};

module.exports.removeWork = async (req, res, next) => {
  const { userId, token } = req;
  const { workId } = req.params;

  let workToRemove;
  try {
    workToRemove = await Work.findOne({ _id: workId, userId });
    console.log('*** workToRemove:', workToRemove);
    await workToRemove.remove();
    res.json({ data: workToRemove, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.getAllWork = async (req, res, next) => {
  const { userId, token } = req;

  let results;
  try {
    results = await Work.find({ userId }).populate('project');
  } catch (err) {
    console.error(err);
    next(err);
  }

  /**
   * Check Work documents for project field and
   * update them if it is not present
   */
  const checkedResults = results.map(async (work) => {
    if (!work.project) {
      let updatedWork;
      try {
        updatedWork = await Work.findOneAndUpdate(
          { userId, _id: work._id },
          { project: work.projectId },
          { new: true }
        ).populate('project');
      } catch (err) {
        console.error(err);
        next(err);
      }
      return updatedWork;
    }

    return work;
  });

  res.json({ data: await Promise.all(checkedResults), token });
};

module.exports.getWorkByInterval = async (req, res, next) => {
  const { userId, token } = req;
  const { start, end } = req.params;

  console.log('====================================');
  // console.log('start:', start);
  // console.log('end:', end);
  console.log('req.params:', req.params);
  console.log('====================================');

  const querry = {
    userId,
    start: { $gte: start, $lte: end },
  };

  let results;
  try {
    results = await Work.find(querry);
    console.log('\n*** getAllWorkByInterval, results:', results);
    res.json({ data: results, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.searchWork = async (req, res, next) => {
  const { userId, token } = req;
  const { q, projectId } = req.query;
  // console.log('\n### searchWork, userId:', userId);

  if (!q) {
    let allWork;
    try {
      allWork = await Work.find({ userId, projectId });
    } catch (err) {
      return next(err);
    }
    console.log('empty search:', allWork);
    return res.status(200).json({ data: allWork, token });
  }

  let matches;
  try {
    matches = await Work.find({ userId, projectId, $text: { $search: q } });
  } catch (err) {
    return next(err);
  }

  res.status(200).json({ data: matches, token });
};

const isVerb = (word) => {
  const posWords = new pos.Lexer().lex(word.replace("'", ''));
  const tagger = new pos.Tagger();
  const taggedWords = tagger.tag(posWords);
  console.log('*** taggedWords:', taggedWords);
  return taggedWords.length ? /VB/.test(taggedWords[0][1]) : false;
};

const generateNoteDoc = (word, n) => {
  let doc = word;

  for (let i = 0; i < n; i++) {
    doc += ' ' + word;
  }

  return doc;
};
module.exports.analyzeWorkNotes = async (req, res, next) => {
  const { userId } = req;
  const { notes, projectId } = req.body;

  if (!notes) {
    return res.status(200).json({ message: 'done!', keyTerms: [] });
  }

  console.log('*** notes:', notes);
  // console.log('*** userId:', userId);

  if (notes.split(' ').length < 3) {
    return res.status(200).json({ message: 'done!', keyTerms: [] });
  }
  const corpus = new tm.Corpus([]);
  const N_GRAM = 2;
  const FREQ_TERM_COUNT_THRESHOLD = 1;

  corpus.addDoc(generateNoteDoc('bajs', 20));
  corpus.addDoc(generateNoteDoc('bajs', 20));
  corpus.addDoc(generateNoteDoc('bajs', 20));
  corpus.addDoc(generateNoteDoc('bajs', 20));
  corpus.addDoc(notes);
  corpus.addDoc(notes);

  corpus
    .trim()
    .clean()
    .removeInterpunctuation()
    .removeWords([tm.STOPWORDS.EN, 'is', 'the', 'to'], true)
    .removeDigits()
    .removeInvalidCharacters()
    .removeNewlines()
    // .stem()
    .toLower();

  const terms = new tm.DocumentTermMatrix(corpus, N_GRAM);

  const keyTerms = terms
    .weighting(tm.weightTfIdf)
    .fill_zeros()
    .findFreqTerms(FREQ_TERM_COUNT_THRESHOLD)
    .filter((term) => isVerb(term.word))
    .sort((a, b) => b.count - a.count)
    .map((term) => ({
      value: term.word,
      displayName: term.word,
      count: term.count,
    }));

  // console.log('*** analyzeWorkNotes, corpus:', corpus);
  console.log('*** analyzeWorkNotes, keyTerms:', keyTerms);

  const suggestedTasks = await map(keyTerms, async (term) => {
    let foundTask;
    try {
      foundTask = await Task.findOne({
        userId,
        projects: { $in: projectId },
        value: term.value,
      });
    } catch (err) {
      console.error('Could not find task:', err);
      return next(err);
    }

    if (foundTask) return foundTask;
    return term;
  });

  res.status(200).json({ message: 'done!', suggestedTasks });
};
