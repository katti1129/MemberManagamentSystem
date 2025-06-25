import React, { useState, useEffect } from 'react';
import { Member, SessionMember } from '../types';
import { api } from '../services/api';
import { Users, Shuffle, X } from 'lucide-react';

interface SessionPageProps {
  members: Member[];
  onMembersChange: () => void;
}

export const SessionPage: React.FC<SessionPageProps> = ({ members, onMembersChange }) => {
  const [sessionMembers, setSessionMembers] = useState<SessionMember[]>([]);
  const [selectedQuestioners, setSelectedQuestioners] = useState<SessionMember[]>([]);
  const [showQuestionersModal, setShowQuestionersModal] = useState(false);

  useEffect(() => {
    setSessionMembers(
      members.map(member => ({
        ...member,
        isPresenter: false,
      }))
    );
  }, [members]);

  const handlePresenterToggle = (memberId: number) => {
    setSessionMembers(prev =>
      prev.map(member =>
        member.id === memberId
          ? { ...member, isPresenter: !member.isPresenter }
          : member
      )
    );
  };

  const selectQuestioners = () => {
    const audience = sessionMembers.filter(member => !member.isPresenter);
    if (audience.length < 3) {
      alert('質問者を3人選ぶには、聴講者が3人以上必要です。');
      return;
    }

    // Fisher-Yates shuffle algorithm
    const shuffled = [...audience];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const questioners = shuffled.slice(0, 3);
    setSelectedQuestioners(questioners);
    setShowQuestionersModal(true);
  };

  const presenters = sessionMembers.filter(member => member.isPresenter);
  const audience = sessionMembers.filter(member => !member.isPresenter);

  return (
    <div className="space-y-6">
      {/* Member Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          メンバー選択
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sessionMembers.map(member => (
            <label
              key={member.id}
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={member.isPresenter}
                onChange={() => handlePresenterToggle(member.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900">{member.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Session Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presenters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            発表者 ({presenters.length}名)
          </h3>
          <div className="space-y-2">
            {presenters.length > 0 ? (
              presenters.map(member => (
                <div
                  key={member.id}
                  className="p-3 bg-blue-50 rounded-lg text-center border border-blue-200"
                >
                  <span className="font-medium text-blue-900">{member.name}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                発表者が選択されていません
              </div>
            )}
          </div>
        </div>

        {/* Audience */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            聴講者 ({audience.length}名)
          </h3>
          <div className="space-y-2">
            {audience.length > 0 ? (
              audience.map(member => (
                <div
                  key={member.id}
                  className="p-3 bg-gray-50 rounded-lg text-center border"
                >
                  <span className="text-gray-900">{member.name}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                聴講者がいません
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Select Questioners Button */}
      <div className="text-center">
        <button
          onClick={selectQuestioners}
          disabled={audience.length < 3}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center mx-auto ${
            audience.length >= 3
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Shuffle className="w-5 h-5 mr-2" />
          質問者を3人選ぶ
        </button>
        {audience.length < 3 && (
          <p className="mt-2 text-sm text-gray-600">
            聴講者が3人以上必要です
          </p>
        )}
      </div>

      {/* Questioners Modal */}
      {showQuestionersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                選ばれた質問者
              </h3>
              <button
                onClick={() => setShowQuestionersModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              {selectedQuestioners.map((member, index) => (
                <div
                  key={member.id}
                  className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center"
                >
                  <span className="text-sm text-yellow-800 font-medium">
                    質問者 {index + 1}
                  </span>
                  <div className="text-lg font-semibold text-yellow-900 mt-1">
                    {member.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowQuestionersModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};