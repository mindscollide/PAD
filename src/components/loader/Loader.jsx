import React, { useEffect, useState } from "react";
import PADLoader from "../../assets/img/Loader-2-unscreen.gif";
import LoaderImage from "../../assets/img/PAD-Loader-Heading.png"; // Make sure this path is correct
import style from "./Loader.module.css";

const Loader = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 225000); // 1 second
    return () => clearTimeout(timer); // Clean up timer
  }, []);

  if (!showLoader) return null;

  return (
    <div className={style["body-loader"]}>
      <div className={style["body-loader-inner"]}>
        <div className={style["logo-loader-wrapper"]}>
          <img src={PADLoader} width={200} className={style["PAD_Loader"]} />
          <img
            className={style["img-fluid"]}
            src={LoaderImage}
            alt="Loading..."
          />
        </div>
      </div>
    </div>
  );
};

export default Loader;
