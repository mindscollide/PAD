import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingSpinner = ({
  size = 'default', // 'small', 'default', 'large'
  tip = '', // Optional loading text
  fullPage = false, // Whether to cover full page
  customIcon = null, // Custom icon element
  delay = 0 // Delay in milliseconds
}) => {
  // Default spinning icon
  const antIcon = customIcon || <LoadingOutlined style={{ fontSize: 24 }} spin />;
  
  const spinnerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: fullPage ? '100vh' : '100%',
    width: fullPage ? '100vw' : '100%',
    position: fullPage ? 'fixed' : 'relative',
    top: 0,
    left: 0,
    backgroundColor: fullPage ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
    zIndex: fullPage ? 9999 : 'auto'
  };

  return (
    <div style={spinnerStyle}>
      <Spin 
        size={size}
        tip={tip}
        indicator={antIcon}
        delay={delay}
      />
    </div>
  );
};

export default LoadingSpinner;