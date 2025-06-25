import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DemoNotice: React.FC = () => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <strong>注意：</strong>
          このデモ環境では、追加・削除したデータはブラウザのリロードや時間経過でリセットされることがあります。
        </div>
      </div>
    </div>
  );
};