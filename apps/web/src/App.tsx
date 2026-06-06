import { Routes, Route, Navigate } from "react-router-dom";
import { Cabina } from "./screens/Cabina";
import { Projects } from "./screens/Projects";
import { ProjectDetail } from "./screens/ProjectDetail";
import { Settings } from "./screens/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Cabina />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
