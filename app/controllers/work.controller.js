const mongoose = require('mongoose');
const tm = require('text-miner');
const pos = require('pos');

const Work = require('../models/work.model');
const Project = require('../models/project.model');
const Task = require('../models/task.model');

module.exports.createWork = async (req, res, next) => {
  const { userId, token } = req;
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
   * Save new Task data
   */
  let newTasks;
  try {
    newTasks = await Promise.all(
      tasks.map(
        async (task) =>
          await new Task({
            userId,
            work: [newWork._id],
            projects: [newWork.project],
            displayName: task.displayName,
            value: task.value,
            description: task.description,
          }).save()
      )
    );
  } catch (err) {
    console.error(err);
    return next(err);
  }

  console.log('*** newTasks:', newTasks);

  res.json({ data: newWork, token });
};

module.exports.updateWork = async (req, res, next) => {
  const { userId, token } = req;
  const { workData } = req.body;
  const { workId } = req.params;

  console.log('\n*** workData:', workData);

  /**
   * Save new Task data
   */
  let newTasks;
  try {
    newTasks = await Promise.all(
      workData.tasks.map((task) =>
        new Task({
          userId,
          work: [workData._id],
          projects: [workData.project],
          displayName: task.displayName,
          value: task.value,
          description: task.description,
        }).save()
      )
    );
  } catch (err) {
    console.error(err);
    return next(err);
  }

  /**
   * Update Work document
   */
  let updatedWork;
  try {
    updatedWork = await Work.findOneAndUpdate(
      { _id: workId, userId },
      { ...workData, tasks: newTasks.map((task) => task._id) },
      {
        new: true,
      }
    );
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

  res.json({ data: updatedWork, token });
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
  const { notes } = req.body;

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
  // corpus.addDoc(notes);
  // corpus.addDoc(
  //   'This method can be used to prevent extra renders when a react component rapidly receives new props by delaying the triggering of the render until updates become less frequent. Doing so will improve the overall rendering time of the application, thus improving the user experience. It uses lodash debounce under the hood. Reach out to learn more about the web development NYC experts for the various ways to improve or build the quality of projects and across your company '
  // );
  // corpus.addDoc(
  //   'We can pass a corpus to the constructor DocumentTermMatrix in order to create a document-term-matrix or a term-document matrix. Objects derived from either share the same methods, but differ in how the underlying matrix is represented: A DocumentTermMatrix has documents on its rows and columns corresponding to words, whereas a TermDocumentMatrix has rows corresponding to words and columns to documents.'
  // );
  // corpus.addDoc(
  //   "Form validation errors. Should match the shape of your form's values defined in initialValues. If you are using validationSchema (which you should be), keys and shape will match your schema exactly. Internally, Formik transforms raw Yup validation errors on your behalf. If you are using validate, then that function will determine the errors objects shape."
  // );
  // corpus.addDoc(
  //   'You would have to declare several state or use array, you would have to offer the name of the field in the call to onChange. Always change the state at the right time, remember that the changes give rise to a new render.'
  // );

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
    .map((term) => ({ term: term.word, count: term.count }));

  console.log('*** analyzeWorkNotes, corpus:', corpus);
  console.log('*** analyzeWorkNotes, keyTerms:', keyTerms);

  res.status(200).json({ message: 'done!', keyTerms });
};
