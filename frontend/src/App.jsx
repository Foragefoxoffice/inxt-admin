import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import BlogList from './pages/blogs/BlogList';
import BlogForm from './pages/blogs/BlogForm';
import WhitePaperList from './pages/whitePapers/WhitePaperList';
import WhitePaperForm from './pages/whitePapers/WhitePaperForm';
import WebinarList from './pages/webinars/WebinarList';
import WebinarForm from './pages/webinars/WebinarForm';
import NewsList from './pages/news/NewsList';
import NewsForm from './pages/news/NewsForm';
import CareerList from './pages/careers/CareerList';
import CareerForm from './pages/careers/CareerForm';
import NewsletterList from './pages/newsletter/NewsletterList';
import NewsletterIssueForm from './pages/newsletter/NewsletterIssueForm';
import LanguageList from './pages/languages/LanguageList';
import Settings from './pages/Settings';
import ChatbotManagement from './pages/chatbot/ChatbotManagement';
import ChatContentList from './pages/chatbot/ChatContentList';
import ChatContentForm from './pages/chatbot/ChatContentForm';

// Refresh
const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Protected admin routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="blogs" element={<BlogList />} />
                <Route path="blogs/new" element={<BlogForm />} />
                <Route path="blogs/:id/edit" element={<BlogForm />} />
                <Route path="white-papers" element={<WhitePaperList />} />
                <Route path="white-papers/new" element={<WhitePaperForm />} />
                <Route path="white-papers/:id/edit" element={<WhitePaperForm />} />
                <Route path="webinars" element={<WebinarList />} />
                <Route path="webinars/new" element={<WebinarForm />} />
                <Route path="webinars/:id/edit" element={<WebinarForm />} />
                <Route path="news" element={<NewsList />} />
                <Route path="news/new" element={<NewsForm />} />
                <Route path="news/:id/edit" element={<NewsForm />} />
                <Route path="careers" element={<CareerList />} />
                <Route path="careers/new" element={<CareerForm />} />
                <Route path="careers/:id/edit" element={<CareerForm />} />
                <Route path="newsletter" element={<NewsletterList />} />
                <Route path="newsletter/issues/new" element={<NewsletterIssueForm />} />
                <Route path="newsletter/issues/:id/edit" element={<NewsletterIssueForm />} />
                <Route
                  path="languages"
                  element={
                    <ProtectedRoute adminOnly>
                      <LanguageList />
                    </ProtectedRoute>
                  }
                />
                <Route path="chatbot" element={<ChatbotManagement />} />
                <Route path="chatbot/content" element={<ChatContentList />} />
                <Route path="chatbot/content/new" element={<ChatContentForm />} />
                <Route path="chatbot/content/:id/edit" element={<ChatContentForm />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
