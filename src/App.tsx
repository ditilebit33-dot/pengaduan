/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BidangType, Complaint, OfficerConfig, BidangOfficerConfigs, AdminUser } from './types';
import { 
  getStoredComplaints, 
  getStoredOfficerConfigs, 
  getOfficerForBidang, 
  initFirestoreSync 
} from './utils/storage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BidangSelector } from './components/BidangSelector';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintFormModal } from './components/ComplaintFormModal';
import { ComplaintSuccessModal } from './components/ComplaintSuccessModal';
import { TrackTicket } from './components/TrackTicket';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminVerification } from './components/AdminVerification';
import { AdminReports } from './components/AdminReports';
import { AdminOfficerSettings } from './components/AdminOfficerSettings';
import { AdminAuthModal } from './components/AdminAuthModal';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  LayoutDashboard, 
  CheckSquare, 
  FileSpreadsheet, 
  Settings, 
  Building2,
  Lock,
  Unlock,
  Info,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState<'buat' | 'lacak' | 'admin'>('buat');
  const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'verifikasi' | 'laporan' | 'pengaturan'>('dashboard');

  // Form & Category Modal states
  const [selectedBidang, setSelectedBidang] = useState<BidangType>('pendaftaran_penduduk');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState<boolean>(false);

  // Stored state for 3 officers and complaints
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officerConfigs, setOfficerConfigs] = useState<BidangOfficerConfigs>(getStoredOfficerConfigs());

  // Firebase Admin Auth state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  // Modal & Search states
  const [successModalData, setSuccessModalData] = useState<{ complaint: Complaint; waLink: string } | null>(null);
  const [trackQuery, setTrackQuery] = useState<string>('');
  const [verificationFilterStatus, setVerificationFilterStatus] = useState<string>('all');

  // Load complaints & officer configs on mount and subscribe to Firestore
  useEffect(() => {
    refreshComplaints();
    setOfficerConfigs(getStoredOfficerConfigs());

    initFirestoreSync(() => {
      refreshComplaints();
      setOfficerConfigs(getStoredOfficerConfigs());
    });
  }, []);

  const refreshComplaints = () => {
    const list = getStoredComplaints();
    setComplaints(list);
  };

  const handleSelectBidangCategory = (bidang: BidangType) => {
    setSelectedBidang(bidang);
    setIsComplaintModalOpen(true);
  };

  const handleComplaintSubmitted = (newComplaint: Complaint, waLink: string) => {
    refreshComplaints();
    setSuccessModalData({ complaint: newComplaint, waLink });
  };

  const handleTrackTicket = (ticketId: string) => {
    setTrackQuery(ticketId);
    setActiveTab('lacak');
  };

  const handleAdminLogout = async () => {
    await signOut(auth);
    setAdminUser(null);
  };

  // Active officer for current selected bidang
  const currentOfficer = getOfficerForBidang(selectedBidang);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased">
      {/* Official Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'admin' && !adminUser) {
            setIsAdminAuthModalOpen(true);
          }
        }}
        isAdminLoggedIn={!!adminUser}
        setIsAdminLoggedIn={(val) => {
          if (!val) handleAdminLogout();
          else setIsAdminAuthModalOpen(true);
        }}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* PUBLIC TAB 1: BUAT PENGADUAN */}
        {activeTab === 'buat' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Institution Intro Card */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-blue-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" /> Saumlaki, Kepulauan Tanimbar
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Layanan Pengaduan Kependudukan & Pencatatan Sipil
                </h2>
                <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Sampaikan aduan Anda secara online. Klik salah satu kategori bidang di bawah untuk membuka <strong>Formulir Popup Modal Pengaduan</strong> yang terhubung langsung ke WhatsApp Pejabat terkait dan tersimpan di database.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs text-center shrink-0 space-y-1">
                <span className="text-amber-400 font-bold block uppercase tracking-wider">Jam Pelayanan Online</span>
                <span className="text-white font-medium">Senin - Jumat (08:00 - 16:00 WIT)</span>
                <span className="text-emerald-400 block text-[11px] font-semibold mt-1">3 Direct WA Pejabat Bidang</span>
              </div>
            </div>

            {/* Step 1: Bidang Selector (Triggers Modal Popup) */}
            <BidangSelector
              selectedBidang={selectedBidang}
              onSelectBidang={handleSelectBidangCategory}
            />


          </div>
        )}

        {/* PUBLIC TAB 2: LACAK TIKET */}
        {activeTab === 'lacak' && (
          <div className="animate-in fade-in duration-200">
            <TrackTicket
              initialSearchQuery={trackQuery}
              officerConfig={currentOfficer}
              onNewComplaintClick={() => setActiveTab('buat')}
            />
          </div>
        )}

        {/* ADMIN TAB 3: PANEL ADMIN / VERIFIKASI (FIREBASE EMAIL AUTH GATE) */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {!adminUser ? (
              <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-lg text-center max-w-xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-300 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="bg-slate-900 text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                    Autentikasi Firebase Firestore Required
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Panel Akses Administrator Pengaduan
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Akses ke Panel Admin memerlukan login dengan Email terdaftar pada Database Firebase Firestore untuk menjaga kerahasiaan data kependudukan.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsAdminAuthModalOpen(true)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-3.5 px-6 rounded-2xl shadow-lg border border-amber-400/30 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Masuk Dengan Email Administrator Firebase</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 text-left">
                  <strong>Catatan Verifikasi:</strong> Gunakan akun terdaftar di Firestore seperti <code>admin@disdukcapil-tanimbar.go.id</code> atau <code>ditilebit33@gmail.com</code>.
                </div>
              </div>
            ) : (
              <>
                {/* Admin Sub-navigation Header Bar */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white block leading-none">Panel Admin Disdukcapil</span>
                        <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Firebase Verified
                        </span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono">
                        {adminUser.email} ({adminUser.role})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl w-full sm:w-auto justify-center">
                      <button
                        id="admin-sub-dashboard"
                        onClick={() => setAdminSubTab('dashboard')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          adminSubTab === 'dashboard'
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        id="admin-sub-verifikasi"
                        onClick={() => setAdminSubTab('verifikasi')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          adminSubTab === 'verifikasi'
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Verifikasi</span>
                        {complaints.filter(c => c.status === 'menunggu').length > 0 && (
                          <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                            {complaints.filter(c => c.status === 'menunggu').length}
                          </span>
                        )}
                      </button>

                      <button
                        id="admin-sub-laporan"
                        onClick={() => setAdminSubTab('laporan')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          adminSubTab === 'laporan'
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Laporan (Excel/PDF)</span>
                      </button>

                      <button
                        id="admin-sub-pengaturan"
                        onClick={() => setAdminSubTab('pengaturan')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          adminSubTab === 'pengaturan'
                            ? 'bg-amber-500 text-slate-950 font-bold shadow'
                            : 'text-amber-300 hover:bg-amber-500/20'
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Pejabat (3 Bidang)</span>
                      </button>
                    </div>

                    <button
                      onClick={handleAdminLogout}
                      className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                      title="Keluar dari Panel Admin"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden md:inline">Keluar</span>
                    </button>
                  </div>
                </div>

                {/* Admin View Router */}
                {adminSubTab === 'dashboard' && (
                  <AdminDashboard
                    complaints={complaints}
                    onNavigateToVerification={(filterStatus) => {
                      if (filterStatus) setVerificationFilterStatus(filterStatus);
                      setAdminSubTab('verifikasi');
                    }}
                    onNavigateToReports={() => setAdminSubTab('laporan')}
                  />
                )}

                {adminSubTab === 'verifikasi' && (
                  <AdminVerification
                    complaints={complaints}
                    initialStatusFilter={verificationFilterStatus}
                    officerConfig={currentOfficer}
                    onComplaintsUpdated={refreshComplaints}
                  />
                )}

                {adminSubTab === 'laporan' && (
                  <AdminReports
                    complaints={complaints}
                    officerConfig={currentOfficer}
                  />
                )}

                {adminSubTab === 'pengaturan' && (
                  <AdminOfficerSettings
                    officerConfigs={officerConfigs}
                    onConfigsSaved={(newCfgs) => setOfficerConfigs(newCfgs)}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Modal Popup Complaint Form upon Bidang Selection */}
      <ComplaintFormModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        selectedBidang={selectedBidang}
        officerConfig={currentOfficer}
        onSubmitSuccess={handleComplaintSubmitted}
      />

      {/* Admin Auth Firebase Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onLoginSuccess={(admin) => {
          setAdminUser(admin);
          setIsAdminAuthModalOpen(false);
          setActiveTab('admin');
        }}
      />

      {/* Success Modal upon Form Submission */}
      {successModalData && (
        <ComplaintSuccessModal
          complaint={successModalData.complaint}
          waLink={successModalData.waLink}
          officerConfig={currentOfficer}
          onClose={() => setSuccessModalData(null)}
          onTrackTicket={handleTrackTicket}
        />
      )}

      {/* Official Footer */}
      <Footer
        officerConfig={currentOfficer}
        onOpenAdmin={() => {
          setActiveTab('admin');
          if (!adminUser) {
            setIsAdminAuthModalOpen(true);
          } else {
            setAdminSubTab('dashboard');
          }
        }}
      />
    </div>
  );
}

