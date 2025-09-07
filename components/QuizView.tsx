import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { QuizQuestion } from '../types';
import { DownloadIcon } from './Icons';

interface QuizViewProps {
    quiz: QuizQuestion[];
}

const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const QuizView: React.FC<QuizViewProps> = ({ quiz }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [submitted, setSubmitted] = useState(false);

    const handleOptionChange = (questionIndex: number, option: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    const handleTryAgain = () => {
        setAnswers({});
        setSubmitted(false);
        setCurrentQuestionIndex(0);
    };
    
    const handleExport = () => {
        try {
            let quizContent = "AI Study Buddy - Quiz\n=====================\n\n";
            quiz.forEach((q, index) => {
                quizContent += `Question ${index + 1}: ${q.question}\n`;
                q.options.forEach((opt, optIndex) => {
                    quizContent += `  ${String.fromCharCode(65 + optIndex)}. ${opt}\n`;
                });
                quizContent += `Correct Answer: ${q.correctAnswer}\n\n`;
            });
            downloadFile(quizContent, 'quiz.txt', 'text/plain');
            toast.success('Quiz exported!');
        } catch (error) {
            console.error('Failed to export quiz:', error);
            toast.error('Could not export quiz.');
        }
    };

    const calculateScore = () => {
        return quiz.reduce((score, question, index) => {
            return answers[index] === question.correctAnswer ? score + 1 : score;
        }, 0);
    };

    if (!quiz || quiz.length === 0) {
        return <p>No quiz available.</p>;
    }

    if (submitted) {
        const score = calculateScore();
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">Quiz Results</h2>
                <p className="text-lg sm:text-xl mb-6">You scored <span className="font-bold text-white">{score}</span> out of <span className="font-bold text-white">{quiz.length}</span></p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
                    <button onClick={handleTryAgain} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors">
                        Try Again
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-slate-300 font-semibold rounded-lg shadow-sm hover:bg-slate-600 transition-colors"
                        aria-label="Export quiz as text file"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.length - 1;

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">Test Your Knowledge</h2>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                    <span className="text-slate-400 font-medium text-sm sm:text-base">Question {currentQuestionIndex + 1} of {quiz.length}</span>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-600 transition-colors"
                        aria-label="Export quiz as text file"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>
            <div className="flex-grow">
                <div className="bg-slate-900 p-4 sm:p-6 rounded-lg">
                    <p className="font-semibold text-base sm:text-lg mb-4 min-h-[3em]">{currentQuestion.question}</p>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, optIndex) => (
                            <label key={optIndex} className="flex items-center p-3 bg-slate-800 rounded-md cursor-pointer hover:bg-slate-700 transition-colors">
                                <input
                                    type="radio"
                                    name={`question-${currentQuestionIndex}`}
                                    value={option}
                                    checked={answers[currentQuestionIndex] === option}
                                    onChange={() => handleOptionChange(currentQuestionIndex, option)}
                                    className="form-radio h-5 w-5 text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-600"
                                />
                                <span className="ml-4 text-slate-300 text-sm sm:text-base">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-8 text-center flex-shrink-0">
                <button
                    onClick={isLastQuestion ? handleSubmit : handleNextQuestion}
                    disabled={!answers[currentQuestionIndex]}
                    className="w-full sm:w-auto px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLastQuestion ? 'Submit Answers' : 'Next Question'}
                </button>
            </div>
        </div>
    );
};