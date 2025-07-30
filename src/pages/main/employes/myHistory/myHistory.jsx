import React from "react";
import EmptyState from "../../../../components/emptyStates/empty-states";
import style from "./myHistory.module.css";
import { PageLayout } from "../../../../components";
const MyHistory = () => {
  return (
    <>
      <EmptyState type="Underdevelopment" />
      {/* <PageLayout background="white"></PageLayout> */}
    </>
  );
};

export default MyHistory;
