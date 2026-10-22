import style from "./filter.module.css";
export const withFilterHeaderForType = (element) => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "32px",
      width: "100%",
    }}
  >
    {element}
  </div>
);
