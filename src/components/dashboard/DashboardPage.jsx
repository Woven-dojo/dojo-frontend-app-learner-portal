import React from 'react';

import { TourProvider } from '@reactour/tour';
import Dashboard from './Dashboard';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';
import steps from './data/steps';

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
        steps={steps}
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
        prevButton={({ currentStep, setCurrentStep }) =>
          currentStep !== 0 && (
            <button
              className="reactour-button reactour-button-prev"
              onClick={() => setCurrentStep(currentStep - 1)}
              type="button"
            >
              Back
            </button>
          )
        }
        nextButton={({ currentStep, stepsLength, setCurrentStep, setIsOpen }) => (
          <button
            className="reactour-button reactour-button-next"
            type="button"
            onClick={() => {
              if (currentStep !== stepsLength - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                setIsOpen(false);
              }
            }}
          >
            <span>{currentStep === stepsLength - 1 ? 'Finish tutorial' : 'Next step'}</span>
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
        onTransition={() => {
          const MAX_TOP_POSITION = 162;
          const reactourElement = document.querySelector('.reactour');
          const reactourTransform = reactourElement.style.transform.match(/translate\((.*)px, (.*)px\)/);
          const left = reactourTransform[1];
          const top = reactourTransform[2];

          document.querySelector('.reactour').style.transform = `translate(${left}px, ${top}px)`;
          if (top <= MAX_TOP_POSITION) {
            document.querySelector('.reactour').style.transform = `translate(${left}px, ${MAX_TOP_POSITION}px)`;
          }
        }}
      >
        <Dashboard />
      </TourProvider>
    </AuthenticatedUserSubsidyPage>
  );
}
