
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './views/HomeView';
import DesignStudio from './views/DesignStudio';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [designerStep, setDesignerStep] = useState<'upload' | 'analyzing' | 'result'>('upload');

  // Logic: Show standard Layout (Nav+Footer) on 'home' and 'upload'. 
  // Hide on 'analyzing' and 'result' (workspace mode).
  const showStandardLayout = currentPage === 'home' || (currentPage === 'designer' && designerStep === 'upload');

  return (
    <div className="min-h-screen bg-white">
      {showStandardLayout && <Navbar onNavigate={setCurrentPage} />}
      <main>
        {currentPage === 'home' && <HomeView onStart={() => setCurrentPage('designer')} />}
        {currentPage === 'designer' && (
          <DesignStudio onStepChange={setDesignerStep} />
        )}
        {currentPage === 'experience-centers' && (
          <div className="pt-32 text-center pb-20">
            <h1 className="text-3xl font-bold">Experience Centers</h1>
            <p className="mt-4 text-stone-600">Map integration coming soon.</p>
            <button onClick={() => setCurrentPage('home')} className="mt-8 text-orange-500 underline">Back Home</button>
          </div>
        )}
      </main>
      {showStandardLayout && <Footer />}
    </div>
  );
};

export default App;
