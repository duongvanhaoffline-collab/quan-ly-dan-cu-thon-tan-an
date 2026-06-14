/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Household, Resident, HistoryLog } from '../types';
import { Sparkles, ArrowRight, CheckCircle, FileText, Calendar, Plus, Users, Heart, AlertCircle } from 'lucide-react';

interface FluctuationsViewProps {
  residents: Resident[];
  households: Household[];
  currentUserEmail: string;
  onAddResident: (res: Resident) => void;
  onUpdateResident: (res: Resident) => void;
  onLogHistory: (log: Omit<HistoryLog, 'id' | 'timestamp'>) => void;
}

type FlucType = 'birth' | 'move_in' | 'move_out' | 'temp_resident' | 'temp_absent' | 'marriage' | 'divorce' | 'death';

export default function FluctuationsView({
  residents,
  households,
  currentUserEmail,
  onAddResident,
  onUpdateResident,
  onLogHistory,
}: FluctuationsViewProps) {
  const [activeTab, setActiveTab] = useState<FlucType>('birth');
  
  // Universal Form States
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [selectedHouseNo, setSelectedHouseNo] = useState(households[0]?.householdNumber || '');
  const [targetName, setTargetName] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [date1, setDate1] = useState(() => new Date().toISOString().split('T')[0]);
  const [inputVal1, setInputVal1] = useState('');
  const [inputVal2, setInputVal2] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const activeResidents = residents.filter(r => r.status !== 'Đã chuyển đi' && r.status !== 'Đã mất');

  const triggerReset = () => {
    setSelectedResidentId('');
    setTargetName('');
    setInputVal1('');
    setInputVal2('');
    setFeedbackMsg('');
  };

  const selectTab = (tab: FlucType) => {
    setActiveTab(tab);
    triggerReset();
  };

  // 1. Khai Sinh
  const handleBirthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) return;

    const newId = "R" + Math.floor(Math.random() * 9000 + 1000).toString();
    const dob = date1;
    const newResident: Resident = {
      id: newId,
      householdNumber: selectedHouseNo,
      fullName: targetName.trim(),
      dob,
      gender,
      ethnicity: 'Kinh',
      religion: 'Không',
      hometown: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
      registeredResidence: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
      currentResidence: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
      relationWithHead: 'Con',
      cccd: '',
      cccdDate: '',
      cccdPlace: '',
      phone: '',
      education: 'Chưa đi học',
      occupation: 'Trẻ em khai sinh',
      maritalStatus: 'Độc thân',
      notes: `Khai sinh đăng ký ngày ${new Date().toLocaleDateString('vi-VN')}`,
      status: 'Thường trú'
    };

    onAddResident(newResident);
    onLogHistory({
      author: currentUserEmail,
      actionType: 'Khai sinh',
      description: `Đăng ký khai sinh cho cháu bé "${targetName.trim()}" (sinh ngày ${new Date(dob).toLocaleDateString('vi-VN')}), nhập hộ khẩu ${selectedHouseNo} thôn Tân An.`
    });

    setFeedbackMsg(`Đăng ký khai sinh thành công cho cháu bé ${targetName}! Đã bổ sung vào số hộ ${selectedHouseNo}.`);
    setTargetName('');
  };

  // 2. Chuyển đến
  const handleMoveInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim() || !inputVal1.trim()) return;

    const newId = "R" + Math.floor(Math.random() * 9000 + 1000).toString();
    const newResident: Resident = {
      id: newId,
      householdNumber: selectedHouseNo,
      fullName: targetName.trim(),
      dob: date1,
      gender,
      ethnicity: 'Kinh',
      religion: 'Không',
      hometown: inputVal1.trim(), // Origin hometown
      registeredResidence: households.find(h => h.householdNumber === selectedHouseNo)?.address || 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
      currentResidence: households.find(h => h.householdNumber === selectedHouseNo)?.address || 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
      relationWithHead: inputVal2.trim() || 'Thành viên',
      cccd: '',
      cccdDate: '',
      cccdPlace: '',
      phone: '',
      education: '12/12',
      occupation: 'Lao động tự do',
      maritalStatus: 'Độc thân',
      notes: `Chuyển đến từ ${inputVal1.trim()}`,
      status: 'Thường trú'
    };

    onAddResident(newResident);
    onLogHistory({
      author: currentUserEmail,
      actionType: 'Chuyển đến',
      description: `Tiếp nhận nhân khẩu "${targetName.trim()}" chuyển thường trú đến từ "${inputVal1.trim()}", nhập hộ khẩu ${selectedHouseNo}.`
    });

    setFeedbackMsg(`Đăng ký nhập khẩu thường trú thành công cho ${targetName} vào hộ ${selectedHouseNo}.`);
    setTargetName('');
    setInputVal1('');
    setInputVal2('');
  };

  // 3. Chuyển đi
  const handleMoveOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;

    const res = residents.find(r => r.id === selectedResidentId);
    if (!res) return;

    const updated: Resident = {
      ...res,
      status: 'Đã chuyển đi',
      notes: (res.notes || '') + ` [Chuyển đi đến ${inputVal1 || 'địa phương khác'} ngày ${new Date().toLocaleDateString('vi-VN')}]`
    };

    onUpdateResident(updated);
    onLogHistory({
      author: currentUserEmail,
      actionType: 'Chuyển đi',
      description: `Đăng ký chuyển đi cho nhân khẩu "${res.fullName}" (Hộ: ${res.householdNumber}) chuyển đến nơi ở mới tại "${inputVal1 || 'Địa phương khác'}".`
    });

    setFeedbackMsg(`Đã đánh dấu nhân khẩu ${res.fullName} là ĐÃ CHUYỂN ĐI thành công.`);
    setSelectedResidentId('');
    setInputVal1('');
  };

  // 4. Tạm trú
  const handleTempResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim() || !inputVal1.trim()) return;

    const newId = "R" + Math.floor(Math.random() * 9000 + 1000).toString();
    const newResident: Resident = {
      id: newId,
      householdNumber: selectedHouseNo,
      fullName: targetName.trim(),
      dob: date1,
      gender,
      ethnicity: 'Kinh',
      religion: 'Không',
      hometown: inputVal1.trim(),
      registeredResidence: inputVal1.trim(), // Keep their original as permanent
      currentResidence: households.find(h => h.householdNumber === selectedHouseNo)?.address || 'Thôn Tân An',
      relationWithHead: 'Người tạm trú',
      cccd: '',
      cccdDate: '',
      cccdPlace: '',
      phone: '',
      education: '12/12',
      occupation: 'Công nhân',
      maritalStatus: 'Độc thân',
      notes: `Đăng ký tạm trú đến ngày ${inputVal2 || 'vô thời hạn'}. Quê gốc: ${inputVal1}`,
      status: 'Tạm trú'
    };

    onAddResident(newResident);
    onLogHistory({
      author: currentUserEmail,
      actionType: 'Tạm trú',
      description: `Đăng ký tạm trú cho nhân khẩu "${targetName.trim()}" (từ ${inputVal1.trim()}) vào lưu trú tại hộ gia đình ${selectedHouseNo}.`
    });

    setFeedbackMsg(`Đăng ký tạm trú thành công cho anh/chị ${targetName} tại hộ ${selectedHouseNo}.`);
    setTargetName('');
    setInputVal1('');
    setInputVal2('');
  };

  // 5. Tạm vắng
  const handleTempAbsentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId || !inputVal1.trim()) return;

    const res = residents.find(r => r.id === selectedResidentId);
    if (!res) return;

    const updated: Resident = {
      ...res,
      status: 'Tạm vắng',
      currentResidence: inputVal1.trim(),
      notes: (res.notes || '') + ` [Khai báo tạm vắng đến ${inputVal1.trim()} vì mục đích: ${inputVal2 || 'Làm ăn/học tập'}]`
    };

    onUpdateResident(updated);
    onLogHistory({
      author: currentUserEmail,
      actionType: 'Tạm vắng',
      description: `Đăng ký tạm vắng cho nhân khẩu "${res.fullName}" (Hộ ${res.householdNumber}) đi làm việc, học tập tại "${inputVal1.trim()}".`
    });

    setFeedbackMsg(`Đăng ký tạm vắng thành công cho nhân khẩu ${res.fullName}.`);
    setSelectedResidentId('');
    setInputVal1('');
    setInputVal2('');
  };

  // 6. Kết hôn
  const handleMarriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId || !targetName.trim()) return;

    const res = residents.find(r => r.id === selectedResidentId);
    if (!res) return;

    const updated: Resident = {
      ...res,
      maritalStatus: 'Đã kết hôn',
      notes: (res.notes || '') + ` [Kết hôn với ${targetName.trim()} ngày ${new Date().toLocaleDateString('vi-VN')}]`
    };

    onUpdateResident(updated);
    onLogHistory({
      author: currentUserEmail,
      actionType: 'Kết hôn',
      description: `Đăng ký kết hôn cho nhân khẩu "${res.fullName}" (Hộ: ${res.householdNumber}) với anh/chị "${targetName.trim()}".`
    });

    setFeedbackMsg(`Cập nhật tình trạng hôn nhân ĐÃ KẾT HÔN thành công cho ${res.fullName}!`);
    setSelectedResidentId('');
    setTargetName('');
  };

  // 7. Ly hôn
  const handleDivorceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;

    const res = residents.find(r => r.id === selectedResidentId);
    if (!res) return;

    const updated: Resident = {
      ...res,
      maritalStatus: 'Đã ly hôn',
      notes: (res.notes || '') + ` [Ly hôn ngày ${new Date().toLocaleDateString('vi-VN')}]`
    };

    onUpdateResident(updated);
    onLogHistory({
      author: currentUserEmail,
      actionType: 'Ly hôn',
      description: `Đăng ký ly hôn cho công dân "${res.fullName}" (Hộ: ${res.householdNumber}) hoàn thành thủ tục.`
    });

    setFeedbackMsg(`Đã cập nhật ly hôn thành công cho ${res.fullName}. Ghi chú đã được lưu.`);
    setSelectedResidentId('');
  };

  // 8. Khai tử
  const handleDeathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;

    const res = residents.find(r => r.id === selectedResidentId);
    if (!res) return;

    const updated: Resident = {
      ...res,
      status: 'Đã mất',
      notes: (res.notes || '') + ` [Từ trần ngày ${date1}. Lý do: ${inputVal1 || 'Tuổi già sức yếu'}]`
    };

    onUpdateResident(updated);
    onLogHistory({
      author: currentUserEmail,
      actionType: 'Khai tử',
      description: `Lập tờ khai khai tử cho công dân "${res.fullName}" (Sinh năm ${res.dob ? res.dob.split('-')[0] : '---'}, thuộc hộ ${res.householdNumber}) qua đời ngày ${new Date(date1).toLocaleDateString('vi-VN')}.`
    });

    setFeedbackMsg(`Quy trình khai tử hoàn tất. Đã cập nhật trạng thái đã mất cho cụ/ông/bà ${res.fullName}. Chân thành chia buồn cùng gia quyết.`);
    setSelectedResidentId('');
    setInputVal1('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Tab Menu Options */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm space-y-1 lg:col-span-1">
        <p className="text-[10px] font-black tracking-widest text-[#118A3B] px-3.5 pt-2 pb-2 uppercase">Giao dịch biến động</p>
        
        {(
          [
            { id: 'birth', label: '👶 Khai sinh mới', desc: 'Đăng ký bé sơ sinh trong thôn' },
            { id: 'move_in', label: '📥 Chuyển thường trú đến', desc: 'Nhập khẩu từ nơi khác tới' },
            { id: 'move_out', label: '📤 Chuyển đi thôn khác', desc: 'Cắt khẩu chuyển vùng mới' },
            { id: 'temp_resident', label: '📌 Đăng ký Tạm trú', desc: 'Khai báo khách lưu trú' },
            { id: 'temp_absent', label: '✈️ Đăng ký Tạm vắng', desc: 'Đi làm ăn xa, nghĩa vụ' },
            { id: 'marriage', label: '💖 Đăng ký Kết hôn', desc: 'Cập nhật vợ/chồng kết duyên' },
            { id: 'divorce', label: '💔 Khai báo Ly hôn', desc: 'Cập nhật ly tán gia đình' },
            { id: 'death', label: '🕯️ Đăng ký Khai tử', desc: 'Thủ tục từ trần cư dân' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => selectTab(item.id)}
            className={`w-full text-left px-3.5 py-3 rounded-xl transition-all duration-150 flex flex-col ${
              activeTab === item.id
                ? 'bg-[#118A3B] text-white shadow-md shadow-emerald-700/10'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="text-xs font-bold leading-normal">{item.label}</span>
            <span className={`text-[9.5px] ${activeTab === item.id ? 'text-emerald-100/80 font-medium' : 'text-gray-400 font-semibold'}`}>{item.desc}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Form Area */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-3 flex flex-col justify-between">
        
        <div>
          <div className="border-b border-gray-100 pb-3 mb-5">
            <h3 className="text-base font-extrabold text-gray-800 capitalize flex items-center space-x-2">
              <Sparkles size={16} className="text-[#118A3B]" />
              <span>Biểu mẫu trợ lý: {activeTab === 'birth' ? 'Khai sinh trẻ em' : activeTab === 'move_in' ? 'Chuyển thường trú đến' : activeTab === 'move_out' ? 'Chuyển đi' : activeTab === 'temp_resident' ? 'Lập hồ sơ tạm trú' : activeTab === 'temp_absent' ? 'Đăng ký tạm vắng' : activeTab === 'marriage' ? 'Kết hôn' : activeTab === 'divorce' ? 'Ly hôn' : 'Khai tử cư dân'}</span>
            </h3>
            <p className="text-xs text-gray-400 font-bold mt-0.5">Tiến hành cập nhật sổ sách cư dân Thôn Tân An chuẩn quy trình Quốc gia</p>
          </div>

          {feedbackMsg && (
            <div className="mb-5 bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-xl border border-emerald-100/60 font-bold flex items-center space-x-2">
              <CheckCircle size={18} className="text-[#118A3B] shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* TAB 1: KHAI SINH */}
          {activeTab === 'birth' && (
            <form onSubmit={handleBirthSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Họ và tên trẻ em khai sinh <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                    placeholder="Ví dụ: Nguyễn Văn Bảo Nam..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Đăng ký vào sổ hộ gia đình <span className="text-red-500">*</span></label>
                  <select
                    value={selectedHouseNo}
                    onChange={(e) => setSelectedHouseNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 font-semibold"
                  >
                    {households.map(h => (
                      <option key={h.householdNumber} value={h.householdNumber}>
                        {h.householdNumber} - Chủ hộ: {h.headName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Ngày sinh cháu bé</label>
                  <input
                    type="date"
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="Nam">Nam (Nam giới)</option>
                    <option value="Nữ">Nữ (Nữ giới)</option>
                  </select>
                </div>
              </div>

              <div className="bg-emerald-50/20 p-3.5 rounded-xl border border-emerald-100 text-xs text-emerald-800 space-y-1">
                <p className="font-extrabold flex items-center"><Plus size={14} className="mr-1" /> Giao dịch tự động:</p>
                <ul className="list-disc pl-4 space-y-0.5 font-bold">
                  <li>Tạo mã nhân khẩu ngẫu nhiên hoàn chỉnh.</li>
                  <li>Thuộc tính quan hệ hệ thống gán mặc định là &ldquo;Con&rdquo;.</li>
                  <li>Ghi log lịch sử hành động &ldquo;Khai sinh&rdquo; phục vụ thống kê.</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#118A3B] hover:bg-[#0d6d2e] text-white font-bold rounded-xl text-sm transition-all"
              >
                Đăng ký khai sinh & Xuất dữ liệu
              </button>
            </form>
          )}

          {/* TAB 2: CHUYỂN ĐẾN */}
          {activeTab === 'move_in' && (
            <form onSubmit={handleMoveInSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Họ và tên nhân khẩu mới <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="Nhập họ và tên..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Vào hộ gia đình <span className="text-red-500">*</span></label>
                  <select
                    value={selectedHouseNo}
                    onChange={(e) => setSelectedHouseNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    {households.map(h => (
                      <option key={h.householdNumber} value={h.householdNumber}>
                        {h.householdNumber} - Chủ hộ: {h.headName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Nguyên quán cũ (Nơi chuyển đi) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={inputVal1}
                    onChange={(e) => setInputVal1(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="Ví dụ: Xã Ea Ly, Huyện Sông Hinh..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Quan hệ với chủ hộ mới</label>
                  <input
                    type="text"
                    value={inputVal2}
                    onChange={(e) => setInputVal2(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="Ví dụ: Con dâu, Chồng, Vợ..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Ngày sinh</label>
                  <input
                    type="date"
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Giới tính</label>
                  <select value={gender} onChange={(e: any) => setGender(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-[#118A3B] hover:bg-[#0d6d2e] text-white font-bold rounded-xl text-sm transition-all">
                Tiếp nhận nhân khẩu thường trú mới
              </button>
            </form>
          )}

          {/* TAB 3: CHUYỂN ĐI */}
          {activeTab === 'move_out' && (
            <form onSubmit={handleMoveOutSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Chọn nhân khẩu sẽ chuyển đi khỏi thôn <span className="text-red-500">*</span></label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                >
                  <option value="">-- Chọn nhân khẩu chuyển đi --</option>
                  {activeResidents.map(r => (
                    <option key={r.id} value={r.id}>{r.fullName} (Hộ {r.householdNumber})</option>
                  ))}
                </select>
              </div>

              {selectedResidentId && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Nơi chuyển đến (Địa chỉ mới) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={inputVal1}
                    onChange={(e) => setInputVal1(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="Ví dụ: Phường Bến Nghé, Quận 1, TP. HCM..."
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedResidentId}
                className="w-full py-2.5 disabled:bg-gray-200 disabled:text-gray-400 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                Xác nhận chuyển nhân khẩu đi
              </button>
            </form>
          )}

          {/* TAB 4: ĐĂNG KÝ TẠM TRÚ */}
          {activeTab === 'temp_resident' && (
            <form onSubmit={handleTempResidentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Họ và tên người tạm trú <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="Nhập họ và tên..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Lưu trú tại hộ dân thôn Tân An <span className="text-red-500">*</span></label>
                  <select
                    value={selectedHouseNo}
                    onChange={(e) => setSelectedHouseNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    {households.map(h => (
                      <option key={h.householdNumber} value={h.householdNumber}>
                        {h.householdNumber} - Chủ hộ: {h.headName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Hộ khẩu thường gốc (Nơi từ đi) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={inputVal1}
                    onChange={(e) => setInputVal1(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="Ví dụ: Huyện Quỳnh Lưu, Tỉnh Nghệ An..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Thời hạn tạm trú</label>
                  <input
                    type="text"
                    value={inputVal2}
                    onChange={(e) => setInputVal2(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="Ví dụ: 12 tháng, 2 năm..."
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-[#118A3B] hover:bg-[#0d6d2e] text-white font-bold rounded-xl text-sm transition-all">
                Đăng ký tạm trú tạm thời
              </button>
            </form>
          )}

          {/* TAB 5: ĐĂNG KÝ TẠM VẮNG */}
          {activeTab === 'temp_absent' && (
            <form onSubmit={handleTempAbsentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Chọn nhân khẩu đăng ký tạm vắng <span className="text-red-500">*</span></label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                >
                  <option value="">-- Chọn nhân khẩu thường trú --</option>
                  {activeResidents.filter(r => r.status === 'Thường trú').map(r => (
                    <option key={r.id} value={r.id}>{r.fullName} (Hộ {r.householdNumber})</option>
                  ))}
                </select>
              </div>

              {selectedResidentId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Nơi tạm trú hiện nay (Nơi đến tạm vắng) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={inputVal1}
                      onChange={(e) => setInputVal1(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      placeholder="Ví dụ: TP. Hà Nội, TP. Hồ Chí Minh..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Lý do chính tạm vắng</label>
                    <input
                      type="text"
                      value={inputVal2}
                      onChange={(e) => setInputVal2(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      placeholder="Ví dụ: Đi làm thuê xa, Học đại học..."
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedResidentId}
                className="w-full py-2.5 disabled:bg-gray-200 disabled:text-gray-400 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                Xác nhận đăng ký tạm vắng
              </button>
            </form>
          )}

          {/* TAB 6: ĐĂNG KÝ KẾT HÔN */}
          {activeTab === 'marriage' && (
            <form onSubmit={handleMarriageSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Nhân khẩu trong thôn kết hôn <span className="text-red-500">*</span></label>
                  <select
                    value={selectedResidentId}
                    onChange={(e) => setSelectedResidentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="">-- Chọn người kết hôn --</option>
                    {activeResidents.map(r => (
                      <option key={r.id} value={r.id}>{r.fullName} ({r.gender} - Hộ {r.householdNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Kết hôn với (Họ và tên vợ/chồng) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="Nhập họ tên người phối ngẫu..."
                  />
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800 flex items-start space-x-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>Khi đăng ký kết hôn, thông thông tin lý lịch cá nhân sẽ tự động chuyển sang trạng thái <strong>&ldquo;Đã kết hôn&rdquo;</strong> và lưu ghi chú tên người chồng/vợ.</span>
              </div>

              <button
                type="submit"
                disabled={!selectedResidentId || !targetName.trim()}
                className="w-full py-2.5 disabled:bg-gray-200 disabled:text-gray-400 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                Xác thực và ghi chú lễ kết hôn
              </button>
            </form>
          )}

          {/* TAB 7: LY HÔN */}
          {activeTab === 'divorce' && (
            <form onSubmit={handleDivorceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 font-sans">Chọn nhân khẩu ly hôn <span className="text-red-500">*</span></label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                >
                  <option value="">-- Chọn công dân --</option>
                  {activeResidents.filter(r => r.maritalStatus === 'Đã kết hôn').map(r => (
                    <option key={r.id} value={r.id}>{r.fullName} (Hộ {r.householdNumber})</option>
                  ))}
                </select>
              </div>

              <div className="bg-orange-50 text-orange-950 p-3 rounded-xl border border-orange-100 text-xs text-center font-bold">
                Cập nhật lý lịch trạng thái hôn nhân về &ldquo;Đã ly hôn&rdquo; cho công dân được chọn.
              </div>

              <button
                type="submit"
                disabled={!selectedResidentId}
                className="w-full py-2.5 disabled:bg-gray-200 disabled:text-gray-400 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                Cập nhật ly hôn
              </button>
            </form>
          )}

          {/* TAB 8: KHAI TỬ LẬP TỜ KHAI */}
          {activeTab === 'death' && (
            <form onSubmit={handleDeathSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Chọn nhân khẩu đã từ trần <span className="text-red-500">*</span></label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                >
                  <option value="">-- Chọn vong nhân --</option>
                  {activeResidents.map(r => (
                    <option key={r.id} value={r.id}>{r.fullName} (Hộ {r.householdNumber} - Sinh năm {r.dob ? r.dob.split('-')[0] : '---'})</option>
                  ))}
                </select>
              </div>

              {selectedResidentId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Mất ngày (Ngày qua đời) <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={date1}
                      onChange={(e) => setDate1(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Nguyên nhân từ trần</label>
                    <input
                      type="text"
                      value={inputVal1}
                      onChange={(e) => setInputVal1(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      placeholder="Ví dụ: Bệnh nặng, Tai nạn, Tuổi già sức muộn..."
                    />
                  </div>
                </div>
              )}

              <div className="bg-red-50 rounded-xl p-3.5 text-xs text-red-900 border border-red-100/50">
                <p className="font-extrabold flex items-center mb-1"><AlertCircle size={14} className="mr-1 inline" /> CẢNH BÁO:</p>
                <span>Quy trình khai tử sẽ thu hồi quyền bầu cử, chuyển trạng thái cư dân trực tuyến về <strong>&ldquo;Đã mất&rdquo;</strong>, tự động xóa ra khỏi tổng số liệu nhân khẩu hoạt động của thôn Tân An.</span>
              </div>

              <button
                type="submit"
                disabled={!selectedResidentId}
                className="w-full py-2.5 disabled:bg-gray-200 disabled:text-gray-400 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl text-sm transition-all"
              >
                Xác nhận ký tờ khai khai tử
              </button>
            </form>
          )}

        </div>

        <div className="text-[10px] text-gray-400 text-center font-medium mt-6 pt-3 border-t border-gray-100 flex items-center justify-center space-x-1">
          <FileText size={12} />
          <span>Hệ thống áp dụng chuẩn dữ liệu đồng bộ hóa Tư pháp - Hộ tịch thôn.</span>
        </div>

      </div>

    </div>
  );
}
