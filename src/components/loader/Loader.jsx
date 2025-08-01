import React from "react";
// Custom Hook: is component mein Global Loader ka context use kar rahe hain
import { useGlobalLoader } from "../../context/LoaderContext";
import PADLoader from "../../assets/img/Loader-2-unscreen.gif";
import LoaderImage from "../../assets/img/PAD-Loader-Heading.png";
import style from "./Loader.module.css";

const Loader = () => {
  // useGlobalLoader() se hum isLoading state le rahe hain from context
  const { isLoading } = useGlobalLoader();

  // Agar loading nahi ho rahi (false), to component kuch bhi render nahi karega
  if (!isLoading) return null;

  return (
    <div className={style["body-loader"]}>
      <div className={style["body-loader-inner"]}>
        <div className={style["logo-loader-wrapper"]}>
          {/* Loader GIF show karega (animation) */}
          <img src={PADLoader} className={style["PAD_Loader"]} />

          {/* Heading image ya branding logo show karega */}
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
