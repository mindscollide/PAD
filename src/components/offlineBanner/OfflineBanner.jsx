// components/offlineBanner/OfflineBanner.jsx
import { useOnlineStatus } from "../../common/hooks/useOnlineStatus";
import style from "./offlineBanner.module.css";

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className={style.offlineBanner} role="alert">
      You Are Offline
    </div>
  );
};

export default OfflineBanner;
