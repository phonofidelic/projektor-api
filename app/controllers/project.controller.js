const tm = require('text-miner');
const WordPOS = require('wordpos');
const pos = require('pos');
const Project = require('../models/project.model');
const {
  ACTIVE,
  COMPLETE,
  ARCHIVED,
  DELETED,
} = require('../../constants').STATUS;

module.exports.createProject = async (req, res, next) => {
  const { userId, token } = req;

  const {
    title,
    color,
    description,
    client,
    budgetedTime,
    startDate,
    deadline,
  } = req.body;

  let newProject;
  try {
    newProject = await new Project({
      userId,
      created: Date.now(),
      title,
      color,
      description,
      client,
      budgetedTime,
      startDate,
      deadline,
    }).save();

    res.status(200).json({ data: newProject, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.getProjects = async (req, res, next) => {
  const { userId, token } = req;
  console.log('====================================');
  console.log('getProjects, req.query:', req.query);
  console.log('====================================');

  let projects;
  try {
    projects = await Project.find({ userId });

    res.json({ data: projects, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.getProject = async (req, res, next) => {
  const { userId, token } = req;

  const { projectId } = req.params;

  let project;
  try {
    project = await Project.findOne({ userId, _id: projectId }).populate({
      path: 'work',
    });
    res.json({ data: project, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.editProject = async (req, res, next) => {
  const { userId, token } = req;
  const { projectId } = req.params;
  const { projectInfo } = req.body;

  console.log('====================================');
  console.log('*** editProject, projectInfo:', projectInfo);
  console.log('====================================');

  let updatedProject;
  try {
    updatedProject = await Project.findOneAndUpdate(
      { userId, _id: projectId },
      projectInfo,
      { new: true }
    );
    console.log('*** editProject, updatedProject:', updatedProject);
    res.json({ data: updatedProject, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.setProjectStatus = async (req, res, next) => {
  const { userId, token } = req;
  const { projectId, status } = req.body;

  let project;
  try {
    project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { status },
      { new: true }
    );

    res.json({ data: project._id, token });
  } catch (err) {
    return next(err);
  }
};

module.exports.deleteProject = async (req, res, next) => {
  const { userId, token } = req;
  const { projectId } = req.params;

  let deletedProject;
  try {
    deletedProject = await Project.findOneAndDelete({
      _id: projectId,
      userId,
      status: DELETED,
    });

    res.json({ data: deletedProject._id, token });
  } catch (err) {
    return next(err);
  }
};

module.exports.deleteAllTrash = async (req, res, next) => {
  const { userId, token } = req;

  let deletedProjects;
  try {
    deletedProjects = await Project.deleteMany({ userId, status: DELETED });

    res.json({ data: deletedProjects, token });
  } catch (err) {
    return next(err);
  }
};

module.exports.searchProjects = async (req, res, next) => {
  const { userId, token } = req;
  const { q } = req.query;
  // console.log('\n### searchProjects, userId:', userId);

  if (!q) {
    let allProjects;
    try {
      allProjects = await Project.find({ userId });
    } catch (err) {
      return next(err);
    }
    return res.status(200).json({ data: allProjects, token });
  }

  let matches;
  try {
    matches = await Project.find({ userId, $text: { $search: q } });
  } catch (err) {
    return next(err);
  }

  res.status(200).json({ data: matches, token });

  // res.status(200).json({ data: [], token });
};

module.exports.findKeyTasks = async (req, res, next) => {
  const { userId, token } = req;
  const { projectId } = req.params;

  console.log('*** findKeyTasks, projectId:', projectId);

  let project;
  try {
    project = await Project.findOne({
      // userId,
      _id: projectId,
    }).populate({ path: 'work' });
  } catch (err) {
    return next(err);
  }

  if (project.work.length < 1) {
    return res.status(200).json({
      message: 'No work items found for this Project',
      token,
      data: [],
    });
  }

  const corpus = new tm.Corpus([]);
  const N_GRAM = 2;
  const FREQ_TERM_COUNT_THRESHOLD = 1;

  project.work.forEach((workItem) => {
    const notes = workItem.notes || '';
    corpus.addDoc(notes);
  });

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

  const isVerb = (word) => {
    const posWords = new pos.Lexer().lex(word.replace("'", ''));
    const tagger = new pos.Tagger();
    const taggedWords = tagger.tag(posWords);
    // console.log('*** taggedWords:', taggedWords);
    return /VB/.test(taggedWords[0][1]);
  };

  const terms = new tm.DocumentTermMatrix(corpus, N_GRAM);
  // console.log('*** findKeyTasks, vocabulary:', terms.vocabulary);

  const keyTerms = terms
    .weighting(tm.weightTfIdf)
    .fill_zeros()
    .findFreqTerms(FREQ_TERM_COUNT_THRESHOLD)
    .filter((term) => isVerb(term.word))
    .sort((a, b) => b.count - a.count)
    .map((term) => ({ term: term.word, count: term.count }));

  console.log('*** findKeyTasks, keyTerms:', keyTerms);

  res.status(200).json({ message: 'Done!', token, data: keyTerms });
};
