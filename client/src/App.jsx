import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import BoardPage from './pages/BoardPage.jsx';
import ItemPage from './pages/ItemPage.jsx';
import EditItemPage from './pages/EditItemPage.jsx';
import PostItemPage from './pages/PostItemPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RequireAuth from './components/RequireAuth.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<BoardPage />} />
          <Route path="/items/:id" element={<ItemPage />} />
          <Route path="/items/:id/edit" element={<RequireAuth><EditItemPage /></RequireAuth>} />
          <Route path="/post" element={<RequireAuth><PostItemPage /></RequireAuth>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}