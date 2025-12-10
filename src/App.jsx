import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5001/api/surveys';

function App() {
  const [surveys, setSurveys] = useState([]);
  const [stats, setStats] = useState(null);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    questions: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('');
  const [minResponses, setMinResponses] = useState('');

  useEffect(() => {
    fetchSurveys();
    fetchStats();
  }, []);

  const fetchSurveys = async () => {
    try {
      const params = {};
      if (filter) params.title = filter;
      if (minResponses) params.minResponses = minResponses;
      
      const response = await axios.get(API_URL, { params });
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/summary`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, newSurvey);
      } else {
        await axios.post(API_URL, newSurvey);
      }
      setNewSurvey({ title: '', questions: '' });
      setEditingId(null);
      fetchSurveys();
      fetchStats();
    } catch (error) {
      console.error('Error saving survey:', error);
      alert(error.response?.data?.error || 'Error saving survey');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить этот опрос?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchSurveys();
        fetchStats();
      } catch (error) {
        console.error('Error deleting survey:', error);
      }
    }
  };

  const handleEdit = (survey) => {
    setEditingId(survey.id);
    setNewSurvey({
      title: survey.title,
      questions: survey.questions.toString()
    });
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>📋 Mini-Oprosnik</h1>
        <p>Система управления опросами (Express + React)</p>
      </header>

      <main className="main-content">
        {/* Статистика */}
        {stats && (
          <div className="stats-card">
            <h2>📊 Статистика</h2>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-value">{stats.totalSurveys}</span>
                <span className="stat-label">Всего опросов</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.totalResponses}</span>
                <span className="stat-label">Ответов</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.averageQuestions}</span>
                <span className="stat-label">Среднее вопросов</span>
              </div>
              <div className="stat">
                <span className="stat-value">🔥</span>
                <span className="stat-label">{stats.mostPopular}</span>
              </div>
            </div>
          </div>
        )}

        {/* Форма */}
        <div className="form-card">
          <h2>{editingId ? '✏️ Редактировать опрос' : '➕ Создать новый опрос'}</h2>
          <form onSubmit={handleSubmit} className="survey-form">
            <div className="form-group">
              <label htmlFor="title">Название опроса:</label>
              <input
                type="text"
                id="title"
                value={newSurvey.title}
                onChange={(e) => setNewSurvey({...newSurvey, title: e.target.value})}
                placeholder="Например: Опрос об обучении"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="questions">Количество вопросов:</label>
              <input
                type="number"
                id="questions"
                value={newSurvey.questions}
                onChange={(e) => setNewSurvey({...newSurvey, questions: e.target.value})}
                placeholder="Например: 5"
                min="1"
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Обновить' : 'Создать'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setNewSurvey({ title: '', questions: '' });
                  }}
                >
                  Отмена
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Фильтры */}
        <div className="filters-card">
          <h2>🔍 Фильтрация</h2>
          <div className="filters">
            <div className="filter-group">
              <label>По названию:</label>
              <input
                type="text"
                placeholder="Поиск..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onBlur={fetchSurveys}
              />
            </div>
            
            <div className="filter-group">
              <label>Мин. ответов:</label>
              <input
                type="number"
                placeholder="0"
                value={minResponses}
                onChange={(e) => setMinResponses(e.target.value)}
                onBlur={fetchSurveys}
              />
            </div>
            
            <button onClick={fetchSurveys} className="btn btn-filter">
              Применить фильтры
            </button>
          </div>
        </div>

        {/* Список опросов */}
        <div className="surveys-card">
          <div className="card-header">
            <h2>📝 Список опросов</h2>
            <button onClick={fetchSurveys} className="btn btn-refresh">
              Обновить
            </button>
          </div>
          
          {surveys.length === 0 ? (
            <p className="no-data">Опросы не найдены</p>
          ) : (
            <div className="surveys-grid">
              {surveys.map((survey) => (
                <div key={survey.id} className="survey-item">
                  <div className="survey-header">
                    <h3>{survey.title}</h3>
                    <span className="survey-id">ID: {survey.id}</span>
                  </div>
                  
                  <div className="survey-details">
                    <div className="detail">
                      <span className="label">Вопросов:</span>
                      <span className="value">{survey.questions}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Ответов:</span>
                      <span className="value">{survey.responses}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Создан:</span>
                      <span className="value">
                        {new Date(survey.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="survey-actions">
                    <button 
                      onClick={() => handleEdit(survey)}
                      className="btn btn-edit"
                    >
                      Редактировать
                    </button>
                    <button 
                      onClick={() => handleDelete(survey.id)}
                      className="btn btn-delete"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Примеры API */}
        <div className="api-examples">
          <h3>🛠️ Примеры API запросов:</h3>
          <pre>
{`GET    /api/surveys
GET    /api/surveys?title=обучение
GET    /api/surveys/1
POST   /api/surveys   {title, questions}
PUT    /api/surveys/1 {title, questions}
DELETE /api/surveys/1
GET    /api/surveys/stats/summary`}
          </pre>
        </div>
      </main>

      <footer className="footer">
        <p>Express + React • Мини-опросник • {new Date().getFullYear()}</p>
        <p className="tech-stack">
          <span>React</span> • 
          <span>Express</span> • 
          <span>REST API</span> • 
          <span>Custom Middleware</span>
        </p>
      </footer>
    </div>
  );
}

export default App;