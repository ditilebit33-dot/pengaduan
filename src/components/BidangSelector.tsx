import React from 'react';
import { BidangType } from '../types';
import { BIDANG_LIST } from '../data/constants';
import { FileText, Award, Database, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface BidangSelectorProps {
  selectedBidang: BidangType;
  onSelectBidang: (bidang: BidangType) => void;
}

export const BidangSelector: React.FC<BidangSelectorProps> = ({
  selectedBidang,
  onSelectBidang
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-6 h-6" />;
      case 'Award': return <Award className="w-6 h-6" />;
      case 'Database': return <Database className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <div className="mb-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="bg-blue-100/80 text-blue-900 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border border-blue-200/80 shadow-sm mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Pilih Kategori Bidang Pengaduan
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Layanan Pengaduan 3 Bidang Utama
        </h2>
        <p className="text-slate-600 text-xs md:text-sm mt-1.5 leading-relaxed">
          Pilih kategori bidang pengaduan di bawah ini untuk membuka <strong>Formulir Modal Pengaduan</strong> yang terhubung langsung ke WhatsApp Pejabat terkait.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BIDANG_LIST.map((bidang) => {
          const isSelected = selectedBidang === bidang.id;
          return (
            <div
              key={bidang.id}
              onClick={() => onSelectBidang(bidang.id)}
              className={`group relative cursor-pointer rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
                isSelected
                  ? 'bg-white border-blue-600 shadow-xl ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-lg'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1 shadow-sm">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}

              <div>
                <div className={`w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}>
                  {getIcon(bidang.iconName)}
                </div>

                <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 mb-1">
                  {bidang.shortTitle}
                </div>

                <h3 className="font-extrabold text-base text-slate-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                  {bidang.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50/90 p-3 rounded-xl border border-slate-100 italic">
                  "{bidang.description}"
                </p>

                <div className="space-y-1.5 mt-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Cakupan Jenis Pengaduan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bidang.examples.map((ex, idx) => (
                      <span
                        key={idx}
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg font-medium transition-colors ${
                          isSelected 
                            ? 'bg-blue-100/80 text-blue-900' 
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200/70'
                        }`}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-500">
                  Direct WA & Database
                </span>
                <span className="bg-slate-900 group-hover:bg-blue-600 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all">
                  Isi Pengaduan <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

