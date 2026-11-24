import { Navigate, Route, Routes } from 'react-router-dom';
import BriefingPage from './features/briefing/BriefingPage.jsx';
import CodespacePage from './features/codespace/CodespacePage.jsx';
import LandingPage from './features/landing/LandingPage.jsx';
import RecordPage from './features/record/RecordPage.jsx';
import ReviewPage from './features/review/ReviewPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sessions/:sessionId/briefing" element={<BriefingPage />} />
      <Route path="/sessions/:sessionId/workspace" element={<CodespacePage />} />
      <Route path="/sessions/:sessionId/review" element={<ReviewPage />} />
      <Route path="/records/:recordId" element={<RecordPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
