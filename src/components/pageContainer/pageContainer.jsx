// src/components/layout/PageLayout.jsx
import React from "react";
import classNames from "classnames";
import styles from "./pagerContainer.module.css"; // CSS module for default styles

const PageLayout = ({ children, background = "white", className = "" }) => {
  return (
    <div
      className={classNames(
        styles.pageLayout,               // base container layout (padding, width, etc.)
        styles[`bg-${background}`],      // dynamic background style from CSS module
        styles[className]                        // any additional Tailwind/custom class
      )}
    >
      {children}
    </div>
  );
};

export default PageLayout;
