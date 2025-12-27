import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import CreateCoursePage from './pages/CreateCoursePage';
import AdminDashboard from './pages/AdminDashboard';
import ManageCourseContent from './pages/ManageCourseContent';
import StudentCourseViewer from './pages/StudentCourseViewer';
import MyCoursesPage from './pages/MyCoursesPage';
import StudentAssessments from './pages/StudentAssessments';
import TakeAssessment from './pages/TakeAssessment';
import AssessmentManager from './pages/AssessmentManager';
import AssessmentSubmissions from './pages/AssessmentSubmissions';
import StudentActivity from './pages/StudentActivity';
import AIAnalyticsPage from './pages/AIAnalyticsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirection automatique de la racine vers le login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Nos routes d'authentification */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Route pour le dashboard après connexion */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/create-course" element={<CreateCoursePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manage-content/:courseId" element={<ManageCourseContent />} />
        <Route path="/course/:courseId/learn" element={<StudentCourseViewer />} />
        <Route path="/my-courses" element={<MyCoursesPage />} />
        <Route path="/assessments/:courseId" element={<StudentAssessments />} />
        <Route path="/assessment/:assessmentId/take" element={<TakeAssessment />} />
        <Route path="/admin/assessments" element={<AssessmentManager />} />
        <Route path="/admin/assessment/:assessmentId/submissions" element={<AssessmentSubmissions />} />
        <Route path="/activities" element={<StudentActivity />} />
        <Route path="/ai-analytics" element={<AIAnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Page 404 simple */}
        <Route path="*" element={<div className="p-10 text-center">Page non trouvée</div>} />
      </Routes>
    </Router>
  );
}

export default App;