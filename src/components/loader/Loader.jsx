import React from "react";
import { useLoaderContext } from "../../context/LoaderContext";
import PADLoader from "../../assets/img/Loader-2-unscreen.gif";
import LoaderImage from "../../assets/img/PAD-Loader-Heading.png";
import style from "./Loader.module.css";

const Loader = () => {
  const { isLoading } = useLoaderContext();

  if (!isLoading) return null;

  return (
    <div className={style["body-loader"]}>
      <div className={style["body-loader-inner"]}>
        <div className={style["logo-loader-wrapper"]}>
          <img src={PADLoader} className={style["PAD_Loader"]} />
          <img
            src={LoaderImage}
            className={style["img-fluid"]}
            alt="Loading..."
          />
        </div>
      </div>
    </div>
  );
};

export default Loader;
