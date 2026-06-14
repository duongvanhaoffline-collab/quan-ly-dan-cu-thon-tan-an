/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, Phone, Shield, Send, Check, AlertCircle, RefreshCw, Smartphone, Monitor,
  TrendingUp, Home as HomeIcon, Users, FolderOpen, Settings, ListCollapse, BookOpen, Search, Bell, Menu, Activity, ShieldCheck, Heart,
  BarChart3, ClipboardList, FileText
} from 'lucide-react';
import MobileLogin from './MobileLogin';
import { SystemUser, Household, Resident, HistoryLog } from '../types';

import StatisticsView from './StatisticsView';
import HouseholdsView from './HouseholdsView';
import ResidentsView from './ResidentsView';
import FluctuationsView from './FluctuationsView';
import SystemLogsView from './SystemLogsView';

interface MobileDeviceWrapperProps {
  households: Household[];
  residents: Resident[];
  logs: HistoryLog[];
  currentUser: SystemUser;
  onSetCurrentUser: (user: SystemUser | null) => void;
  onClearLogs: () => void;
  onAddResidentFromMobile: (res: Resident) => void;
  onAddLog: (action: string, desc: string) => void;
  onAddResident: (res: Resident) => void;
  onUpdateResident: (res: Resident) => void;
  onDeleteResident: (id: string) => void;
  onAddHousehold: (h: Household) => void;
  onUpdateHousehold: (h: Household) => void;
  onDeleteHousehold: (num: string) => void;
  onRestoreBackup: (bHouses: Household[], bResidents: Resident[], bLogs: HistoryLog[]) => void;
  onMassImportResidents: (pasted: string) => any;
  onClearAllData: () => void;
}

export default function MobileDeviceWrapper({
  households,
  residents,
  logs,
  currentUser: systemUser,
  onSetCurrentUser,
  onClearLogs,
  onAddResidentFromMobile,
  onAddLog,
  onAddResident,
  onUpdateResident,
  onDeleteResident,
  onAddHousehold,
  onUpdateHousehold,
  onDeleteHousehold,
  onRestoreBackup,
  onMassImportResidents,
  onClearAllData,
}: MobileDeviceWrapperProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);

  // Announcement mocks
  const announcements = [
    { id: 1, title: '📢 Lịch họp thôn Tân An quý mới', date: 'Xóm Trung, 14:00 ngày mai', content: 'Kính mời toàn bộ trưởng xóm và đại diện hộ gia đình tham gia đầy đủ để triển khai phong trào vệ sinh nông thôn mới.' },
    { id: 2, title: '💉 Tiêm chủng vắc-xin miễn phí cho trẻ em', date: 'Trạm y tế, ngày 18-06', content: 'Hỗ trợ tiêm miễn phí cho trẻ dưới 6 tuổi thuộc diện thường trú, tạm trú của thôn Tân An.' },
    { id: 3, title: '🌾 Hỗ trợ giống lúa hè thu chất lượng', date: 'Nhà văn hóa thôn, ngày 20-06', content: 'Nhận trợ giá phân bón và giống lúa mới của Sở Nông nghiệp cung cấp.' }
  ];

  // Mobile App Active Screen
  const [mobileScreen, setMobileScreen] = useState<'home' | 'search' | 'announcements' | 'register' | 'stats' | 'households' | 'residents' | 'fluctuations' | 'system'>('home');
  const [mobileSelectedHouseholdFilter, setMobileSelectedHouseholdFilter] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Search query on mobile
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Resident | null>(null);

  // Online Registration
  const [regName, setRegName] = useState('');
  const [regDob, setRegDob] = useState('2001-01-01');
  const [regGender, setRegGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [regType, setRegType] = useState('Tạm trú');
  const [regHouse, setRegHouse] = useState(households[0]?.householdNumber || 'HK001');
  const [regSuccess, setRegSuccess] = useState(false);

  // Handle mobile login simulation
  const handleMobileLogin = (user: SystemUser) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setMobileScreen('home');
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileSearchQuery.trim()) return;
    const res = residents.find(
      r => r.fullName.toLowerCase().includes(mobileSearchQuery.toLowerCase()) || 
      (r.cccd && r.cccd.includes(mobileSearchQuery))
    );
    setSearchResult(res || null);
  };

  const handleMobileRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    // Simulate sending from telephone
    const newId = "R" + Math.floor(Math.random() * 9000 + 1000).toString();
    const newRes: Resident = {
      id: newId,
      householdNumber: regHouse,
      fullName: regName.trim(),
      dob: regDob,
      gender: regGender,
      ethnicity: 'Kinh',
      religion: 'Không',
      hometown: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
      registeredResidence: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
      currentResidence: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
      relationWithHead: 'Thành viên',
      cccd: '',
      cccdDate: '',
      cccdPlace: '',
      phone: '09' + Math.floor(Math.random() * 90000000 + 10000000).toString(),
      education: '12/12',
      occupation: 'Lao động tự do',
      maritalStatus: 'Độc thân',
      notes: `Đăng ký trực tuyến bằng Điện thoại bởi cán bộ ${currentUser?.fullName || 'Hệ thống'}`,
      status: regType as any
    };

    onAddResidentFromMobile(newRes);
    onAddLog(
      regType === 'Tạm trú' ? 'Tạm trú' : 'Chuyển đến',
      `Tiếp nhận Đăng ký ${regType} online cho anh/chị "${regName}" qua Mobile App vào hộ ${regHouse}.`
    );

    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setRegName('');
      setMobileScreen('home');
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 select-none">
      
      {/* Phone frame styling with real speaker and absolute controls */}
      <div className="relative w-[375px] h-[780px] bg-black rounded-[50px] shadow-[0_25px_50px_rgba(0,0,0,0.4)] border-[12px] border-[#1e1e1e] overflow-hidden flex flex-col">
        
        {/* Notch Speaker and status bar */}
        <div className="absolute top-0 inset-x-0 h-8 bg-black z-40 flex items-center justify-between px-7">
          <span className="text-[11px] text-white font-bold">14:05</span>
          <div className="w-[120px] h-4 bg-black rounded-b-xl absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            <div className="w-10 h-1.5 bg-[#444] rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-[#444] rounded-full ml-2"></div>
          </div>
          <div className="flex items-center space-x-1 text-white">
            {/* LTE, Wi-Fi icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 21l7.03-3.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"/>
            </svg>
            <span className="text-[9.5px] font-bold">4G</span>
            <div className="w-4 h-2 border border-white rounded-[2px] p-[1px] flex items-center">
              <div className="w-full h-full bg-white rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Dynamic Display Screens */}
        <div className="flex-1 bg-white overflow-y-auto pt-8 flex flex-col">
          {!isLoggedIn ? (
            <MobileLogin
              onLoginSuccess={handleMobileLogin}
              onNavigateToSso={() => alert('Đang kết nối cổng xác thực Quốc gia SSO VNeID...')}
            />
          ) : (
            <div className="flex-grow flex flex-col justify-between">
              
              {/* App Internal Header */}
              <div className="bg-[#118A3B] text-white px-4 pt-3 pb-4 rounded-b-[24px] shadow-sm flex flex-col">
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">CỘNG ĐỒNG DÂN CƯ</p>
                    <h4 className="text-sm font-extrabold font-sans">THÔN TÂN AN</h4>
                  </div>
                  <button
                    onClick={() => { setIsLoggedIn(false); setCurrentUser(null); }}
                    className="text-[10px] bg-white text-[#118A3B] px-2.5 py-1 rounded-lg font-bold shadow-xs hover:bg-emerald-50"
                  >
                    Đăng xuất
                  </button>
                </div>
                
                <div className="mt-3 flex items-center justify-between bg-emerald-700/40 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span>Xin chào, <strong className="text-white font-bold">{currentUser?.fullName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Mobile Screens Body */}
              <div className="flex-1 p-4 overflow-y-auto">
                
                {/* 1. Mobile HOME view */}
                {mobileScreen === 'home' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-br from-[#118A3B]/5 to-transparent p-4 rounded-2xl border border-emerald-50">
                      <h4 className="text-xs font-extrabold text-emerald-950 flex items-center"><Sparkles size={14} className="mr-1 inline text-emerald-600 animate-pulse" /> Tiện ích Cư dân & Quản lý</h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Cán bộ và người dân Thôn Tân An có thể trực tiếp quản lý, tra cứu nhân khẩu, khai báo cư trú và thực hiện đầy đủ chức năng quản trị trực tiếp trên thiết bị di động.
                      </p>
                    </div>

                    {/* All categories mapped as requested */}
                    <p className="text-[9.5px] font-black uppercase tracking-wider text-emerald-800 flex items-center">
                      <Menu size={11} className="mr-1" /> DANH MỤC THỐNG KÊ & CHỨC NĂNG
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => setMobileScreen('stats')}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-xs text-center hover:bg-emerald-50/20 flex flex-col items-center justify-center transition-all border-l-4 border-l-[#118A3B] group"
                      >
                        <BarChart3 size={20} className="text-[#118A3B] group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-bold text-gray-700 mt-1.5">Tổng quan Thống kê</span>
                      </button>

                      <button
                        onClick={() => setMobileScreen('households')}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-xs text-center hover:bg-emerald-50/20 flex flex-col items-center justify-center transition-all border-l-4 border-l-[#118A3B] group"
                      >
                        <ClipboardList size={20} className="text-[#118A3B] group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-bold text-gray-700 mt-1.5">Sổ Sách Hộ Khẩu</span>
                      </button>

                      <button
                        onClick={() => setMobileScreen('residents')}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-xs text-center hover:bg-emerald-50/20 flex flex-col items-center justify-center transition-all border-l-4 border-l-[#118A3B] group"
                      >
                        <Users size={20} className="text-[#118A3B] group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-bold text-gray-700 mt-1.5">Danh sách Nhân khẩu</span>
                      </button>

                      <button
                        onClick={() => setMobileScreen('fluctuations')}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-xs text-center hover:bg-emerald-50/20 flex flex-col items-center justify-center transition-all border-l-4 border-l-[#118A3B] group"
                      >
                        <Activity size={20} className="text-[#118A3B] group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-bold text-gray-700 mt-1.5">Biến Động Dân Cư</span>
                      </button>

                      <button
                        onClick={() => setMobileScreen('system')}
                        className="p-3 bg-white border border-gray-100 rounded-xl shadow-xs text-center hover:bg-emerald-50/20 flex flex-col items-center justify-center transition-all border-l-4 border-l-[#118A3B] group"
                      >
                        <Settings size={20} className="text-[#118A3B] group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-bold text-gray-700 mt-1.5">Hệ thống / Sao lưu</span>
                      </button>

                      <button
                        onClick={() => setMobileScreen('register')}
                        className="p-3 bg-[#ED6A14]/5 border border-[#ED6A14]/10 rounded-xl shadow-xs text-center hover:bg-[#ED6A14]/10 flex flex-col items-center justify-center transition-all border-l-4 border-l-[#ED6A14] group"
                      >
                        <FileText size={20} className="text-[#ED6A14] group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-bold text-gray-800 mt-1.5">Khai báo cư trú</span>
                      </button>

                      <button
                        onClick={() => setMobileScreen('search')}
                        className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl shadow-xs text-center hover:bg-emerald-100/30 flex flex-col items-center justify-center transition-all col-span-2 border-l-4 border-l-emerald-500 group flex-row space-x-2"
                      >
                        <Search size={16} className="text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[11px] font-bold text-gray-750">Hệ thống Tra cứu nhanh</span>
                      </button>
                    </div>

                    {/* Announcements list preview */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-gray-800 flex items-center"><Bell size={12} className="mr-1 text-emerald-600" /> Thông báo từ thôn</span>
                        <button onClick={() => setMobileScreen('announcements')} className="text-[10px] text-[#118A3B] font-bold">Xem tất cả</button>
                      </div>

                      {announcements.slice(0, 2).map(ann => (
                        <div key={ann.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                          <p className="text-[11px] font-black text-gray-800">{ann.title}</p>
                          <p className="text-[9px] text-[#118A3B] font-semibold">{ann.date}</p>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* 2. Mobile SEARCH view */}
                {mobileScreen === 'search' && (
                  <div className="space-y-4 animate-fade-in">
                    <button onClick={() => { setMobileScreen('home'); setSearchResult(null); }} className="text-xs text-gray-400 font-bold">&larr; Quay lại</button>
                    
                    <h4 className="text-xs font-black text-[#118A3B] uppercase">Tra cứu nhân khẩu trực tuyến</h4>
                    
                    <form onSubmit={handleMobileSearch} className="flex gap-2">
                      <input
                        type="text"
                        value={mobileSearchQuery}
                        onChange={(e) => setMobileSearchQuery(e.target.value)}
                        placeholder="Nhập tên chính xác cần tra cứu..."
                        className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                      <button type="submit" className="bg-[#118A3B] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold">Tìm</button>
                    </form>

                    {searchResult ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2 text-xs">
                        <p className="font-extrabold text-emerald-900 border-b border-emerald-100 pb-1">{searchResult.fullName}</p>
                        <p className="text-gray-600"><strong>Ngày sinh:</strong> {new Date(searchResult.dob).toLocaleDateString('vi-VN')}</p>
                        <p className="text-gray-600"><strong>Giới tính:</strong> {searchResult.gender}</p>
                        <p className="text-gray-600"><strong>Số Hộ khẩu:</strong> {searchResult.householdNumber}</p>
                        <p className="text-gray-600"><strong>Đăng ký cư trú:</strong> {searchResult.status}</p>
                        <p className="text-gray-600"><strong>Quan hệ chủ hộ:</strong> {searchResult.relationWithHead}</p>
                      </div>
                    ) : mobileSearchQuery ? (
                      <p className="text-xs text-red-500 font-semibold bg-red-50 p-2.5 rounded-lg text-center">Không tìm thấy công dân hoặc thông báo bảo mật.</p>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic text-center py-6">Nhập họ và tên viết hoa có dấu để tra bản ghi.</p>
                    )}
                  </div>
                )}

                {/* 3. Mobile ANNOUNCEMENTS view */}
                {mobileScreen === 'announcements' && (
                  <div className="space-y-4 animate-fade-in">
                    <button onClick={() => setMobileScreen('home')} className="text-xs text-gray-400 font-bold">&larr; Quay lại trang chủ</button>
                    
                    <h4 className="text-xs font-black text-[#118A3B] uppercase">Bản tin thôn Tân An</h4>
                    
                    <div className="space-y-3">
                      {announcements.map(ann => (
                        <div key={ann.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                          <p className="text-xs font-extrabold text-gray-800">{ann.title}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">{ann.date}</p>
                          <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">{ann.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Mobile ONLINE REGISTER form */}
                {mobileScreen === 'register' && (
                  <div className="space-y-4 animate-fade-in">
                    <button onClick={() => setMobileScreen('home')} className="text-xs text-gray-400 font-bold">&larr; Quay lại</button>
                    
                    <h4 className="text-xs font-black text-[#118A3B] uppercase">Khai báo lưu trú / Thường trú</h4>
                    
                    {regSuccess ? (
                      <div className="bg-emerald-100 text-emerald-900 p-4 rounded-xl text-center space-y-2 text-xs font-bold">
                        <Check className="mx-auto text-emerald-700" size={32} />
                        <p>Đăng ký trực tuyến thành công!</p>
                        <p className="text-[10px] text-emerald-700 font-medium">Dữ liệu đã tự động cập nhật lên Server Hộ tịch thôn Tân An.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleMobileRegisterSubmit} className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-gray-500 font-bold">Họ tên người đăng ký *</label>
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Nhập họ tên đầy đủ..."
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-gray-500 font-bold">Ngày tháng năm sinh *</label>
                          <input
                            type="date"
                            required
                            value={regDob}
                            onChange={(e) => setRegDob(e.target.value)}
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-gray-500 font-bold">Giới tính</label>
                            <select value={regGender} onChange={(e: any) => setRegGender(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl">
                              <option value="Nam">Nam</option>
                              <option value="Nữ">Nữ</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-gray-500 font-bold">Loại đăng ký</label>
                            <select value={regType} onChange={(e) => setRegType(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl">
                              <option value="Tạm trú">Tạm trú</option>
                              <option value="Thường trú">Thường trú</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-gray-500 font-bold">Chọn hộ gia đình bảo lãnh *</label>
                          <select value={regHouse} onChange={(e) => setRegHouse(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border border-emerald-500/20 rounded-xl">
                            {households.map(h => (
                              <option key={h.householdNumber} value={h.householdNumber}>{h.householdNumber} - {h.headName}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-[#118A3B] hover:bg-[#0d6d2e] text-white font-bold rounded-xl mt-2 flex items-center justify-center space-x-1"
                        >
                          <Send size={12} />
                          <span>Gửi dữ liệu khai báo</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* 5. Mobile STATS view */}
                {mobileScreen === 'stats' && (
                  <div className="space-y-4 animate-fade-in select-text">
                    <button onClick={() => setMobileScreen('home')} className="text-xs text-gray-400 font-bold">&larr; Quay lại</button>
                    <h4 className="text-xs font-black text-[#118A3B] uppercase">Báo cáo &amp; Thống kê dân cư</h4>
                    <div className="scale-[0.93] origin-top -mx-4 overflow-x-auto pb-4">
                      <StatisticsView
                        households={households}
                        residents={residents}
                        onNavigate={(tab) => setMobileScreen(tab as any)}
                      />
                    </div>
                  </div>
                )}

                {/* 6. Mobile HOUSEHOLDS view */}
                {mobileScreen === 'households' && (
                  <div className="space-y-4 animate-fade-in select-text">
                    <button onClick={() => setMobileScreen('home')} className="text-xs text-gray-400 font-bold">&larr; Quay lại</button>
                    <h4 className="text-xs font-black text-[#118A3B] uppercase">Quản lý sổ hộ khẩu</h4>
                    <div className="scale-[0.93] origin-top -mx-4 overflow-x-auto pb-4">
                      <HouseholdsView
                        households={households}
                        residents={residents}
                        currentUserRole={currentUser?.role || 'admin'}
                        onAddHousehold={onAddHousehold}
                        onUpdateHousehold={onUpdateHousehold}
                        onDeleteHousehold={onDeleteHousehold}
                        onSelectHouseholdMembers={(num) => {
                          setMobileSelectedHouseholdFilter(num);
                          setMobileScreen('residents');
                        }}
                        onQuickAddResident={(num) => {
                          setMobileSelectedHouseholdFilter(num);
                          setMobileScreen('residents');
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 7. Mobile RESIDENTS view */}
                {mobileScreen === 'residents' && (
                  <div className="space-y-4 animate-fade-in select-text">
                    <div className="flex justify-between items-center">
                      <button onClick={() => setMobileScreen('home')} className="text-xs text-gray-400 font-bold">&larr; Quay lại</button>
                      {mobileSelectedHouseholdFilter !== 'All' && (
                        <button
                          onClick={() => setMobileSelectedHouseholdFilter('All')}
                          className="text-[9px] bg-[#118A3B]/10 text-[#118A3B] px-2 py-0.5 rounded-full font-bold"
                        >
                          Bỏ lọc hộ: {mobileSelectedHouseholdFilter} &times;
                        </button>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-[#118A3B] uppercase">Danh sách nhân khẩu thôn</h4>
                    <div className="scale-[0.93] origin-top -mx-4 overflow-x-auto pb-4">
                      <ResidentsView
                        residents={residents}
                        households={households}
                        currentUserRole={currentUser?.role || 'admin'}
                        selectedHouseholdNumber={mobileSelectedHouseholdFilter}
                        onClearHouseholdFilter={() => setMobileSelectedHouseholdFilter('All')}
                        onAddResident={onAddResident}
                        onUpdateResident={onUpdateResident}
                        onDeleteResident={onDeleteResident}
                      />
                    </div>
                  </div>
                )}

                {/* 8. Mobile FLUCTUATIONS view */}
                {mobileScreen === 'fluctuations' && (
                  <div className="space-y-4 animate-fade-in select-text">
                    <button onClick={() => setMobileScreen('home')} className="text-xs text-gray-400 font-bold">&larr; Quay lại</button>
                    <h4 className="text-xs font-black text-[#118A3B] uppercase">Biến động nhân khẩu</h4>
                    <div className="scale-[0.93] origin-top -mx-4 overflow-x-auto pb-4">
                      <FluctuationsView
                        residents={residents}
                        households={households}
                        currentUserEmail="duongvanha.offline@gmail.com"
                        onAddResident={onAddResident}
                        onUpdateResident={onUpdateResident}
                        onLogHistory={(log) => onAddLog(log.actionType, log.description)}
                      />
                    </div>
                  </div>
                )}

                {/* 9. Mobile SYSTEM view */}
                {mobileScreen === 'system' && (
                  <div className="space-y-4 animate-fade-in select-text">
                    <button onClick={() => setMobileScreen('home')} className="text-xs text-gray-400 font-bold">&larr; Quay lại</button>
                    <h4 className="text-xs font-black text-[#118A3B] uppercase">Cấu hình &amp; Nhật ký</h4>
                    <div className="scale-[0.93] origin-top -mx-4 overflow-x-auto pb-4">
                      <SystemLogsView
                        logs={logs}
                        households={households}
                        residents={residents}
                        currentUser={currentUser || { username: 'admin', fullName: 'Dương Văn Hà', role: 'admin' }}
                        onSetCurrentUser={(u) => {
                          if (u) {
                            setCurrentUser(u);
                            onSetCurrentUser(u);
                          }
                        }}
                        onClearLogs={onClearLogs}
                        onRestoreBackup={onRestoreBackup}
                        onMassImportResidents={onMassImportResidents}
                        onClearAllData={onClearAllData}
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Mobile App Bottom Nav Indicator - premium fit tabs */}
              <div className="bg-white border-t border-gray-100 py-2.5 flex justify-around items-center text-[8.5px] text-gray-400 font-extrabold shadow-lg z-20">
                <button onClick={() => { setMobileScreen('home'); setSearchResult(null); }} className={`flex flex-col items-center flex-1 transition-colors ${mobileScreen === 'home' ? 'text-[#118A3B]' : 'hover:text-gray-600'}`}>
                  <HomeIcon size={15} />
                  <span className="mt-1">Trang chủ</span>
                </button>
                <button onClick={() => setMobileScreen('stats')} className={`flex flex-col items-center flex-1 transition-colors ${mobileScreen === 'stats' ? 'text-[#118A3B]' : 'hover:text-gray-600'}`}>
                  <TrendingUp size={15} />
                  <span className="mt-1">Thống kê</span>
                </button>
                <button onClick={() => setMobileScreen('households')} className={`flex flex-col items-center flex-1 transition-colors ${mobileScreen === 'households' ? 'text-[#118A3B]' : 'hover:text-gray-600'}`}>
                  <BookOpen size={15} />
                  <span className="mt-1">Hộ danh</span>
                </button>
                <button onClick={() => setMobileScreen('residents')} className={`flex flex-col items-center flex-1 transition-colors ${mobileScreen === 'residents' ? 'text-[#118A3B]' : 'hover:text-gray-600'}`}>
                  <Users size={15} />
                  <span className="mt-1">Nhân khẩu</span>
                </button>
                <button onClick={() => setMobileScreen('fluctuations')} className={`flex flex-col items-center flex-1 transition-colors ${mobileScreen === 'fluctuations' ? 'text-[#118A3B]' : 'hover:text-gray-600'}`}>
                  <Activity size={15} />
                  <span className="mt-1">Biến động</span>
                </button>
                <button onClick={() => setMobileScreen('system')} className={`flex flex-col items-center flex-1 transition-colors ${mobileScreen === 'system' ? 'text-[#118A3B]' : 'hover:text-gray-600'}`}>
                  <Settings size={15} />
                  <span className="mt-1">Cài đặt</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* iPhone physical home indicator bar */}
        <div className="h-4 bg-black w-full flex justify-center items-center pb-1">
          <div className="w-[120px] h-1.5 bg-white rounded-full"></div>
        </div>

      </div>
      
    </div>
  );
}
