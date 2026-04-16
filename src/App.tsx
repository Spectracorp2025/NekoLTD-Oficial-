import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Auth from './Auth';
import Layout from './Layout';
import Games from './Games';
import Accounts from './Accounts';
import Home from './Home';
import Loader from './Loader';
import VisualNovels from './VisualNovels';
import Apps from './Apps';
import Store from './Store';
import Streams from './Streams';
import SocialNetworks from './SocialNetworks';
import AdminPanel from './AdminPanel';
import Ads from './Ads';
import Support from './Support';
import Info from './Info';

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
      case 'videogames': return <Games />;
      case 'novels': return <VisualNovels />;
      case 'apps': return <Apps />;
      case 'store': return <Store />;
      case 'streams': return <Streams />;
      case 'social-networks': return <SocialNetworks />;
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
