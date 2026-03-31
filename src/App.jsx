import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DataIngestion from './pages/phase1/DataIngestion';
import EventsMonitor from './pages/phase1/EventsMonitor';
import KnowledgeBase from './pages/phase2/KnowledgeBase';
import AgentBrain from './pages/phase3/AgentBrain';
import Predictions from './pages/phase3/Predictions';
import Mitigation from './pages/phase4/Mitigation';
import Dashboard from './pages/phase5/Dashboard';
import Alerts from './pages/phase5/Alerts';
import Reports from './pages/phase5/Reports';
import FeedbackLoop from './pages/phase5/FeedbackLoop';
import ChatbotWidget from './components/ChatbotWidget';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-area">
          <TopBar />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/data-ingestion" element={<DataIngestion />} />
              <Route path="/events" element={<EventsMonitor />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/agent-brain" element={<AgentBrain />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/mitigation" element={<Mitigation />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/feedback" element={<FeedbackLoop />} />
            </Routes>
          </main>
        </div>
        <ChatbotWidget />
      </div>
    </Router>
  );
}

export default App;
