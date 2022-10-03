import React from 'react';

import { TourProvider } from '@reactour/tour';
import Dashboard from './Dashboard';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

export default function DashboardPage() {
  const afterOpen = () => {
    document.body.style.overflowY = 'hidden';
  };
  const beforeClose = () => {
    document.body.style.overflowY = 'auto';
  };

  return (
    <AuthenticatedUserSubsidyPage>
      <TourProvider
        className="reactour"
        afterOpen={afterOpen}
        beforeClose={beforeClose}
        showButtons={false}
        showCloseButton={false}
        showNumber={false}
        showDots={false}
        showNavigationNumber={false}
        scrollSmooth
        inViewThreshold={{ x: 10, y: 1000 }}
        onClickMask={() => null}
        prevButton={(
          { currentStep, setCurrentStep },
        ) => (
          (currentStep !== 0) && (
            <button
              className="reactour-button reactour-button-prev"
              onClick={() => setCurrentStep(currentStep - 1)}
              type="button"
            >
              Back
            </button>
          )
        )}
        nextButton={(
          {
            currentStep, stepsLength, setCurrentStep, setIsOpen,
          },
        ) => (
          <button
            className="reactour-button reactour-button-next"
            type="button"
            onClick={() => {
              if (currentStep !== (stepsLength - 1)) {
                setCurrentStep(currentStep + 1);
              } else {
                setIsOpen(false);
              }
            }}
          >
            <span>{currentStep === (stepsLength - 1) ? 'Finish tutorial' : 'Next step'}</span>
          </button>
        )}
        styles={{
          popover: (base) => ({
            ...base,
            backgroundColor: 'transparent',
            color: 'white',
            boxShadow: 'none',
            width: 'auto',
            maxWidth: '100%',
            padding: '8px',
          }),
          badge: (base) => ({
            ...base,
            backgroundColor: 'transparent',
            color: 'transparent',
            boxShadow: 'none',
          }),
          maskWrapper: (base) => ({
            ...base,
            color: '#000000',
            opacity: 0.8,
          }),
        }}
      >
        <Dashboard />
      </TourProvider>
    </AuthenticatedUserSubsidyPage>
  );
}
