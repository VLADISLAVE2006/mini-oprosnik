const express = require('express');
const router = express.Router();

// Временное хранилище данных
let surveys = [
  { id: 1, title: 'Опрос об обучении', questions: 5, responses: 42, createdAt: new Date().toISOString() },
  { id: 2, title: 'Фидбек по курсу', questions: 3, responses: 18, createdAt: new Date().toISOString() }
];

// Middleware для валидации ID
const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  req.id = id;
  next();
};

// GET все опросы (с query параметрами)
router.get('/', (req, res) => {
  let result = [...surveys];
  
  // Фильтрация по query параметрам
  if (req.query.title) {
    result = result.filter(s => 
      s.title.toLowerCase().includes(req.query.title.toLowerCase())
    );
  }
  
  if (req.query.minResponses) {
    result = result.filter(s => 
      s.responses >= parseInt(req.query.minResponses)
    );
  }
  
  res.json(result);
});

// GET опрос по ID
router.get('/:id', validateId, (req, res) => {
  const survey = surveys.find(s => s.id === req.id);
  if (!survey) {
    return res.status(404).json({ error: 'Survey not found' });
  }
  res.json(survey);
});

// POST создать новый опрос
router.post('/', (req, res) => {
  const { title, questions } = req.body;
  
  if (!title || !questions) {
    return res.status(400).json({ 
      error: 'Title and questions count are required' 
    });
  }
  
  const newSurvey = {
    id: surveys.length > 0 ? Math.max(...surveys.map(s => s.id)) + 1 : 1,
    title,
    questions: parseInt(questions),
    responses: 0,
    createdAt: new Date().toISOString()
  };
  
  surveys.push(newSurvey);
  res.status(201).json(newSurvey);
});

// PUT обновить опрос
router.put('/:id', validateId, (req, res) => {
  const index = surveys.findIndex(s => s.id === req.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Survey not found' });
  }
  
  const { title, questions } = req.body;
  surveys[index] = {
    ...surveys[index],
    title: title || surveys[index].title,
    questions: questions || surveys[index].questions
  };
  
  res.json(surveys[index]);
});

// DELETE удалить опрос
router.delete('/:id', validateId, (req, res) => {
  const index = surveys.findIndex(s => s.id === req.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Survey not found' });
  }
  
  const deleted = surveys.splice(index, 1);
  res.json({ 
    message: 'Survey deleted successfully', 
    survey: deleted[0] 
  });
});

// GET статистика
router.get('/stats/summary', (req, res) => {
  const totalSurveys = surveys.length;
  const totalResponses = surveys.reduce((sum, s) => sum + s.responses, 0);
  const avgQuestions = surveys.reduce((sum, s) => sum + s.questions, 0) / totalSurveys || 0;
  
  res.json({
    totalSurveys,
    totalResponses,
    averageQuestions: avgQuestions.toFixed(1),
    mostPopular: surveys.length > 0 
      ? surveys.reduce((prev, current) => 
          prev.responses > current.responses ? prev : current
        ).title
      : 'No surveys yet'
  });
});

module.exports = router;