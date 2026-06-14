/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Resident, Household } from '../types';
import { Search, Plus, Edit, Trash2, ArrowLeftRight, User, Eye, Phone, ShieldAlert, BadgeInfo, FileText, CheckCircle } from 'lucide-react';

interface ResidentsViewProps {
  residents: Resident[];
  households: Household[];
  currentUserRole: 'admin' | 'officer';
  selectedHouseholdNumber: string; // "All" or a specific household code
  onClearHouseholdFilter: () => void;
  onAddResident: (res: Resident) => void;
  onUpdateResident: (res: Resident) => void;
  onDeleteResident: (id: string) => void;
}

export default function ResidentsView({
  residents,
  households,
  currentUserRole,
  selectedHouseholdNumber,
  onClearHouseholdFilter,
  onAddResident,
  onUpdateResident,
  onDeleteResident,
}: ResidentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAllFields, setShowAllFields] = useState(false);

  // Detail Modal State
  const [viewingResident, setViewingResident] = useState<Resident | null>(null);
  
  // Create / Edit modal state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formFields, setFormFields] = useState<Partial<Resident>>({});

  // Transfer Household modal state
  const [transferringResident, setTransferringResident] = useState<Resident | null>(null);
  const [targetHouseholdNumber, setTargetHouseholdNumber] = useState('');

  // Filtering residents
  const filteredResidents = residents.filter((r) => {
    // Household filter
    if (selectedHouseholdNumber !== 'All' && r.householdNumber !== selectedHouseholdNumber) {
      return false;
    }

    // Gender filter & status filter
    if (selectedStatus === 'ActiveOnly') {
      if (r.status === 'Đã chuyển đi' || r.status === 'Đã mất') return false;
    } else if (selectedStatus !== 'All' && r.status !== selectedStatus) {
      return false;
    }

    if (selectedGender !== 'All' && r.gender !== selectedGender) {
      return false;
    }

    // Text search input matches
    const searchLower = searchTerm.toLowerCase();
    const dobValue = r.dob || '';
    const matchText =
      r.fullName.toLowerCase().includes(searchLower) ||
      (r.cccd && r.cccd.includes(searchLower)) ||
      dobValue.includes(searchLower) ||
      (r.phone && r.phone.includes(searchLower)) ||
      (r.occupation && r.occupation.toLowerCase().includes(searchLower));

    return matchText;
  });

  const getHouseholdHeadName = (num: string) => {
    const house = households.find(h => h.householdNumber === num);
    return house ? house.headName : 'Chưa rõ';
  };

  // Open creation modal
  const openAddModal = () => {
    setIsEditMode(false);
    setFormFields({
      id: "R" + Math.floor(Math.random() * 9000 + 1000).toString(),
      householdNumber: selectedHouseholdNumber !== 'All' ? selectedHouseholdNumber : (households[0]?.householdNumber || 'HK001'),
      fullName: '',
      dob: '2000-01-01',
      gender: 'Nam',
      ethnicity: 'Kinh',
      religion: 'Không',
      hometown: 'Xã Ea Ly, Tỉnh Đắk Lắk',
      registeredResidence: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
      currentResidence: 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk',
      relationWithHead: 'Thành viên',
      cccd: '',
      cccdDate: '',
      cccdPlace: '',
      phone: '',
      education: '12/12',
      occupation: 'Làm nông',
      maritalStatus: 'Độc thân',
      notes: '',
      status: 'Thường trú'
    });
    setIsAddEditOpen(true);
  };

  // Open Edit modal
  const openEditModal = (r: Resident) => {
    setIsEditMode(true);
    setFormFields({ ...r });
    setIsAddEditOpen(true);
  };

  // Save the record
  const handleSaveResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.fullName || !formFields.fullName.trim()) {
      alert('Họ và tên bắt buộc phải có.');
      return;
    }

    if (isEditMode) {
      onUpdateResident(formFields as Resident);
    } else {
      onAddResident(formFields as Resident);
    }
    setIsAddEditOpen(false);
  };

  // Open transfer modal
  const openTransferModal = (r: Resident) => {
    setTransferringResident(r);
    // Find first household other than their own, or current
    const initialTarget = households.find(h => h.householdNumber !== r.householdNumber)?.householdNumber || r.householdNumber;
    setTargetHouseholdNumber(initialTarget);
  };

  // Handle transfer
  const handleTransferHouseholdSubmit = () => {
    if (!transferringResident || !targetHouseholdNumber) return;
    if (targetHouseholdNumber === transferringResident.householdNumber) {
      alert('Nhân khẩu vốn dĩ đã thuộc hộ khẩu này!');
      return;
    }

    const updated = {
      ...transferringResident,
      householdNumber: targetHouseholdNumber,
      notes: (transferringResident.notes || '') + ` [Chuyển từ hộ ${transferringResident.householdNumber} sang hộ ${targetHouseholdNumber} vào ${new Date().toLocaleDateString('vi-VN')}]`
    };
    onUpdateResident(updated);
    setTransferringResident(null);
  };

  const confirmDelete = (r: Resident) => {
    if (confirm(`Bạn có chắc chắn muốn xóa hẳn nhân khẩu "${r.fullName}" khỏi cơ sở dữ liệu? Cách này không khôi phục được. Xem xét đánh dấu là đã chuyển đi hoặc đã mất thay vì xóa!`)) {
      onDeleteResident(r.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Header feedback if a household is selected */}
      {selectedHouseholdNumber !== 'All' && (
        <div className="bg-[#118A3B]/10 p-4 rounded-2xl border border-[#118A3B]/20 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-emerald-900">
            <CheckCircle className="text-[#118A3B]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Đang xem nhân khẩu của hộ</p>
              <h4 className="text-sm font-extrabold font-sans">
                Chủ hộ: {getHouseholdHeadName(selectedHouseholdNumber)} (Số Hổ: {selectedHouseholdNumber})
              </h4>
            </div>
          </div>
          <button
            onClick={onClearHouseholdFilter}
            className="text-white bg-[#118A3B] hover:bg-[#0d6d2e] px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            Xem tất cả nhân khẩu
          </button>
        </div>
      )}

      {/* Advanced search widget */}
      <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              id="input-search-resident"
              placeholder="Tìm theo tên, số CCCD, năm sinh, SĐT, nghề nghiệp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white w-full"
            />
          </div>

          <select
            id="select-gender-filter"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
          >
            <option value="All">Tất cả Giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <select
            id="select-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
          >
            <option value="ActiveOnly">Nhân khẩu hoạt động</option>
            <option value="All">Tất cả (Gồm đã chuyển đi/mất)</option>
            <option value="Thường trú">Chỉ Thường trú</option>
            <option value="Tạm trú">Chỉ Tạm trú</option>
            <option value="Tạm vắng">Chỉ Tạm vắng</option>
            <option value="Đã chuyển đi">Đã chuyển đi</option>
            <option value="Đã mất">Đã mất</option>
          </select>

        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs text-gray-500 font-semibold font-mono bg-gray-50 px-2 py-1 rounded-md border border-gray-150">
              Đang hiển thị {filteredResidents.length} kết quả phù hợp
            </div>
            <label className="flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100/50 text-emerald-800 text-xs px-3 py-1.5 rounded-xl border border-emerald-100 select-none cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={showAllFields}
                onChange={(e) => setShowAllFields(e.target.checked)}
                className="rounded text-[#118A3B] focus:ring-[#118A3B]/40 border-gray-300 w-3.5 h-3.5 cursor-pointer accent-[#118A3B]"
              />
              <span className="font-bold">Xem bảng tổng hợp đầy đủ 17 trường thông tin</span>
            </label>
          </div>
          
          <button
            onClick={openAddModal}
            id="btn-add-resident"
            className="bg-[#118A3B] hover:bg-[#0d6d2e] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Thêm nhân khẩu mới</span>
          </button>
        </div>
      </div>

      {/* Residents custom table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Họ và tên</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Ngày sinh / GT</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Hộ &amp; Q.Hệ CH</th>
                {showAllFields && (
                  <>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Dân tộc / Tôn giáo</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">SĐT &amp; Hôn nhân</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Học vấn &amp; Việc làm</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Quê quán &amp; Cư trú hiện tại</th>
                  </>
                )}
                <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {filteredResidents.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  
                  {/* Name column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                        {r.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900 whitespace-nowrap">{r.fullName}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{r.cccd || 'Không có CCCD'}</p>
                      </div>
                    </div>
                  </td>

                  {/* DOB & Gender */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-600 font-mono">
                      {r.dob ? new Date(r.dob).toLocaleDateString('vi-VN') : '---'}
                    </p>
                    <p className="mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.gender === 'Nam' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                        {r.gender}
                      </span>
                    </p>
                  </td>

                  {/* House ID & Head & relation */}
                  <td className="px-4 py-3">
                    <p className="font-bold text-emerald-800">{r.householdNumber}</p>
                    <p className="text-[10px] text-gray-400 font-semibold truncate max-w-[120px]">Chủ: {getHouseholdHeadName(r.householdNumber)}</p>
                    <p className="text-[10px] text-gray-500 font-bold mt-1">{r.relationWithHead}</p>
                  </td>

                  {/* Detailed Fields when showAllFields is TRUE */}
                  {showAllFields && (
                    <>
                      {/* Dân tộc / Tôn giáo */}
                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold text-gray-700"><span className="text-gray-450 text-[10px] font-medium block uppercase tracking-tight">Dân tộc</span>{r.ethnicity || 'Kinh'}</p>
                        <p className="font-semibold text-gray-750 mt-1"><span className="text-gray-450 text-[10px] font-medium block uppercase tracking-tight">Tôn giáo</span>{r.religion || 'Không'}</p>
                      </td>

                      {/* SĐT & Hôn nhân */}
                      <td className="px-4 py-3 text-xs font-mono">
                        <p className="font-bold text-emerald-800"><span className="text-gray-450 text-[10px] font-serif font-semibold block uppercase tracking-tight">Số điện thoại</span>{r.phone || 'Chưa có SĐT'}</p>
                        <p className="font-semibold text-gray-600 mt-1 font-sans"><span className="text-gray-450 text-[10px] font-medium block uppercase tracking-tight">Hôn nhân</span>{r.maritalStatus || 'Độc thân'}</p>
                      </td>

                      {/* Học vấn & Việc làm */}
                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold text-gray-700 truncate max-w-[150px]"><span className="text-gray-450 text-[10px] font-medium block uppercase tracking-tight">Nghề nghiệp</span>{r.occupation || 'Tự do'}</p>
                        <p className="font-semibold text-gray-600 mt-1"><span className="text-gray-450 text-[10px] font-medium block uppercase tracking-tight">Học vấn</span>{r.education || '12/12'}</p>
                      </td>

                      {/* Quê quán & Cư trú */}
                      <td className="px-4 py-3 text-xs max-w-xs">
                        <p className="text-gray-700 leading-tight font-medium" title={r.hometown}><span className="text-gray-455 text-[10px] font-bold block uppercase tracking-tight">Quê quán</span>{r.hometown}</p>
                        <p className="text-gray-600 leading-tight mt-1.5 font-medium" title={r.currentResidence}><span className="text-gray-455 text-[10px] font-bold block uppercase tracking-tight">Nơi ở hiện nay</span>{r.currentResidence}</p>
                      </td>
                    </>
                  )}

                  {/* Status Badge */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold select-none whitespace-nowrap ${
                      r.status === 'Thường trú' ? 'bg-emerald-100 text-emerald-800' :
                      r.status === 'Tạm trú' ? 'bg-amber-100 text-amber-800' :
                      r.status === 'Tạm vắng' ? 'bg-purple-100 text-purple-800' :
                      r.status === 'Đã chuyển đi' ? 'bg-gray-100 text-gray-500' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => setViewingResident(r)}
                        className="p-1 hover:bg-white border hover:border-gray-100 rounded-lg text-emerald-700"
                        title="Xem đầy đủ 17 trường thông tin"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1 hover:bg-white border hover:border-gray-100 rounded-lg text-blue-600"
                        title="Sửa lý lịch nhân khẩu"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => openTransferModal(r)}
                        className="p-1 hover:bg-white border hover:border-gray-100 rounded-lg text-amber-600"
                        title="Chuyển nhân khẩu sang hộ gia đình khác"
                      >
                        <ArrowLeftRight size={14} />
                      </button>
                      {currentUserRole === 'admin' && (
                        <button
                          onClick={() => confirmDelete(r)}
                          className="p-1 hover:bg-white border hover:border-gray-100 rounded-lg text-red-600"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan={showAllFields ? 10 : 6} className="px-4 py-12 text-center text-gray-400 font-bold">
                    Không tìm thấy nhân khẩu nào khớp với các chỉ tiêu tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL 17-FIELDS RESIDENT PROFILE DIALOG */}
      {viewingResident && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transform animate-scale-up">
            <div className="bg-[#118A3B] text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileText size={18} />
                <h3 className="font-extrabold text-base">Hồ sơ Nhân khẩu Thôn Tân An</h3>
              </div>
              <button onClick={() => setViewingResident(null)} className="text-white hover:opacity-85 font-mono text-xl">×</button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
              
              {/* Profile Card Header */}
              <div className="flex items-center space-x-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-50">
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-black text-2xl flex items-center justify-center">
                  {viewingResident.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-gray-900">{viewingResident.fullName}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      Hộ: {viewingResident.householdNumber}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      Quan hệ: {viewingResident.relationWithHead}
                    </span>
                  </div>
                </div>
              </div>

              {/* 17 Fields Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-gray-400 font-bold">NGÀY THÁNG NĂM SINH</p>
                  <p className="text-gray-800 font-extrabold font-mono text-[13px]">
                    {viewingResident.dob ? new Date(viewingResident.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-gray-400 font-bold">GIỚI TÍNH</p>
                  <p className="text-gray-800 font-extrabold text-[13px]">{viewingResident.gender}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-gray-400 font-bold">DÂN TỘC</p>
                  <p className="text-gray-800 font-extrabold text-[13px]">{viewingResident.ethnicity || 'Kinh'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-gray-400 font-bold">TÔN GIÁO</p>
                  <p className="text-gray-800 font-extrabold text-[13px]">{viewingResident.religion || 'Không'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 sm:col-span-2">
                  <p className="text-gray-400 font-bold">QUÊ QUÁN (NGUYÊN QUÁN)</p>
                  <p className="text-gray-800 font-extrabold leading-relaxed text-[13px]">{viewingResident.hometown || 'Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 sm:col-span-2">
                  <p className="text-gray-400 font-bold">NƠI ĐĂNG KÝ THƯỜNG TRÚ</p>
                  <p className="text-gray-800 font-extrabold leading-relaxed text-[13px]">{viewingResident.registeredResidence}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 sm:col-span-2">
                  <p className="text-gray-400 font-bold">NƠI Ở HIỆN TẠI</p>
                  <p className="text-gray-800 font-extrabold leading-relaxed text-[13px]">{viewingResident.currentResidence}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-gray-400 font-bold">SỐ CCCD / ĐỊNH DANH</p>
                  <p className="text-gray-800 font-extrabold font-mono text-[13px]">{viewingResident.cccd || 'Chưa cung cấp / Trẻ em'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-gray-400 font-bold">SỐ ĐIỆN THOẠI</p>
                  <p className="text-emerald-800 font-extrabold text-[13px]">{viewingResident.phone || 'Chưa khai báo SĐT'}</p>
                </div>

                {viewingResident.cccd && (
                  <>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                      <p className="text-gray-400 font-bold">NGÀY CẤP CCCD</p>
                      <p className="text-gray-800 font-semibold text-[13px]">{viewingResident.cccdDate || '---'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                      <p className="text-gray-400 font-bold">NƠI CẤP CCCD</p>
                      <p className="text-gray-800 font-semibold text-[13px]">{viewingResident.cccdPlace || '---'}</p>
                    </div>
                  </>
                )}

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-gray-400 font-bold">TRÌNH ĐỘ HỌC VẤN</p>
                  <p className="text-gray-800 font-extrabold text-[13px]">{viewingResident.education || '12/12'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-gray-400 font-bold">NGHỀ NGHIỆP HIỆN TẠI</p>
                  <p className="text-gray-800 font-extrabold text-[13px]">{viewingResident.occupation || 'Tự do'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-gray-400 font-bold">TÌNH TRẠNG HÔN NHÂN</p>
                  <p className="text-gray-800 font-extrabold text-[13px]">{viewingResident.maritalStatus || 'Độc thân'}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-gray-400 font-bold">TRẠNG THÁI BIỂN ĐỘNG</p>
                  <span className={`inline-block font-extrabold px-3 py-0.5 mt-0.5 rounded-full text-[10px] uppercase ${
                    viewingResident.status === 'Thường trú' ? 'bg-emerald-100 text-emerald-800' :
                    viewingResident.status === 'Tạm trú' ? 'bg-amber-100 text-amber-800' :
                    viewingResident.status === 'Tạm vắng' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {viewingResident.status}
                  </span>
                </div>

                <div className="bg-emerald-50/20 p-3 rounded-xl border border-emerald-100 sm:col-span-2 space-y-1">
                  <p className="text-emerald-800 font-bold">GHI CHÚ HỒ SƠ</p>
                  <p className="text-gray-600 italic leading-relaxed text-[13px]">{viewingResident.notes || 'Không có ghi chú nào thêm.'}</p>
                </div>
              </div>

              <div className="text-right pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setViewingResident(null)}
                  className="px-5 py-2.5 bg-[#118A3B] hover:bg-[#0d6d2e] text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Đóng hồ sơ lý lịch
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT DOCK DIALOG */}
      {isAddEditOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transform animate-scale-up">
            <div className="bg-[#118A3B] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">
                {isEditMode ? 'Sửa Lý Lịch Nhân Khẩu' : 'Thêm Nhân Khẩu Thôn Tân An'}
              </h3>
              <button onClick={() => setIsAddEditOpen(false)} className="text-white font-mono text-xl">×</button>
            </div>

            <form onSubmit={handleSaveResident} className="p-6 overflow-y-auto max-h-[80vh] space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Họ và tên nhâm khẩu <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formFields.fullName || ''}
                    onChange={(e) => setFormFields({ ...formFields, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                    placeholder="Nhập họ và tên đầy đủ..."
                  />
                </div>

                {/* Belonging Household */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Thuộc sổ hộ khẩu <span className="text-red-500">*</span></label>
                  <select
                    value={formFields.householdNumber || ''}
                    onChange={(e) => setFormFields({ ...formFields, householdNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  >
                    {households.map(h => (
                      <option key={h.householdNumber} value={h.householdNumber}>
                        {h.householdNumber} - Chủ hộ: {h.headName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DOB */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Ngày, tháng, năm sinh <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formFields.dob || ''}
                    onChange={(e) => setFormFields({ ...formFields, dob: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Giới tính <span className="text-red-500">*</span></label>
                  <select
                    value={formFields.gender || 'Nam'}
                    onChange={(e: any) => setFormFields({ ...formFields, gender: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                {/* Ethnicity & Religion */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Dân tộc <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formFields.ethnicity || 'Kinh'}
                    onChange={(e) => setFormFields({ ...formFields, ethnicity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Tôn giáo <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formFields.religion || 'Không'}
                    onChange={(e) => setFormFields({ ...formFields, religion: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Hometown */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500">Quê quán (Nguyên quán) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formFields.hometown || ''}
                    onChange={(e) => setFormFields({ ...formFields, hometown: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Registered Residence */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500">Nơi đăng ký thường trú <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formFields.registeredResidence || ''}
                    onChange={(e) => setFormFields({ ...formFields, registeredResidence: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Current Residence */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500">Nơi ở hiện nay <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formFields.currentResidence || ''}
                    onChange={(e) => setFormFields({ ...formFields, currentResidence: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* CCCD & Date & Place */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Số CCCD / Chứng minh nhân dân</label>
                  <input
                    type="text"
                    value={formFields.cccd || ''}
                    onChange={(e) => setFormFields({ ...formFields, cccd: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    placeholder="Chừa trống nếu là trẻ em"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    value={formFields.phone || ''}
                    onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                {formFields.cccd && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">Ngày cấp CCCD</label>
                      <input
                        type="date"
                        value={formFields.cccdDate || ''}
                        onChange={(e) => setFormFields({ ...formFields, cccdDate: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">Nơi cấp CCCD</label>
                      <input
                        type="text"
                        value={formFields.cccdPlace || ''}
                        onChange={(e) => setFormFields({ ...formFields, cccdPlace: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                        placeholder="Nơi cấp..."
                      />
                    </div>
                  </>
                )}

                {/* Relation, education, job, marriage, notes */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Quan hệ với chủ hộ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Vợ, Con trai, Con dâu, Cháu nội..."
                    value={formFields.relationWithHead || ''}
                    onChange={(e) => setFormFields({ ...formFields, relationWithHead: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Trình độ học vấn</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đại học, 12/12..."
                    value={formFields.education || ''}
                    onChange={(e) => setFormFields({ ...formFields, education: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Nghề nghiệp</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Làm nông, Giáo viên, Tự do..."
                    value={formFields.occupation || ''}
                    onChange={(e) => setFormFields({ ...formFields, occupation: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Tình trạng hôn nhân</label>
                  <select
                    value={formFields.maritalStatus || 'Độc thân'}
                    onChange={(e: any) => setFormFields({ ...formFields, maritalStatus: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="Độc thân">Độc thân</option>
                    <option value="Đã kết hôn">Đã kết hôn</option>
                    <option value="Đã ly hôn">Đã ly hôn</option>
                    <option value="Góa">Góa</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Trạng thái nhân khẩu</label>
                  <select
                    value={formFields.status || 'Thường trú'}
                    onChange={(e: any) => setFormFields({ ...formFields, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="Thường trú">Thường trú</option>
                    <option value="Tạm trú">Tạm trú</option>
                    <option value="Tạm vắng">Tạm vắng</option>
                    <option value="Đã chuyển đi">Đã chuyển đi</option>
                    <option value="Đã mất">Đã mất</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-500">Ghi chú bổ sung</label>
                  <textarea
                    rows={2}
                    value={formFields.notes || ''}
                    onChange={(e) => setFormFields({ ...formFields, notes: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white"
                    placeholder="Điền thông tin khác..."
                  ></textarea>
                </div>

              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#118A3B] hover:bg-[#0d6d2e] text-white text-sm font-bold rounded-xl transition-all"
                >
                  Lưu thay đổi nhân khẩu
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TRANSFER HOUSEHOLD DIALOG */}
      {transferringResident && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform animate-scale-up">
            <div className="bg-[#118A3B] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <ArrowLeftRight size={18} />
                <span>Chuyển Hộ Khẩu Gia Đình</span>
              </h3>
              <button onClick={() => setTransferringResident(null)} className="text-white font-mono text-xl">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100/50 text-xs text-amber-900 flex space-x-2">
                <span className="font-bold shrink-0 mt-0.5">Lưu ý:</span>
                <span>
                  Hành động này sẽ di chuyển nhân khẩu này sang một hộ gia đình mới trên địa bàn Thôn Tân An. Bản ghi lịch sử sẽ được tự động đồng bộ hóa.
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-400 font-bold">NHÂN KHẨU ĐƯỢC CHUYỂN</p>
                <p className="text-sm font-extrabold text-gray-800">{transferringResident.fullName} (Hộ hiện tại: {transferringResident.householdNumber})</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 block">CHỌN HỘ KHẨU MỚI</label>
                <select
                  value={targetHouseholdNumber}
                  onChange={(e) => setTargetHouseholdNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 font-medium"
                >
                  {households.map(h => (
                    <option key={h.householdNumber} value={h.householdNumber}>
                      {h.householdNumber} - Chủ hộ: {h.headName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setTransferringResident(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleTransferHouseholdSubmit}
                  className="px-5 py-2 bg-[#118A3B] hover:bg-[#0d6d2e] text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Xác nhận chuyển hộ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
