/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Household, Resident, HistoryLog, SystemUser } from './types';
import { initialHouseholds, initialResidents, initialHistoryLogs } from './data/mockData';

// Sub-components
import StatisticsView from './components/StatisticsView';
import HouseholdsView from './components/HouseholdsView';
import ResidentsView from './components/ResidentsView';
import FluctuationsView from './components/FluctuationsView';
import SystemLogsView from './components/SystemLogsView';
import MobileDeviceWrapper from './components/MobileDeviceWrapper';

// Icons
import {
  Home,
  Users,
  TrendingUp,
  Settings,
  FolderOpen,
  Smartphone,
  Monitor,
  Heart,
  CheckCircle,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // 1. Core Databases States with LocalStorage Hydration
  const [households, setHouseholds] = useState<Household[]>(() => {
    const data = localStorage.getItem('tanan_households');
    return data ? JSON.parse(data) : initialHouseholds;
  });

  const [residents, setResidents] = useState<Resident[]>(() => {
    const data = localStorage.getItem('tanan_residents');
    return data ? JSON.parse(data) : initialResidents;
  });

  const [logs, setLogs] = useState<HistoryLog[]>(() => {
    const data = localStorage.getItem('tanan_logs');
    return data ? JSON.parse(data) : initialHistoryLogs;
  });

  // 2. Active Session / Global State
  const [currentUser, setCurrentUser] = useState<SystemUser>({
    username: 'admin',
    fullName: 'Dương Văn Hà',
    role: 'admin'
  });

  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [desktopTab, setDesktopTab] = useState<'stats' | 'households' | 'residents' | 'fluctuations' | 'system'>('stats');
  const [selectedHouseholdFilter, setSelectedHouseholdFilter] = useState<string>('All');

  // 3. Auto Persistence
  useEffect(() => {
    localStorage.setItem('tanan_households', JSON.stringify(households));
  }, [households]);

  useEffect(() => {
    localStorage.setItem('tanan_residents', JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem('tanan_logs', JSON.stringify(logs));
  }, [logs]);

  // 4. State Modification Helpers
  const addLog = (actionType: HistoryLog['actionType'], description: string) => {
    const newLog: HistoryLog = {
      id: "LOG" + Math.floor(Math.random() * 90000 + 10000).toString(),
      timestamp: new Date().toISOString(),
      author: currentUser.fullName + ` (${currentUser.username})`,
      actionType,
      description
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Add Household
  const handleAddHousehold = (newHouse: Household) => {
    setHouseholds(prev => [...prev, newHouse]);
    addLog('Cập nhật hộ khẩu', `Thêm mới sổ hộ gia đình số ${newHouse.householdNumber} của chủ hộ ${newHouse.headName}.`);
  };

  // Update Household
  const handleUpdateHousehold = (updated: Household) => {
    setHouseholds(prev => prev.map(h => h.householdNumber === updated.householdNumber ? updated : h));
    addLog('Cập nhật hộ khẩu', `Điều chỉnh thông tin sổ hộ ${updated.householdNumber} của chủ hộ ${updated.headName}.`);
  };

  // Delete Household
  const handleDeleteHousehold = (num: string) => {
    setHouseholds(prev => prev.filter(h => h.householdNumber !== num));
    addLog('Xóa hộ khẩu', `Xóa vĩnh viễn sổ hộ khẩu số ${num} ra khỏi cơ sở dữ liệu.`);
  };

  // Add Resident
  const handleAddResident = (newRes: Resident) => {
    setResidents(prev => [...prev, newRes]);
    addLog('Cập nhật nhân khẩu', `Thêm mới nhân khẩu "${newRes.fullName}" vào hộ gia đình ${newRes.householdNumber}.`);
  };

  // Update Resident
  const handleUpdateResident = (updated: Resident) => {
    const old = residents.find(r => r.id === updated.id);
    setResidents(prev => prev.map(r => r.id === updated.id ? updated : r));
    
    // Check if moved household
    if (old && old.householdNumber !== updated.householdNumber) {
      addLog('Chuyển đi', `Chuyển khẩu nhân khẩu "${updated.fullName}" từ hộ cũ ${old.householdNumber} sang hộ mới ${updated.householdNumber}.`);
    } else {
      addLog('Cập nhật nhân khẩu', `Cập nhật thông tin chi tiết của nhân khẩu "${updated.fullName}" (Hộ: ${updated.householdNumber}).`);
    }
  };

  // Delete Resident
  const handleDeleteResident = (id: string) => {
    const old = residents.find(r => r.id === id);
    setResidents(prev => prev.filter(r => r.id !== id));
    if (old) {
      addLog('Xóa nhân khẩu', `Xóa vĩnh viễn nhân khẩu "${old.fullName}" (Hộ: ${old.householdNumber}) ra khỏi dữ liệu.`);
    }
  };

  // Restore state from JSON Backup
  const handleRestoreBackup = (bHouses: Household[], bResidents: Resident[], bLogs: HistoryLog[]) => {
    setHouseholds(bHouses);
    setResidents(bResidents);
    setLogs(bLogs);
    addLog('Khôi phục sao lưu', 'Khôi phục thành công toàn bộ cơ sở dữ liệu thôn Tân An qua tệp sao lưu JSON.');
  };

  // Reset database & clear all demo data
  const handleClearAllData = () => {
    setHouseholds([]);
    setResidents([]);
    setLogs([]);
  };

  // Quick Mass Import Parser (Satisfies uploading directly from Spreadsheets or text blocks)
  const handleMassImportResidents = (pasted: string) => {
    try {
      const lines = pasted.split('\n');
      let count = 0;
      const imported: Resident[] = [];

      lines.forEach(line => {
        if (!line.trim()) return;
        // Split by comma or tab or semicolon
        const cols = line.split(/[,\t;]/);
        if (cols.length < 2) return;

        const fullName = cols[0]?.trim();
        const dob = cols[1]?.trim() || '2000-01-01';
        const gender = (cols[2]?.trim() === 'Nữ' || cols[2]?.trim() === 'Female') ? 'Nữ' : 'Nam';
        const cccd = cols[3]?.trim() || '';
        const householdNumber = cols[4]?.trim().toUpperCase() || 'HK001';
        const relationWithHead = cols[5]?.trim() || 'Thành viên';

        if (!fullName) return;

        const newId = "R" + Math.floor(Math.random() * 90000 + 10000).toString();
        imported.push({
          id: newId,
          householdNumber,
          fullName,
          dob,
          gender,
          ethnicity: 'Kinh',
          religion: 'Không',
          hometown: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
          registeredResidence: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
          currentResidence: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
          relationWithHead,
          cccd,
          cccdDate: '',
          cccdPlace: '',
          phone: '',
          education: '12/12',
          occupation: 'Kinh doanh / Lao động tự do',
          maritalStatus: 'Độc thân',
          notes: 'Nhập tự động bằng Excel',
          status: 'Thường trú'
        });
        count++;
      });

      if (imported.length > 0) {
        setResidents(prev => [...prev, ...imported]);
        addLog('Nhập hàng loạt', `Thêm hàng loạt ${count} nhân khẩu trực tuyến từ mẫu bảng dán Excel.`);
        return { success: true, count };
      }
      return { success: false, count: 0, error: 'Không dán định dạng tương xứng.' };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Lỗi định dạng cấu trúc hàng.' };
    }
  };

  // Select household member quickly from households view
  const handleSelectHouseholdMembers = (num: string) => {
    setSelectedHouseholdFilter(num);
    setDesktopTab('residents');
  };

  // Quick add resident from household view
  const handleQuickAddResident = (num: string) => {
    setSelectedHouseholdFilter(num);
    setDesktopTab('residents');
  };

  return (
    <div className="min-h-screen bg-[#F4F9F5] text-gray-850 flex flex-col font-sans selection:bg-[#118A3B]/20 select-none">
      
      {/* 1. Global Toolbar / Top Navigation App Header */}
      <header className="bg-white border-b border-gray-100 shadow-xs px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30 select-none">
        
        {/* Branding header area */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#118A3B] flex items-center justify-center text-white font-black text-lg shadow-md shadow-green-900/10">
            TA
          </div>
          <div>
            <h1 className="text-sm md:text-base font-black text-gray-900 tracking-wide font-sans flex items-center">
              <span>HỆ THỐNG QUẢN LÝ DÂN CƯ</span>
              <span className="text-xs bg-emerald-50 text-[#118A3B] px-2 py-0.5 rounded ml-2 border border-[#118A3B]/10 font-extrabold uppercase">Thôn Tân An</span>
            </h1>
            <p className="text-[10.5px] text-gray-400 font-bold mt-0.5">xã Ea Ly, tỉnh Đắk Lắk &bull; Cập nhật liên tục</p>
          </div>
        </div>

        {/* View Mode Switching controls - toggle between Full Desktop Dashboard and iOS/Android Simulator preview */}
        <div id="viewmode-toggle-group" className="bg-gray-100/80 p-1 rounded-2xl flex items-center space-x-1 border border-gray-200/50">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'desktop'
                ? 'bg-[#118A3B] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Monitor size={14} />
            <span>Giao diện Máy tính (Admin)</span>
          </button>
          
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'mobile'
                ? 'bg-[#118A3B] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Smartphone size={14} />
            <span>Giao diện Điện thoại (App)</span>
          </button>
        </div>

      </header>

      {/* 2. Main app workspace area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        
        {viewMode === 'desktop' ? (
          
          /* =======================================
             DESKTOP VILLAGE MANAGEMENT DASHBOARD
             ======================================= */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Sidebar Desktop Nav Controls */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs space-y-1">
                
                <p className="text-[9.5px] font-black uppercase tracking-widest text-[#118A3B] px-3.5 py-2">Mục điều hướng</p>
                
                <button
                  onClick={() => setDesktopTab('stats')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all font-bold text-xs flex items-center space-x-3 ${
                    desktopTab === 'stats'
                      ? 'bg-emerald-50 text-[#118A3B] shadow-xs'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <TrendingUp size={16} />
                  <span>Tổng quan Thống kê</span>
                </button>

                <button
                  onClick={() => setDesktopTab('households')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all font-bold text-xs flex items-center space-x-3 ${
                    desktopTab === 'households'
                      ? 'bg-emerald-50 text-[#118A3B] shadow-xs'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <Home size={16} />
                  <span>Sổ Sách Hộ Khẩu</span>
                </button>

                <button
                  onClick={() => setDesktopTab('residents')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all font-bold text-xs flex items-center space-x-3 ${
                    desktopTab === 'residents'
                      ? 'bg-emerald-50 text-[#118A3B] shadow-xs'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <Users size={16} />
                  <span>Danh sách Nhân Khẩu</span>
                </button>

                <button
                  onClick={() => setDesktopTab('fluctuations')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all font-bold text-xs flex items-center space-x-3 ${
                    desktopTab === 'fluctuations'
                      ? 'bg-emerald-50 text-[#118A3B] shadow-xs'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <FolderOpen size={16} />
                  <span>Biến Động Dân Cư</span>
                </button>

                <button
                  onClick={() => setDesktopTab('system')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all font-bold text-xs flex items-center space-x-3 ${
                    desktopTab === 'system'
                      ? 'bg-emerald-50 text-[#118A3B] shadow-xs'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <Settings size={16} />
                  <span>Hệ thống / Sao lưu</span>
                </button>
              </div>

              {/* Status and Active Info panel in sidebar */}
              <div className="bg-[#118A3B]/5 border border-[#118A3B]/10 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center space-x-2 text-[#118A3B] font-bold">
                  <Shield size={16} />
                  <span>Quyền hạn cán lý</span>
                </div>
                <p className="text-[#2C3E50]/80 font-medium leading-relaxed font-sans">
                  Chào mừng <strong>{currentUser.fullName}</strong>. Trạng thái kết nối của Thôn Tân An đang ở mức tối ưu. Mọi dữ liệu sửa đổi đều được ký duyệt và ghi log bảo mật.
                </p>
                <div className="pt-2 text-[10px] text-gray-400 font-semibold font-mono">
                  Bản cập nhật: 13-06-2026
                </div>
              </div>
            </div>

            {/* Desktop Dashboard Active Tab content */}
            <div className="lg:col-span-4 min-h-[500px]">
              {desktopTab === 'stats' && (
                <StatisticsView
                  households={households}
                  residents={residents}
                  onNavigate={(tab) => setDesktopTab(tab)}
                />
              )}

              {desktopTab === 'households' && (
                <HouseholdsView
                  households={households}
                  residents={residents}
                  currentUserRole={currentUser.role}
                  onAddHousehold={handleAddHousehold}
                  onUpdateHousehold={handleUpdateHousehold}
                  onDeleteHousehold={handleDeleteHousehold}
                  onSelectHouseholdMembers={handleSelectHouseholdMembers}
                  onQuickAddResident={handleQuickAddResident}
                />
              )}

              {desktopTab === 'residents' && (
                <ResidentsView
                  residents={residents}
                  households={households}
                  currentUserRole={currentUser.role}
                  selectedHouseholdNumber={selectedHouseholdFilter}
                  onClearHouseholdFilter={() => setSelectedHouseholdFilter('All')}
                  onAddResident={handleAddResident}
                  onUpdateResident={handleUpdateResident}
                  onDeleteResident={handleDeleteResident}
                />
              )}

              {desktopTab === 'fluctuations' && (
                <FluctuationsView
                  residents={residents}
                  households={households}
                  currentUserEmail="duongvanha.offline@gmail.com"
                  onAddResident={handleAddResident}
                  onUpdateResident={handleUpdateResident}
                  onLogHistory={(log) => addLog(log.actionType, log.description)}
                />
              )}

              {desktopTab === 'system' && (
                <SystemLogsView
                  logs={logs}
                  households={households}
                  residents={residents}
                  currentUser={currentUser}
                  onSetCurrentUser={(u) => setCurrentUser(u)}
                  onClearLogs={() => setLogs([])}
                  onRestoreBackup={handleRestoreBackup}
                  onMassImportResidents={handleMassImportResidents}
                  onClearAllData={handleClearAllData}
                />
              )}
            </div>

          </div>
        ) : (
          
          /* =======================================
             MOBILE PHONE DEVICE PREVIEW VIEW
             ======================================= */
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="max-w-md w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
              <h3 className="text-xs font-bold text-gray-800 flex items-center justify-center"><Smartphone size={16} className="text-[#118A3B] mr-1" /> Trợ lý Mô phỏng Ứng dụng Di động</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Trải nghiệm giao diện đăng nhập cộng cư đạt chuẩn Material Design 3 giống như hình ảnh bản vẽ dọn sẵn.</p>
            </div>
            
            <MobileDeviceWrapper
              households={households}
              residents={residents}
              logs={logs}
              currentUser={currentUser}
              onSetCurrentUser={(u) => { if (u) setCurrentUser(u); }}
              onClearLogs={() => setLogs([])}
              onAddResidentFromMobile={handleAddResident}
              onAddLog={(action, desc) => addLog(action as any, desc)}
              onAddResident={handleAddResident}
              onUpdateResident={handleUpdateResident}
              onDeleteResident={handleDeleteResident}
              onAddHousehold={handleAddHousehold}
              onUpdateHousehold={handleUpdateHousehold}
              onDeleteHousehold={handleDeleteHousehold}
              onRestoreBackup={handleRestoreBackup}
              onMassImportResidents={handleMassImportResidents}
              onClearAllData={handleClearAllData}
            />
          </div>
        )}

      </main>

      {/* 3. Global Footer */}
      <footer className="bg-white border-t border-gray-100 py-5 text-center text-[11px] text-gray-400 font-semibold mt-12 select-none">
        <p>&copy; 2026 Bản quyền thuộc về Cộng đồng dân cư Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk.</p>
        <p className="mt-1 font-mono text-emerald-705 text-[#118A3B] text-[10px]">Lưu trữ lâu dài &bull; Tìm kiếm thần tốc &bull; Sử dụng chuẩn mực</p>
      </footer>

    </div>
  );
}
