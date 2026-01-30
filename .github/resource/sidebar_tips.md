# Documentation Sidebar Check Failed

Every docs directory must have a `README.mdx` file to configure how it is displayed in the documentation sidebar. This file must contain a generated index of pages in the section by adding the following lines:

1. Add `import DocCardList from '@theme/DocCardList';` anywhere in the _README.mdx_ file.
2. Add the `<DocCardList/>` tag at the end of the file.

For more information on documentation sidebar configuration, see the [contributing guide](https://github.com/apache/ozone-site/blob/HDDS-9225-website-v2/CONTRIBUTING.md#documentation-sidebar).
