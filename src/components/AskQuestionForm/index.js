/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState } from 'react';
import styles from './styles.module.css';

export default function AskQuestionForm() {
  const [question, setQuestion] = useState('');
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateTitle = (value) => {
    if (!value.trim()) {
      return 'Question title is required';
    }
    if (value.trim().length < 10) {
      return 'Title should be at least 10 characters';
    }
    return '';
  };

  const validateQuestion = (value) => {
    if (!value.trim()) {
      return 'Question details are required';
    }
    if (value.trim().length < 20) {
      return 'Please provide more details (at least 20 characters)';
    }
    return '';
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    if (titleError) {
      setTitleError(validateTitle(value));
    }
  };

  const handleQuestionChange = (e) => {
    const value = e.target.value;
    setQuestion(value);
    if (questionError) {
      setQuestionError(validateQuestion(value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const titleValidationError = validateTitle(title);
    const questionValidationError = validateQuestion(question);
    
    setTitleError(titleValidationError);
    setQuestionError(questionValidationError);
    
    if (titleValidationError || questionValidationError) {
      // Focus the first field with an error
      if (titleValidationError) {
        document.getElementById('title').focus();
      } else {
        document.getElementById('question').focus();
      }
      return;
    }
    
    setIsSubmitting(true);
    
    // Create the GitHub Discussions URL with query parameters
    const baseUrl = 'https://github.com/apache/ozone/discussions/new';
    const category = 'faq ';
    const titleEncoded = encodeURIComponent(title);
    const bodyEncoded = encodeURIComponent(question);
    
    const redirectUrl = `${baseUrl}?category=${category}&title=${titleEncoded}&body=${bodyEncoded}`;
    
    // Redirect to GitHub Discussions with the pre-filled question
    window.location.href = redirectUrl;
  };

  return (
    <section className={styles.formContainer} aria-labelledby="ask-question-title">
      <h2 id="ask-question-title" className={styles.formTitle}>Ask a Question</h2>
      <p className={styles.formDescription}>Have a question about Apache Ozone? Fill out this form and we'll redirect you to GitHub Discussions with your question pre-filled.</p>
      
      <form onSubmit={handleSubmit} className={styles.form} noValidate aria-live="polite">
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Question Title:
            <span className={styles.requiredMark} aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            onBlur={() => setTitleError(validateTitle(title))}
            placeholder="Enter a title for your question"
            required
            aria-required="true"
            aria-invalid={!!titleError}
            aria-describedby={titleError ? "title-error" : undefined}
            className={`${styles.input} ${titleError ? styles.inputError : ''}`}
          />
          {titleError && (
            <div id="title-error" className={styles.errorMessage} role="alert">
              {titleError}
            </div>
          )}
          <div className={styles.fieldHint}>
            A clear, concise title helps others find your question
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="question" className={styles.label}>
            Your Question:
            <span className={styles.requiredMark} aria-hidden="true">*</span>
          </label>
          <textarea
            id="question"
            name="question"
            value={question}
            onChange={handleQuestionChange}
            onBlur={() => setQuestionError(validateQuestion(question))}
            placeholder="Describe your question in detail..."
            required
            aria-required="true"
            aria-invalid={!!questionError}
            aria-describedby={questionError ? "question-error" : undefined}
            className={`${styles.textarea} ${questionError ? styles.inputError : ''}`}
            rows={5}
          />
          {questionError && (
            <div id="question-error" className={styles.errorMessage} role="alert">
              {questionError}
            </div>
          )}
          <div className={styles.fieldHint}>
            Include relevant context, error messages, and what you've tried so far
          </div>
        </div>
        
        <div className={styles.submitGroup}>
          <button 
            type="submit" 
            className={styles.button}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Redirecting...' : 'Submit to GitHub Discussions'}
          </button>
          <p className={styles.submitNote}>
            Your question will be redirected to the official Apache Ozone GitHub Discussions board.
            A GitHub account is required to participate.
          </p>
        </div>
      </form>
    </section>
  );
}