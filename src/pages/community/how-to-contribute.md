# How to Contribute to Apache Ozone

Thank you for your interest in contributing to Apache Ozone! This guide will help you understand the various ways you can contribute to the project and how to get started.

## Quick Links

- [GitHub Repository](https://github.com/apache/ozone)
- [CONTRIBUTING.md](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md) - Detailed contribution guidelines
- [Newbie Jira Issues](https://issues.apache.org/jira/issues/?jql=labels%20%3D%20newbie%20AND%20project%20%3D%20%22Apache%20Ozone%22%20AND%20status%20%3D%20open%20ORDER%20BY%20created) - Good first issues for new contributors
- [GitHub Discussions](https://github.com/apache/ozone/discussions) - Engage with the community
- [Ozone Website](../) - Project documentation
- [Slack Channel](http://s.apache.org/slack-invite) - Join #ozone on ASF Slack

## Ways to Contribute

Apache Ozone welcomes contributions in many forms, not just code. Here are various ways you can contribute:

### Code Contributions

#### Finding Issues to Work On

- **Newbie Issues**: Start with [beginner-friendly issues](https://issues.apache.org/jira/browse/HDDS-12179?jql=labels%20%3D%20newbie%20AND%20project%20%3D%20%22Apache%20Ozone%22%20AND%20status%20%3D%20open%20ORDER%20BY%20created) that are good entry points
- **All Open Issues**: Browse [unassigned Jira issues](https://issues.apache.org/jira/browse/HDDS-12179?jql=labels%20%3D%20newbie%20AND%20project%20%3D%20%22Apache%20Ozone%22%20AND%20status%20%3D%20open%20ORDER%20BY%20created) to find something that matches your interests and skills

#### Making Code Changes

1. **Set Up Development Environment**
   - Fork and clone the repository
   - Enable the `build-branch` GitHub Actions workflow in your fork

2. **Create a Branch**
   - Ensure a Jira issue exists for your task (e.g., HDDS-1234)
   - Create a branch for your work: `git checkout -b HDDS-1234`

3. **Develop Your Changes**
   - [Follow code style guidelines](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md#code-convention-and-tests)
   - Write tests for your changes
   - Run relevant checks from `hadoop-ozone/dev-support/checks/` directory

4. **Submit Your Contribution**
   - Push changes to your fork
   - Wait for the `build-branch` workflow to complete
   - Create a pull request following the template used. (PRs pushed to master first and then if needed to a release branch)
   - Update the Jira issue status to "Patch Available"
   - Once the PR is merged close the Jira if completely resolved.

### Reviewing Code and Design

Code reviews are a crucial part of the Apache Ozone development process. Reviewing others' code not only helps maintain quality but is also an excellent way to learn about the codebase.

#### How to Review Pull Requests

1. **Browse Open PRs**: Visit the [open pull requests](https://github.com/apache/ozone/pulls) on GitHub
2. **Choose PRs to Review**: Start with PRs in areas you're familiar with or interested in learning
3. **Run the Code**: When possible, check out the PR branch and test it locally
4. **Review Checklist**:
   - Does the code follow project style guidelines?
   - Are there sufficient tests for the new functionality?
   - Is the documentation updated?
   - Is the design sound and consistent with the rest of the codebase?
   - Does the code address the issue described in the linked Jira?

### Documentation

- **Website Improvements**: Contribute to the [Ozone website](../)
- **Developer Docs**: Enhance the [markdown documentation](https://github.com/apache/ozone/tree/master/hadoop-hdds/docs/content) in the source tree

### Testing

- **Unit Tests**: Write JUnit tests for Java code
- **Acceptance Tests**: Create Docker + Robot Framework tests
- **Application integration test**: Report any issues integrating with third party applications.
- **Performance Testing**: Run benchmarks with `ozone freon` and report findings

### Visual Design & Art

Ozone welcomes contributions in design and visual arts:

- **Logos and Icons**: Create variations of the Ozone logo for different contexts
- **Diagrams**: Design architectural and conceptual diagrams for documentation
- **Website Design**: Improve the look and feel of the Ozone website
- **Slide Decks**: Design templates for presentations about Ozone

Share your artwork through the [GitHub Discussions](https://github.com/apache/ozone/discussions) or on the dev mailing list dev@ozone.apache.org.

### Bug Reports and Feature Requests

- Report bugs or suggest features through [Jira](https://issues.apache.org/jira/projects/HDDS/)
- Search existing issues before creating a new one
- Provide detailed steps to reproduce bugs

### Community Support

- Answer questions on [GitHub Discussions](https://github.com/apache/ozone/discussions)
- Help review [pull requests](https://github.com/apache/ozone/pulls)
- Join community calls and discussions

## Getting Help

Details for how to [reach the community can be found here](communication-channels)

## Recognition

All contributions are recognized in Apache Ozone:

- Code contributions are recorded in Git history
- Documentation improvements help the entire community
- Testing helps ensure project quality
- Bug reports guide project improvement
- Evangelism: write blog posts, submit talks at conferences, commenting on social media

Your contributions, large or small, are valued and appreciated by the Ozone community!
