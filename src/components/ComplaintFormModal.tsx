import React from 'react';
import { BidangType, Complaint, OfficerConfig } from '../types';
import { BIDANG_LIST } from '../data/constants';
import { ComplaintForm } from './ComplaintForm';
import { X, FileText, Award, Database } from 'lucide-react';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBidang: BidangType;
  officerConfig: OfficerConfig;
  onSubmitSuccess: (complaint: Complaint, waLink: string) => void;
}

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  selectedBidang,
  officerConfig,
  onSubmitSuccess
}) => {
  if (!isOpen) return null;

  const currentBidangInfo = BIDANG_LIST.find(b => b.id === selectedBidang) || BIDANG_LIST[0];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-5 h-5 text-amber-300" />;
      case 'Award': return <Award className="w-5 h-5 text-amber-300" />;
      case 'Database': return <Database className="w-5 h-5 text-amber-300" />;
      default: return <FileText className="w-5 h-5 text-amber-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in duration-200 my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 md:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0">
              {getIcon(currentBidangInfo.iconName)}
            </div>
            <div>
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit mb-1">
                Formulir Pengaduan Modal Popup
              </span>
              <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                {currentBidangInfo.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors border border-slate-700"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          <ComplaintForm
            selectedBidang={selectedBidang}
            officerConfig={officerConfig}
            onSubmitSuccess={(complaint, waLink) => {
              onClose();
              onSubmitSuccess(complaint, waLink);
            }}
          />
        </div>
      </div>
    </div>
  );
};
