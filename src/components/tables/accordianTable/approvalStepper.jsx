import React from 'react';
import { Steps } from 'antd';
import styles from './ApprovalStepper.module.css';

const { Step } = Steps;

const ApprovalStepper = ({ trail }) => {
  // Transform your trail data to match the image structure
  const formattedSteps = trail.map((step, index) => {
    let status, title, subTitle;
    
    if (step.status.includes('by')) {
      const [action, person] = step.status.split(' by ');
      title = `${action} by`;
      subTitle = person;
    } else {
      title = step.status;
    }
    
    return {
      key: index,
      status: step.status.includes('Declined') ? 'error' : 
              step.status.includes('Approved') ? 'finish' : 'process',
      icon: step.icon,
      title,
      subTitle,
      date: step.date,
    };
  });

  return (
    <div className={styles.stepperContainer}>
      <Steps direction="horizontal" current={trail.length - 1}>
        {formattedSteps.map((step) => (
          <Step
            key={step.key}
            status={step.status}
            icon={<span className={styles.stepIcon}>{step.icon}</span>}
            title={
              <div className={styles.stepTitle}>
                <span className={styles.actionType}>{step.title}</span>
                {step.subTitle && (
                  <span className={styles.approverName}> {step.subTitle}</span>
                )}
              </div>
            }
            description={
              <div className={styles.stepDate}>{step.date}</div>
            }
          />
        ))}
      </Steps>
    </div>
  );
};

export default ApprovalStepper;