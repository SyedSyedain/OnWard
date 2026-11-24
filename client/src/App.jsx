import { Navigate, Route, Routes } from 'react-router-dom';
import BriefingPage from './features/briefing/BriefingPage.jsx';
import CodespacePage from './features/codespace/CodespacePage.jsx';
import LandingPage from './features/landing/LandingPage.jsx';
import ProfilePage from './features/profile/ProfilePage.jsx';
import RecordPage from './features/record/RecordPage.jsx';
import ReviewPage from './features/review/ReviewPage.jsx';
import ServerWakeNotice from './components/ui/ServerWakeNotice.jsx';

export default function App() {
  return (
    <>
      <ServerWakeNotice />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sessions/:sessionId/briefing" element={<BriefingPage />} />
        <Route path="/sessions/:sessionId/workspace" element={<CodespacePage />} />
        <Route path="/sessions/:sessionId/review" element={<ReviewPage />} />
        <Route path="/records/:recordId" element={<RecordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
