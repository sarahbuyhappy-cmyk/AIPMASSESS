
import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Roadmap from './pages/Roadmap';
import Assessment from './pages/Assessment';
import Toolbox from './pages/Toolbox';
import Mentor from './pages/Mentor';
import { UserProvider } from './context/UserContext';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-slate-900">
               <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/toolbox" element={<Toolbox />} />
              <Route path="/mentor" element={<Mentor />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </UserProvider>
  );
};

export default App;
