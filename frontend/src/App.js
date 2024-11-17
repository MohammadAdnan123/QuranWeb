import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import axios from 'axios';
import './App.css'; // Assuming you create a CSS file for styling

function App() {
    const [question, setQuestion] = useState('');
    const [fiqh, setFiqh] = useState('hanafi');
    const [displayedAnswer, setDisplayedAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [speechRecognition, setSpeechRecognition] = useState(null);
    const [canSpeak, setCanSpeak] = useState(false);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[event.resultIndex][0].transcript;
                setQuestion(transcript);
            };

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false); // Reset listening state on error
            };

            setSpeechRecognition(recognition);
        } else {
            console.error('Speech Recognition API not supported in this browser.');
        }
    }, []);

    const submitQuery = async () => {
        setLoading(true);
        setDisplayedAnswer('');
        setTyping(false);

        try {
            const response = await axios.post('/api/query', { question, fiqh });
            const answer = response.data.answer || "No answer found.";
            typeAnswer(answer);
            setQuestion('');
        } catch (error) {
            console.error("Error fetching answer:", error);
            setDisplayedAnswer("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const typeAnswer = (answer) => {
        let index = 0;
        const typingSpeed = 10;

        setTyping(true);
        setCanSpeak(false);

        const type = () => {
            if (index < answer.length) {
                setDisplayedAnswer((prev) => prev + answer.charAt(index));
                index++;
                setTimeout(type, typingSpeed);
            } else {
                setTyping(false);
                setCanSpeak(true);
            }
        };

        type();
    };

    const speakAnswer = (answer) => {
        const utterance = new SpeechSynthesisUtterance(answer);
        speechSynthesis.speak(utterance);
    };

    const startRecognition = () => {
        if (speechRecognition) {
            setQuestion(''); // Clear question before starting
            speechRecognition.start();
        }
    };

    return (
        <div className="app-container">
            <h1>Quran & Hadith Query</h1>

            {canSpeak && (
                <button onClick={() => speakAnswer(displayedAnswer)} className="speak-button">
                    🔊 Speak Answer
                </button>
            )}

            <div className="answer-box" dangerouslySetInnerHTML={{ __html: marked(displayedAnswer) }} />

            <div className="form-group">
                <label htmlFor="fiqh">Select your Fiqh:</label>
                <select
                    id="fiqh"
                    value={fiqh}
                    onChange={(e) => setFiqh(e.target.value)}
                    className="select-fiqh"
                >
                    <option value="hanafi">Hanafi</option>
                    <option value="shafi">Shafi'i</option>
                    <option value="maliki">Maliki</option>
                    <option value="hanbali">Hanbali</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="question">Ask your question:</label>
                <textarea
                    id="question"
                    rows="4"
                    cols="50"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="textarea-question"
                />
                <button 
                    onClick={startRecognition} 
                    className={`speech-button ${isListening ? 'listening' : ''}`} 
                >
                    {isListening ? '🔊 Listening...' : '🎤'}
                </button>
            </div>

            <button 
                onClick={submitQuery} 
                className="submit-button" 
                disabled={loading || typing}
            >
                {loading || typing ? 'Loading...' : 'Submit'}
            </button>
        </div>
    );
}

export default App;
