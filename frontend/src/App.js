import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [jobDescription, setJobDescription] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setResumeFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jd', jobDescription);

        try {
            const res = await axios.post('http://localhost:5000/api/evaluate', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResponse(res.data);
        } catch (error) {
            console.error('Error submitting the form', error);
            setResponse('Error processing your request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Smart ATS</h1>
                <p>Improve Your Resume ATS</p>
            </header>
            <main className="App-main">
                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-group">
                        <label htmlFor="jd">Job Description:</label>
                        <textarea
                            id="jd"
                            placeholder="Paste the Job Description"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows="6"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="resume">Upload Resume (PDF):</label>
                        <input 
                            id="resume"
                            type="file" 
                            accept="application/pdf" 
                            onChange={handleFileChange}
                        />
                    </div>
                    <button type="submit" disabled={loading || !resumeFile || !jobDescription}>
                        {loading ? 'Processing...' : 'Submit'}
                    </button>
                </form>
                {response && (
                    <div className="response-container">
                        <h2>Analysis Results:</h2>
                        <pre>{JSON.stringify(JSON.parse(response), null, 2)}</pre>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;