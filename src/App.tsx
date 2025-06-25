import React, { useState, useEffect } from 'react';
import { Member } from './types';
import { api } from './services/api';
import { Navigation } from './components/Navigation';
import { DemoNotice } from './components/DemoNotice';
import { SessionPage } from './components/SessionPage';
import { MembersPage } from './components/MembersPage';
import { AlertCircle } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<'session' | 'members'>('session');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    try {
      setError('');
      const data = await api.getMembers();
      setMembers(data);
    } catch (err) {
      setError('メンバーの取得に失敗しました。サーバーが起動していることを確認してください。');
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DemoNotice />
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {currentPage === 'session' ? (
          <SessionPage members={members} onMembersChange={fetchMembers} />
        ) : (
          <MembersPage members={members} onMembersChange={fetchMembers} />
        )}
      </main>
    </div>
  );
}

export default App;