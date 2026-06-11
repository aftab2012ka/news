import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";

import Header from "./components/Header";
import CategoryNav from "./components/CategoryNav";
import BreakingTicker from "./components/BreakingTicker";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNews from "./pages/admin/AdminNews";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";

import "./App.css";

const PublicLayout = ({ children }) => (
  <>
    <BreakingTicker />
    <Header />
    <CategoryNav />
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster richColors position="top-right" />
            <Routes>
              {/* Public site */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/article/:id" element={<PublicLayout><ArticlePage /></PublicLayout>} />
              <Route path="/category/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
              <Route path="/search" element={<PublicLayout><SearchPage /></PublicLayout>} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedRoute roles={["admin", "editor", "reporter"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute roles={["admin"]}><AdminSettings /></ProtectedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
