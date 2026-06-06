import { Routes, Route, Navigate } from "react-router-dom";
import { Cabina } from "./screens/Cabina";
import { Projects } from "./screens/Projects";
import { ProjectDetail } from "./screens/ProjectDetail";
import { Settings } from "./screens/Settings";
import { Costs } from "./screens/Costs";
import { Reports } from "./screens/Reports";
import { Tracker } from "./screens/Tracker";
import { Documents } from "./screens/Documents";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Cabina />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/costs" element={<Costs />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/tracker" element={<Tracker />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
