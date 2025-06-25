import React from 'react';
import { Users, UserCheck } from 'lucide-react';

interface NavigationProps {
  currentPage: 'session' | 'members';
  onPageChange: (page: 'session' | 'members') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  return (
    <nav className="bg-white shadow-md border-b-2 border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">
              ゼミ管理システム
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => onPageChange('session')}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'session'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                発表会セッション
              </button>
              <button
                onClick={() => onPageChange('members')}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'members'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                メンバー管理
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};