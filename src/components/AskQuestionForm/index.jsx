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

import { useState } from "react";
import styles from "./styles.module.css";
import Heading from "@theme/Heading";

export default function AskQuestionForm() {
  const [question, setQuestion] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create the GitHub Discussions URL with query parameters
    const baseUrl = "https://github.com/apache/ozone/discussions/new";
    const category = "faq ";
    const titleEncoded = encodeURIComponent(title);
    const bodyEncoded = encodeURIComponent(question);

    const redirectUrl = `${baseUrl}?category=${category}&title=${titleEncoded}&body=${bodyEncoded}`;

    // Redirect to GitHub Discussions with the pre-filled question
    window.location.href = redirectUrl;
  };

  return (
    <div className={styles.formContainer}>
      <Heading as="h2" className={styles.formTitle}>
        Ask a Question
      </Heading>
      <p className={styles.formDescription}>
        Have a question about Apache Ozone? Fill out this form and we'll
        redirect you to GitHub Discussions with your question pre-filled.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Question Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your question"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="question" className={styles.label}>
            Your Question:
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Describe your question in detail..."
            required
            className={styles.textarea}
            rows={5}
          />
        </div>

        <div className={styles.submitGroup}>
          <button type="submit" className={styles.button}>
            Submit to GitHub Discussions
          </button>
          <p className={styles.submitNote}>
            Your question will be redirected to the official Apache Ozone GitHub
            Discussions board. A GitHub account is required to participate.
          </p>
        </div>
      </form>
    </div>
  );
}
