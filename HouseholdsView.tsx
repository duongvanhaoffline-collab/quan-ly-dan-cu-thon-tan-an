/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Household, Resident } from '../types';
import { Search, Plus, Edit, Trash2, Home, UserCheck, Calendar, Phone, MapPin, Eye, ArrowRight, UserPlus, Info } from 'lucide-react';

interface HouseholdsViewProps {
  households: Household[];
  residents: Resident[];
  currentUserRole: 'admin' | 'officer';
  onAddHousehold: (household: Household) => void;
  onUpdateHousehold: (household: Household) => void;
  onDeleteHousehold: (householdNumber: string) => void;
  onSelectHouseholdMembers: (householdNumber: string) => void;
  onQuickAddResident: (householdNumber: string) => void;
}

export default function HouseholdsView({
  households,
  residents,
  currentUserRole,
  onAddHousehold,
  onUpdateHousehold,
  onDeleteHousehold,
  onSelectHouseholdMembers,
  onQuickAddResident,
}: HouseholdsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedXom, setSelectedXom] = useState('All');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentEditHouse, setCurrentEditHouse] = useState<Household | null>(null);

  // New house form state
  const [newNum, setNewNum] = useState('');
  const [newHead, setNewHead] = useState('');
  const [newAddress, setNewAddress] = useState('Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk');
  const [newPhone, setNewPhone] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState('');

  // Search filter
  const filteredHouseholds = households.filter((h) => {
    const matchesSearch =
      h.householdNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.headName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedXom === 'All') return matchesSearch;
    return matchesSearch && h.address.toLowerCase().includes(selectedXom.toLowerCase());
  });

  const getMemberCount = (num: string) => {
    return residents.filter(r => r.householdNumber === num && r.status !== 'Đã chuyển đi' && r.status !== 'Đã mất').length;
  };

  const handleOpenEdit = (h: Household) => {
    setCurrentEditHouse(h);
    setIsEditOpen(true);
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNum.trim() || !newHead.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ số hộ khẩu và tên chủ hộ.');
      return;
    }
    if (households.some(h => h.householdNumber.toUpperCase() === newNum.trim().toUpperCase())) {
      setErrorMsg('Số sổ hộ khẩu này đã tồn tại trên hệ thống!');
      return;
    }

    onAddHousehold({
      householdNumber: newNum.trim().toUpperCase(),
      headName: newHead.trim(),
      address: newAddress.trim(),
      phone: newPhone.trim(),
      creationDate: newDate
    });

    // Resetform
    setNewNum('');
    setNewHead('');
    setNewAddress('Thôn Tân An, xã Ea Ly, tỉnh Đắk Lắk');
    setNewPhone('');
    setIsAddOpen(false);
    setErrorMsg('');
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditHouse) return;
    if (!currentEditHouse.headName.trim() || !currentEditHouse.address.trim()) {
      alert('Vui lòng nhập tên chủ hộ và địa chỉ hợp lệ.');
      return;
    }
    onUpdateHousehold(currentEditHouse);
    setIsEditOpen(false);
  };

  const confirmDelete = (h: Household) => {
    const count = getMemberCount(h.householdNumber);
    if (count > 0) {
      alert(`Hộ khẩu ${h.householdNumber} đang có ${count} nhân khẩu hoạt động. Vui lòng chuyển hoặc xóa hết nhân khẩu trong hộ trước khi xóa hộ khẩu!`);
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa hộ gia đình chủ hộ "${h.headName}" (Số hộ: ${h.householdNumber})?`)) {
      onDeleteHousehold(h.householdNumber);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              id="input-search-house"
              placeholder="Tìm theo chủ hộ, Sổ hộ (HK...), hoặc địa chỉ xóm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white w-full"
            />
          </div>
          
          <select
            id="select-xom-filter"
            value={selectedXom}
            onChange={(e) => setSelectedXom(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
          >
            <option value="All">Tất cả Xóm</option>
            <option value="Xóm Đông">Xóm Đông</option>
            <option value="Xóm Tây">Xóm Tây</option>
            <option value="Xóm Nam">Xóm Nam</option>
            <option value="Xóm Bắc">Xóm Bắc</option>
            <option value="Xóm Trung">Xóm Trung</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          id="btn-add-household-modal"
          className="bg-[#118A3B] hover:bg-[#0d6d2e] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-colors duration-200"
        >
          <Plus size={18} />
          <span>Thêm hộ gia đình</span>
        </button>
      </div>

      {/* Grid of households */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHouseholds.map((h) => {
          const members = getMemberCount(h.householdNumber);
          return (
            <div
              key={h.householdNumber}
              id={`house-card-${h.householdNumber}`}
              className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-md hover:shadow-emerald-500/5 transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Header Box */}
              <div className="p-5 border-b border-gray-50 bg-gradient-to-br from-emerald-50/20 to-transparent">
                <div className="flex justify-between items-start">
                  <div className="text-[11px] font-black tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase">
                    Số hộ: {h.householdNumber}
                  </div>
                  <div className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[11px] font-bold">
                    <UserCheck size={12} />
                    <span>{members} nhân khẩu</span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-gray-800 mt-3 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>{h.headName}</span>
                </h3>
                <p className="text-xs text-gray-400 font-bold mt-0.5">Chủ hộ gia đình</p>
              </div>

              {/* Data Rows */}
              <div className="p-5 space-y-3.5 flex-1">
                <div className="flex items-start space-x-2.5 text-xs">
                  <MapPin size={16} className="text-[#118A3B] shrink-0 mt-0.5" />
                  <span className="text-gray-600 font-medium">{h.address}</span>
                </div>

                {h.phone && (
                  <div className="flex items-center space-x-2.5 text-xs">
                    <Phone size={16} className="text-[#118A3B] shrink-0" />
                    <span className="text-gray-600 font-medium">{h.phone}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2.5 text-xs">
                  <Calendar size={16} className="text-[#118A3B] shrink-0" />
                  <span className="text-gray-500 font-semibold">Lập sổ: {h.creationDate}</span>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="bg-gray-50 px-5 py-3.5 border-t border-gray-50 flex justify-between items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(h)}
                    id={`btn-edit-house-${h.householdNumber}`}
                    className="p-1.5 hover:bg-white border border-transparent hover:border-gray-100 rounded-lg text-gray-500 hover:text-emerald-700 transition-all"
                    title="Cập nhật thông tin sổ hộ"
                  >
                    <Edit size={16} />
                  </button>
                  {currentUserRole === 'admin' && (
                    <button
                      onClick={() => confirmDelete(h)}
                      id={`btn-delete-house-${h.householdNumber}`}
                      className="p-1.5 hover:bg-white border border-transparent hover:border-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-all"
                      title="Xóa sổ hộ"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onQuickAddResident(h.householdNumber)}
                    className="text-[11px] font-bold text-[#118A3B] hover:bg-[#118A3B]/10 border border-[#118A3B]/15 px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-all"
                  >
                    <UserPlus size={12} />
                    <span>Thêm người</span>
                  </button>

                  <button
                    onClick={() => onSelectHouseholdMembers(h.householdNumber)}
                    className="text-[11px] font-bold text-white bg-[#118A3B] hover:bg-[#0d6d2e] px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
                  >
                    <span>Xem DSTV</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredHouseholds.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200">
            <Home size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-bold text-sm">Không tìm thấy hộ gia đình nào phù hợp yêu cầu.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedXom('All'); }} className="text-[#118A3B] font-bold md:p-3 mt-2 hover:underline text-xs">
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD HOUSEHOLD */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform animate-scale-up">
            <div className="bg-[#118A3B] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <Home size={18} />
                <span>Thêm Sổ Hộ Khẩu Mới</span>
              </h3>
              <button onClick={() => { setIsAddOpen(false); setErrorMsg(''); }} className="text-white hover:opacity-85 font-mono text-xl">×</button>
            </div>

            <form onSubmit={submitAdd} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Số sổ hộ gia đình <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: HK006"
                    value={newNum}
                    onChange={(e) => setNewNum(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Họ và tên Chủ hộ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên chủ hộ..."
                    value={newHead}
                    onChange={(e) => setNewHead(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Địa chỉ chi tiết xóm <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Số điện thoại chủ hộ</label>
                  <input
                    type="tel"
                    placeholder="Điền số điện thoại (nếu có)"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Ngày đăng ký lập sổ</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">{errorMsg}</p>
              )}

              <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start space-x-2">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <span>
                  Sau khi thêm mới sổ gia đình thành công, hãy chọn nút <strong>Xem DSTV &rArr; Thêm nhân khẩu</strong> để bổ sung các thành viên trong gia đình vào sổ này.
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setErrorMsg(''); }}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#118A3B] hover:bg-[#0d6d2e] text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Xác nhận lưu
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT HOUSEHOLD */}
      {isEditOpen && currentEditHouse && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform animate-scale-up">
            <div className="bg-[#118A3B] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <Edit size={18} />
                <span>Sửa Thông Tin Sổ Hộ Thôn Tân An</span>
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-white hover:opacity-85 font-mono text-xl">×</button>
            </div>

            <form onSubmit={submitEdit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Số sổ hộ khẩu (Không sửa)</label>
                  <input
                    type="text"
                    disabled
                    value={currentEditHouse.householdNumber}
                    className="w-full px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 select-none uppercase font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Họ và tên Chủ hộ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={currentEditHouse.headName}
                    onChange={(e) => setCurrentEditHouse({ ...currentEditHouse, headName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Địa chỉ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={currentEditHouse.address}
                  onChange={(e) => setCurrentEditHouse({ ...currentEditHouse, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    value={currentEditHouse.phone}
                    onChange={(e) => setCurrentEditHouse({ ...currentEditHouse, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Ngày ký sổ</label>
                  <input
                    type="date"
                    value={currentEditHouse.creationDate}
                    onChange={(e) => setCurrentEditHouse({ ...currentEditHouse, creationDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#118A3B] hover:bg-[#0d6d2e] text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
