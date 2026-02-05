import React, { useState } from 'react';
import Layout from './components/Layout';
import Intro from './modules/Intro';
import PhysicsLab from './modules/PhysicsLab';
import ComparisonLab from './modules/ComparisonLab';
import CostDashboard from './modules/CostDashboard';
import ApplicationsExplorer from './modules/ApplicationsExplorer';
import { ModuleType, ScenarioType } from './types';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.INTRO);
  const [activeScenario, setActiveScenario] = useState<ScenarioType>(ScenarioType.HIGHWAY);

  const handleStart = () => setActiveModule(ModuleType.PHYSICS);

  const renderModule = () => {
    switch (activeModule) {
      case ModuleType.INTRO:
        return <Intro onStart={handleStart} />;
      case ModuleType.PHYSICS:
        return (
          <PhysicsLab 
            activeScenario={activeScenario} 
            setScenario={setActiveScenario}
            onNext={() => setActiveModule(ModuleType.COMPARISON)} 
          />
        );
      case ModuleType.COMPARISON:
        return (
            <ComparisonLab 
                activeScenario={activeScenario}
                onNext={() => setActiveModule(ModuleType.DASHBOARD)}
            />
        );
      case ModuleType.DASHBOARD:
        return (
            <CostDashboard 
                onNext={() => setActiveModule(ModuleType.EXPLORER)}
            />
        );
      case ModuleType.EXPLORER:
        return (
            <ApplicationsExplorer 
                setScenario={setActiveScenario}
                goToPhysics={() => setActiveModule(ModuleType.PHYSICS)}
                onReset={() => setActiveModule(ModuleType.INTRO)}
            />
        );
      default:
        return <Intro onStart={handleStart} />;
    }
  };

  return (
    <Layout 
      activeModule={activeModule} 
      activeScenario={activeScenario}
      setModule={setActiveModule}
    >
      <div className="w-full h-full transition-opacity duration-500 ease-in-out">
        {renderModule()}
      </div>
    </Layout>
  );
};

export default App;
