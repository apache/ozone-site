---
sidebar_label: Ozone Enhancement Proposals
---

# Ozone Enhancement Proposals

For large features or changes, we use a process called "Ozone Enhancement Proposals" (OEPs)
to ensure that major modifications to Ozone are well-designed and have community consensus.

If you plan to propose a significant change, please follow the process below
and create a design document *before* you start coding.

**Note:** Design documents must be in Markdown format. We no longer accept PDFs or Google Docs.

## OEP Process

1. **Create a Jira:** Open a dedicated Jira ticket for the proposal. The ticket ID should start with the component prefix (e.g., `HDDS-`) and the title should be prefixed with `[OEP]`.
2. **Write the Design Doc:** Create the design document in Markdown format using the template below. Place the new file in the `hadoop-hdds/docs/content/design` directory.
3. **Submit a Pull Request:** Create a pull request to add the design document to the documentation.
4. **Discuss:** The community will discuss the proposal on the pull request. The discussion follows a lazy consensus model unless a formal vote is called.
5. **Update:** The design document can be updated based on feedback and changes during implementation.

## Document Template

The following is the proposed template for an OEP. While it is not mandatory to follow this exact structure,
your proposal should include the following sections. Some proposals may require a different structure
to best convey their design.

```markdown
---
title: A sample OEP template
summary: draft a proposal using this template
date: 2025-12-31
jira: HDDS-14298
status: implemented
author: Wei-Chiu Chuang
---
<!--
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. See accompanying LICENSE file.
-->

# Summary

Provide a one-sentence summary of the proposal, similar to a Jira title.
This will be displayed on the main documentation page and should be concise and informative.

# Status

Defined in the markdown header. Proposed statuses:

- accepted: (Use this as by default. If not accepted, won’t be merged)
- implemented: The discussed technical solution is implemented (maybe with some minor implementation difference)
- replaced: Replaced by a new design doc
- outdated: Code has been changed and design doc doesn’t reflect any more the state of the current code.

**Note:** Accepted but not-yet-implemented design documents will either be hidden
or placed in a dedicated "in-progress" section to clearly indicate that the feature
is not yet available.

# Problem statement (Motivation / Abstract)

What is the problem and how would you solve it? Think about an abstract of a paper: one paragraph overview.
Why will the world better with this change?

# Non-goals

Very important to define what is outside of the scope of this proposal.

# Technical Description (Architecture and implementation details)

Explain the problem in more details. How can it be reproduced? What is the current solution?
What is the limitation of the current solution?

How the new proposed solution would solve the problem? Architectural design.

Implementation details. What should be changed in the code. Is it a huge change?
Do we need to change wire protocol? Backward compatibility?

# Alternatives
What other alternatives were considered, and why is the proposed solution preferred?
The goal of this section is to help people understand why this is the best solution now,
and also to prevent churn in the future when old alternatives are reconsidered.

Note: In some cases 4/5 can be combined. For example if you have multiple proposals,
the first version may include multiple solutions. At the end ot the discussion we can move the alternatives to 5.
and explain why the community is decided to use the selected option.

# Plan
What is the plan for implementing this feature? What is the estimated effort? Does it require a feature branch,
a migration plan, or have other dependencies? This section can be a single sentence or omitted for minor features.

# References

```
