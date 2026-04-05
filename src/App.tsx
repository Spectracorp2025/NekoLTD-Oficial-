import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Auth from './Auth';
import Layout from './Layout';
import Chat from './Chat';
import AdminPanel from './AdminPanel';
import Forums from './Forums';
import Ads from './Ads';
import Support from './Support';
import Info from './Info';
import Games from './Games';
import Accounts from './Accounts';
import Home from './Home';
import Loader from './Loader';
import VisualNovels from './VisualNovels';
import Apps from './Apps';
import Store from './Store';
import Streams from './Streams';

function MainContent() {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('home');

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Auth />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return <Home />;
      case 'accounts': return <Accounts />;
      case 'chat': return <Chat />;
      case 'games': return <Games />;
      case 'videogames': return <Games />;
      case 'novels': return <VisualNovels />;
      case 'apps': return <Apps />;
      case 'store': return <Store />;
      case 'streams': return <Streams />;
      case 'forums': return <Forums />;
      case 'support': return <Support />;
      case 'info': return <Info />;
      case 'ads': return <Ads />;
      case 'admin': return <AdminPanel />;
      default: return <Home />;
    }
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </Layout>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
