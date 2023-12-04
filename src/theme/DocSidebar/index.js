import React from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';

export default function DocSidebarWrapper(props) {
  return (
      <>
        <div className={"scroll-custom thin-scrollbar"}>
        <div className="custom-sidebar-version">
          <div className={"custom-sidebar-inner"}><span style={{ "display": "inline-block" }}>Version</span> <DocsVersionDropdownNavbarItem dropdownItemsBefore={[]} dropdownItemsAfter={[]} /></div>
        </div>
        <div id="sidebarCssSelector">
          <DocSidebar {...props} />
        </div>
        </div>
      </>
  );
}
