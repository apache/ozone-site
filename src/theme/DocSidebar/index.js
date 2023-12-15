import React from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import styles from './index.module.css';

export default function DocSidebarWrapper(props) {
  return (
      <>
        <div className={styles.scrollCustom}>
        <div className={styles.customSidebarVersion}>
          <div className={styles.customSidebarInner}><span style={{ "display": "inline-block" }}>Version:</span> <DocsVersionDropdownNavbarItem dropdownItemsBefore={[]} dropdownItemsAfter={[]} /></div>
        </div>
        <div id={styles.sidebarCssSelector}>
          <DocSidebar {...props} />
        </div>
        </div>
      </>
  );
}
