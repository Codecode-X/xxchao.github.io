// ============================================================
// App 主组件 - 路由配置
// ============================================================

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RoomCredentialsPage } from './pages/RoomCredentialsPage';
import { ParticipantConfirmationPage } from './pages/ParticipantConfirmationPage';
import { BasicInfoPage } from './pages/BasicInfoPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { SubmissionPage } from './pages/SubmissionPage';
import { AISettingsPage } from './pages/AISettingsPage';
import { AIProcessingPage, TerminatedPage, BFollowUpPage, BResultPage } from './pages/AIProcessingPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<HomePage />} />
      <Route path="/join" element={<HomePage />} />
      <Route path="/room/:roomCode/credentials" element={<RoomCredentialsPage />} />
      <Route path="/room/:roomCode/confirm" element={<ParticipantConfirmationPage />} />
      <Route path="/room/:roomCode/basic-info" element={<BasicInfoPage />} />
      <Route path="/room/:roomCode/questions/:round" element={<QuestionsPage />} />
      <Route path="/room/:roomCode/submit" element={<SubmissionPage />} />
      <Route path="/room/:roomCode/ai-settings" element={<AISettingsPage />} />
      <Route path="/room/:roomCode/ai-processing" element={<AIProcessingPage />} />
      <Route path="/room/:roomCode/terminated" element={<TerminatedPage />} />
      <Route path="/room/:roomCode/follow-up" element={<BFollowUpPage />} />
      <Route path="/room/:roomCode/result" element={<BResultPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}