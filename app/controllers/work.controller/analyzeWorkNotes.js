const tm = require('text-miner');
const pos = require('pos');
const { map } = require('p-iteration');

const mongoose = require('mongoose');
const Task = mongoose.model('Task');

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

const analyzeWorkNotes = async (req, res, next) => {
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
    // .filter((term) => isVerb(term.word))
    .filter((term) => term.word !== 'bajs bajs')
    .sort((a, b) => b.count - a.count)
    .map((term) => ({
      value: term.word,
      displayName: term.word,
      count: term.count,
    }));

  // console.log('*** analyzeWorkNotes, corpus:', corpus);
  // console.log('*** analyzeWorkNotes, keyTerms:', keyTerms);

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

module.exports = analyzeWorkNotes;
