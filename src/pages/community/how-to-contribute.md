# How to Contribute to Apache Ozone

Thank you for your interest in contributing to Apache Ozone! This guide will help you understand the various ways you can contribute to the project and how to get started.

## Quick Links

- [GitHub Repository](https://github.com/apache/ozone)
- [CONTRIBUTING.md](https://github.com/apache/ozone/blob/master/CONTRIBUTING.md) - Detailed contribution guidelines
- [Newbie Jira Issues](https://issues.apache.org/jira/issues/?filter=12353868) - Good first issues for new contributors
- [GitHub Discussions](https://github.com/apache/ozone/discussions) - Engage with the community
- [Ozone Website](https://ozone.apache.org/) - Project documentation
- [Slack Channel](http://s.apache.org/slack-invite) - Join #ozone on ASF Slack

## Ways to Contribute

Apache Ozone welcomes contributions in many forms, not just code. Here are various ways you can contribute:

### 1. Code Contributions

#### Finding Issues to Work On
- **Newbie Issues**: Start with [beginner-friendly issues](https://issues.apache.org/jira/issues/?filter=12353868) that are good entry points
- **All Open Issues**: Browse [unassigned Jira issues](https://s.apache.org/OzoneUnassignedJiras) to find something that matches your interests and skills

#### Making Code Changes
1. **Set Up Development Environment**
   - Fork and clone the repository
   - Enable the `build-branch` GitHub Actions workflow in your fork

2. **Create a Branch**
   - Ensure a Jira issue exists for your task (e.g., HDDS-1234)
   - Create a branch for your work: `git checkout -b HDDS-1234`

3. **Develop Your Changes**
   - Follow code style guidelines (2 spaces indentation, 120-char line length)
   - Write tests for your changes
   - Run relevant checks from `hadoop-ozone/dev-support/checks/` directory

4. **Submit Your Contribution**
   - Push changes to your fork
   - Wait for the `build-branch` workflow to complete
   - Create a pull request with a clear description
   - Update the Jira issue status to "Patch Available"

### 2. Documentation

- **Website Improvements**: Contribute to the [Ozone website](https://ozone.apache.org/) - see [instructions](https://cwiki.apache.org/confluence/display/OZONE/Modifying+the+Ozone+Website)
- **Developer Docs**: Enhance the [markdown documentation](https://github.com/apache/ozone/tree/master/hadoop-hdds/docs/content) in the source tree
- **Wiki Pages**: Update the [project wiki](https://cwiki.apache.org/confluence/display/OZONE) (request access through dev@ozone.apache.org)

### 3. Testing

- **Unit Tests**: Write JUnit tests for Java code
- **Acceptance Tests**: Create Docker + Robot Framework tests
- **Blockade Tests**: Develop Python + Blockade tests
- **Performance Testing**: Run benchmarks with `ozone freon` and report findings

### 4. Visual Design & Art

Ozone welcomes contributions in design and visual arts:

- **Logos and Icons**: Create variations of the Ozone logo for different contexts
- **Diagrams**: Design architectural and conceptual diagrams for documentation
- **Website Design**: Improve the look and feel of the Ozone website
- **Slide Decks**: Design templates for presentations about Ozone

Share your artwork through the [GitHub Discussions](https://github.com/apache/ozone/discussions) or on the dev mailing list dev@ozone.apache.org. 

### 5. Bug Reports and Feature Requests

- Report bugs or suggest features through [Jira](https://issues.apache.org/jira/projects/HDDS/)
- Search existing issues before creating a new one
- Provide detailed steps to reproduce bugs

### 6. Community Support

- Answer questions on [GitHub Discussions](https://github.com/apache/ozone/discussions)
- Help review pull requests
- Join community calls and discussions

## When to Use GitHub Discussions

The [GitHub Discussions](https://github.com/apache/ozone/discussions) platform is ideal for:

- **Q&A**: Technical questions about using Ozone
- **Ideas**: Suggesting new features or improvements before creating a Jira issue
- **Show and Tell**: Sharing your projects built with Ozone
- **Community Engagement**: General discussions about the project direction

For bug reports and concrete feature requests, please continue to use Jira. For code contributions, follow the pull request workflow.

## Getting Help

If you need assistance with your contribution, you can use the following channels:

### Join the Dev Mailing List

The dev mailing list is the primary communication channel for Ozone development discussions:

1. Send an email to [dev-subscribe@ozone.apache.org](mailto:dev-subscribe@ozone.apache.org)
2. You'll receive a confirmation email - reply to it to confirm your subscription
3. Once subscribed, you can send emails to [dev@ozone.apache.org](mailto:dev@ozone.apache.org)
4. To unsubscribe, send an email to [dev-unsubscribe@ozone.apache.org](mailto:dev-unsubscribe@ozone.apache.org)

You can also view the [mailing list archives](https://lists.apache.org/list.html?dev@ozone.apache.org) to see past discussions.

## When to Use GitHub Discussions

Alternative you can also use GitHub Discussions to get help and more.

The [GitHub Discussions](https://github.com/apache/ozone/discussions) platform is ideal for:

- **Q&A**: Technical questions about using Ozone
- **Ideas**: Suggesting new features or improvements before creating a Jira issue
- **Show and Tell**: Sharing your projects built with Ozone
- **Community Engagement**: General discussions about the project direction

For bug reports and concrete feature requests, please continue to use Jira. For code contributions, follow the pull request workflow.

### Other Communication Channels

- Join the #ozone channel on [ASF Slack](http://s.apache.org/slack-invite)
- Attend [weekly community calls](https://cwiki.apache.org/confluence/display/OZONE/Ozone+Community+Calls)

## Recognition

All contributions are recognized in Apache Ozone:

- Code contributions are recorded in Git history
- Documentation improvements help the entire community
- Testing helps ensure project quality
- Bug reports guide project improvement

Your contributions, large or small, are valued and appreciated by the Ozone community!
