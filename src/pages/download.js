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

import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// Helper function to format version information
function formatVersionRow(version, releaseDate, isSupported) {
  const versionNumber = version.replace('.md', '');
  return {
    version: versionNumber,
    releaseDate: releaseDate || 'Unknown',
    isSupported: isSupported,
    sourceDownload: {
      source: `https://www.apache.org/dyn/closer.cgi/ozone/${versionNumber}/ozone-${versionNumber}-src.tar.gz`,
      checksum: `https://downloads.apache.org/ozone/${versionNumber}/ozone-${versionNumber}-src.tar.gz.sha512`,
      signature: `https://downloads.apache.org/ozone/${versionNumber}/ozone-${versionNumber}-src.tar.gz.asc`
    },
    binaryDownload: {
      binary: `https://www.apache.org/dyn/closer.cgi/ozone/${versionNumber}/ozone-${versionNumber}.tar.gz`,
      checksum: `https://downloads.apache.org/ozone/${versionNumber}/ozone-${versionNumber}.tar.gz.sha512`,
      signature: `https://downloads.apache.org/ozone/${versionNumber}/ozone-${versionNumber}.tar.gz.asc`
    },
    releaseNotes: `/release-notes/${versionNumber}`,
    ozoneArchiveLink: `https://archive.apache.org/dist/ozone/${versionNumber}/`,
    hadoopArchiveLink: `https://archive.apache.org/dist/hadoop/ozone`
  };
}

// Release dates are loaded from the frontmatter of each release notes markdown files
export default function Downloads() {
  const {siteConfig} = useDocusaurusContext();
  
  // Get all markdown files from the release-notes directory
  const releaseNotesContext = require.context('../../src/pages/release-notes', false, /\.md$/);
  const releaseNotes = releaseNotesContext.keys().map(fileName => {
    const fileContent = releaseNotesContext(fileName);
    const versionNumber = fileName.replace('./', '').replace('.md', '');
    
    // Extract frontmatter data
    let isSupported = false;
    let releaseDate = 'Unknown';
    
    if (fileContent.frontMatter) {
      if (fileContent.frontMatter.supported_version !== undefined) {
        isSupported = fileContent.frontMatter.supported_version;
      }
      
      if (fileContent.frontMatter.release_date) {
        releaseDate = fileContent.frontMatter.release_date;
      }
    }
    
    return formatVersionRow(versionNumber, releaseDate, isSupported);
  });
  
  // Sort versions by version number (descending)
  releaseNotes.sort((a, b) => {
    return b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: 'base' });
  });
  
  // Helper function to check if version is less than 1.1.0
  const isLessThan110 = (version) => {
    return version.localeCompare('1.1.0', undefined, { numeric: true, sensitivity: 'base' }) < 0;
  };
  
  // Separate versions into three categories
  const supportedVersions = releaseNotes.filter(version => version.isSupported);
  const ozoneArchivedVersions = releaseNotes.filter(version => 
    !version.isSupported && !isLessThan110(version.version)
  );
  const hadoopArchivedVersions = releaseNotes.filter(version => 
    !version.isSupported && isLessThan110(version.version)
  );
  
  return (
    <Layout
      title="Downloads"
      description="Apache Ozone Downloads">
      <div className="container margin-vert--lg">
        <h1>Downloads</h1>
        
        <p>Apache Ozone is released as source code tarball. Binary tarballs are also provided for convenience. Both kinds of tarballs are distributed via mirror sites. They should be verified after download against checksums and signatures, available directly from Apache.</p>
        
        <h2>Supported Releases</h2>
        <p>Releases in the table are supported by the Apache Ozone community for security fixes. Other versions are not supported, but are available from the archives. </p>
        <table>
          <thead>
            <tr>
              <th>Version</th>
              <th>Release Date</th>
              <th>Source Download</th>
              <th>Binary Download</th>
              <th>Release Notes</th>
            </tr>
          </thead>
          <tbody>
            {supportedVersions.map((version) => (
              <tr key={version.version}>
                <td>{version.version}</td>
                <td>{version.releaseDate}</td>
                <td>
                  <a href={version.sourceDownload.source}>Source</a><br/>
                  <a href={version.sourceDownload.checksum}>Checksum</a><br/>
                  <a href={version.sourceDownload.signature}>Signature</a>
                </td>
                <td>
                  <a href={version.binaryDownload.binary}>Binary</a><br/>
                  <a href={version.binaryDownload.checksum}>Checksum</a><br/>
                  <a href={version.binaryDownload.signature}>Signature</a>
                </td>
                <td>
                  <a href={version.releaseNotes}>Release Notes</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <h2>Archived Releases</h2>
        
        <p>Older releases (1.1.0 and newer) are available in the Apache Ozone archives. Please note that these versions are no longer supported:</p>
        
        <table>
          <thead>
            <tr>
              <th>Version</th>
              <th>Release Date</th>
              <th>Release Notes</th>
              <th>Archive Link</th>
            </tr>
          </thead>
          <tbody>
            {ozoneArchivedVersions.map((version) => (
              <tr key={version.version}>
                <td>{version.version}</td>
                <td>{version.releaseDate}</td>
                <td>
                  <a href={version.releaseNotes}>Release Notes</a>
                </td>
                <td>
                  <a href={version.ozoneArchiveLink}>Archive Link</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <h2>Apache Hadoop Archives</h2>
        
        <p>Releases before 1.1.0 can be found in the Apache Hadoop archives. Please note that these versions are no longer supported:</p>
        
        <table>
          <thead>
            <tr>
              <th>Version</th>
              <th>Release Date</th>
              <th>Release Notes</th>
              <th>Archive Link</th>
            </tr>
          </thead>
          <tbody>
            {hadoopArchivedVersions.map((version) => (
              <tr key={version.version}>
                <td>{version.version}</td>
                <td>{version.releaseDate}</td>
                <td>
                  <a href={version.releaseNotes}>Release Notes</a>
                </td>
                <td>
                  <a href={version.hadoopArchiveLink}>Archive Link</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <h2>Download</h2>
        
        <ol>
          <li>Download the release <code>ozone-$&#123;OZONE_VERSION&#125;-src.tar.gz</code> from a <a href="https://www.apache.org/dyn/closer.cgi/ozone">mirror site</a>.</li>
          <li>Download signature or checksum from <a href="https://downloads.apache.org/ozone/">Apache</a>.</li>
        </ol>
        
        <h2>Verify</h2>
        
        <h3>GnuPG Signature</h3>
        
        <p>Download Ozone developers' public <a href="https://downloads.apache.org/ozone/KEYS">KEYS</a>.</p>
        
        <pre>
            <code>
                gpg --import KEYS
            </code>
        </pre>
        <pre>
            <code>
                gpg --verify ozone-$&#123;OZONE_VERSION&#125;-src.tar.gz.asc ozone-$&#123;OZONE_VERSION&#125;-src.tar.gz
            </code>
        </pre>

        <h3>SHA-512 Checksum</h3>
        
        <pre>
          <code>
            sha512sum -c ozone-$&#123;OZONE_VERSION&#125;-src.tar.gz.sha512
          </code>
        </pre>
        
        <h2>License</h2>
        
        <p><em>The software is licensed under <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache License 2.0</a></em></p>
      </div>
    </Layout>
  );
}