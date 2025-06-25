import React, { useState } from 'react';
import { Member } from '../types';
import { api } from '../services/api';
import { UserPlus, Trash2, Users } from 'lucide-react';

interface MembersPageProps {
  members: Member[];
  onMembersChange: () => void;
}

export const MembersPage: React.FC<MembersPageProps> = ({ members, onMembersChange }) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await api.addMember(newMemberName.trim());
      setNewMemberName('');
      onMembersChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;

    try {
      await api.deleteMember(id);
      onMembersChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Member Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
          新しいメンバーを追加
        </h2>
        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="メンバー名を入力"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newMemberName.trim()}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isLoading || !newMemberName.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? '追加中...' : '追加'}
          </button>
        </form>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          登録メンバー ({members.length}名)
        </h2>
        {members.length > 0 ? (
          <div className="space-y-3">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-gray-900 font-medium">{member.name}</span>
                  <div className="text-sm text-gray-500 mt-1">
                    登録日: {new Date(member.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMember(member.id, member.name)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">登録されているメンバーがいません</p>
          </div>
        )}
      </div>
    </div>
  );
};