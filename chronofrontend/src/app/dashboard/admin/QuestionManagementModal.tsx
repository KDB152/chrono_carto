'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileText,
  List,
  CheckSquare,
  Square,
  Type,
  Hash
} from 'lucide-react';
import { quizzesAPI } from '@/lib/api';

interface Question {
  id: number;
  quiz_id: number;
  question: string;
  type: 'multiple' | 'single' | 'text' | 'boolean';
  options?: string[];
  correct_answer?: string;
  explanation?: string;
}

interface QuestionManagementModalProps {
  quizId: number;
  quizTitle: string;
  onClose: () => void;
  onQuestionsUpdated: () => void;
}

const QuestionManagementModal: React.FC<QuestionManagementModalProps> = ({
  quizId,
  quizTitle,
  onClose,
  onQuestionsUpdated
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [quizId]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await quizzesAPI.getQuestions(quizId);
      setQuestions(response || []);
    } catch (error) {
      showNotification('error', 'Erreur lors du chargement des questions');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddQuestion = async (questionData: Partial<Question>) => {
    setIsLoading(true);
    try {
      await quizzesAPI.createQuestion({
        ...questionData,
        quiz_id: quizId
      });
      showNotification('success', 'Question ajoutée avec succès');
      setShowAddModal(false);
      loadQuestions();
      onQuestionsUpdated();
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'ajout de la question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQuestion = async (questionId: number, questionData: Partial<Question>) => {
    setIsLoading(true);
    try {
      await quizzesAPI.updateQuestion(questionId, questionData);
      showNotification('success', 'Question modifiée avec succès');
      setShowEditModal(false);
      setCurrentQuestion(null);
      loadQuestions();
      onQuestionsUpdated();
    } catch (error) {
      showNotification('error', 'Erreur lors de la modification de la question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    setIsLoading(true);
    try {
      await quizzesAPI.deleteQuestion(questionId);
      showNotification('success', 'Question supprimée avec succès');
      setShowDeleteModal(false);
      setCurrentQuestion(null);
      loadQuestions();
      onQuestionsUpdated();
    } catch (error) {
      showNotification('error', 'Erreur lors de la suppression de la question');
    } finally {
      setIsLoading(false);
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple': return <CheckSquare className="w-4 h-4" />;
      case 'single': return <Square className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'boolean': return <CheckCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple': return 'Choix multiple';
      case 'single': return 'Choix unique';
      case 'text': return 'Texte libre';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full h-full max-w-none max-h-none flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center">
              <FileText className="w-5 h-5 text-blue-300 mr-3" />
              Gestion des questions - {quizTitle}
            </h2>
            <p className="text-blue-200 mt-1">Ajoutez et gérez les questions de ce quiz</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une question</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-4 p-4 rounded-xl border ${
            notification.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-100' 
              : 'bg-red-500/20 border-red-500/30 text-red-100'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="p-6 flex-1 overflow-y-auto">
          {isLoading && questions.length === 0 ? (
            <div className="text-center py-6">
              <Loader2 className="w-5 h-5 text-blue-300 mx-auto mb-4 animate-spin" />
              <p className="text-blue-200">Chargement des questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-10 h-10 text-blue-300 mx-auto mb-4" />
              <p className="text-blue-200 text-base mb-2">Aucune question</p>
              <p className="text-blue-300 mb-3">Ajoutez votre première question pour commencer</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Ajouter une question
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2 text-blue-300">
                          {getQuestionTypeIcon(question.type)}
                          <span className="text-sm font-medium">{getQuestionTypeLabel(question.type)}</span>
                        </div>
                      </div>
                      <h3 className="text-white font-medium mb-3 text-base">
                        Question {index + 1}: {question.question}
                      </h3>
                      
                      {question.options && question.options.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-blue-200 mb-2 font-medium">Options:</p>
                          <ul className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <li key={optIndex} className="text-sm text-blue-300 flex items-center space-x-2 p-2 bg-white/5 rounded-lg">
                                <span className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-xs font-medium">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span className="flex-1">{option}</span>
                                {question.correct_answer === option && (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {question.correct_answer && (
                        <div className="mb-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <p className="text-sm text-blue-200">Réponse correcte: <span className="text-green-300 font-medium">{question.correct_answer}</span></p>
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="mb-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-sm text-blue-200">Explication: <span className="text-blue-300">{question.explanation}</span></p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setCurrentQuestion(question);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-yellow-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentQuestion(question);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Question Modal */}
        {showAddModal && (
          <QuestionFormModal
            onSave={handleAddQuestion}
            onClose={() => setShowAddModal(false)}
            isLoading={isLoading}
            title="Ajouter une question"
          />
        )}

        {/* Edit Question Modal */}
        {showEditModal && currentQuestion && (
          <QuestionFormModal
            question={currentQuestion}
            onSave={(data) => handleEditQuestion(currentQuestion.id, data)}
            onClose={() => {
              setShowEditModal(false);
              setCurrentQuestion(null);
            }}
            isLoading={isLoading}
            title="Modifier la question"
          />
        )}

        {/* Delete Question Modal */}
        {showDeleteModal && currentQuestion && (
          <DeleteQuestionModal
            question={currentQuestion}
            onConfirm={() => handleDeleteQuestion(currentQuestion.id)}
            onClose={() => {
              setShowDeleteModal(false);
              setCurrentQuestion(null);
            }}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

// Question Form Modal Component
interface QuestionFormModalProps {
  question?: Question;
  onSave: (data: Partial<Question>) => void;
  onClose: () => void;
  isLoading: boolean;
  title: string;
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  question,
  onSave,
  onClose,
  isLoading,
  title
}) => {
  const [formData, setFormData] = useState<Partial<Question>>({
    question: question?.question || '',
    type: question?.type || 'single',
    options: question?.options || ['', '', '', ''],
    correct_answer: question?.correct_answer || '',
    explanation: question?.explanation || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-base font-bold text-white flex items-center">
            <FileText className="w-5 h-5 text-blue-300 mr-3" />
            {title}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">Question *</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                required
                rows={3}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
                placeholder="Entrez votre question..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Type de question</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
              >
                <option value="single">Choix unique</option>
                <option value="multiple">Choix multiple</option>
                <option value="text">Texte libre</option>
              </select>
            </div>

          {(formData.type === 'single' || formData.type === 'multiple') && (
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">Options</label>
              <div className="space-y-2">
                {formData.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center space-x-2 px-3 py-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une option</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Réponse correcte *</label>
            {formData.type === 'boolean' ? (
              <select
                value={formData.correct_answer}
                onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
              >
                <option value="">Sélectionnez...</option>
              </select>
            ) : formData.type === 'text' ? (
              <input
                type="text"
                value={formData.correct_answer}
                onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
                placeholder="Entrez la réponse correcte..."
              />
            ) : (
              <select
                value={formData.correct_answer}
                onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
              >
                <option value="">Sélectionnez la réponse correcte...</option>
                {formData.options?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>


          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-white mb-2">Explication (optionnel)</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
              placeholder="Explication de la réponse correcte..."
            />
          </div>
        </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
              disabled={isLoading || !formData.question || !formData.correct_answer}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Question Modal Component
interface DeleteQuestionModalProps {
  question: Question;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

const DeleteQuestionModal: React.FC<DeleteQuestionModalProps> = ({
  question,
  onConfirm,
  onClose,
  isLoading
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Confirmer la suppression</h3>
              <p className="text-blue-200 text-sm">Cette action est irréversible</p>
            </div>
          </div>
          
          <p className="text-blue-200 mb-3">
            Êtes-vous sûr de vouloir supprimer la question <strong className="text-white">"{question.question}"</strong> ?
          </p>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionManagementModal;

