import React, { useEffect, useState } from "react";
import styles from "./boxCard.module.css";

const AnimatedCount = ({ value, className = "", style = {} }) => {
  const [digits, setDigits] = useState([]);

  useEffect(() => {
    // replace '.' with ',' before splitting into digits
    const formatted = String(value).replace(/\./g, ",").split("");
    setDigits(formatted);
  }, [value]);

  return (
    <div className={styles.counterWrapper}>
      {digits.map((digit, i) => (
        <div key={i} className={styles.digitWrapper}>
          {/^\d$/.test(digit) ? (
            <div
              className={styles.digitRoll}
              style={{ transform: `translateY(-${digit * 10}%)` }}
            >
              {Array.from({ length: 10 }, (_, n) => {
                return (
                  <div key={n} className={className} style={style}>
                    {n}
                  </div>
                );
              })}
            </div>
          ) : (
            <span
              key={i}
              className={`${styles.nonDigit} ${className}`}
              style={style}
            >
              {String(digit)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnimatedCount;
