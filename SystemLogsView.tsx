/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { HistoryLog, Household, Resident, SystemUser } from '../types';
import { ShieldCheck, Download, Upload, Trash2, Search, Table, FileSpreadsheet, CheckCircle2, RefreshCw, Layers, FileText } from 'lucide-react';

interface SystemLogsViewProps {
  logs: HistoryLog[];
  households: Household[];
  residents: Resident[];
  currentUser: SystemUser;
  onSetCurrentUser: (user: SystemUser) => void;
  onClearLogs: () => void;
  onRestoreBackup: (households: Household[], residents: Resident[], logs: HistoryLog[]) => void;
  onMassImportResidents: (pastedRows: string) => { success: boolean; count: number; error?: string };
  onClearAllData: () => void;
}

export default function SystemLogsView({
  logs,
  households,
  residents,
  currentUser,
  onSetCurrentUser,
  onClearLogs,
  onRestoreBackup,
  onMassImportResidents,
  onClearAllData,
}: SystemLogsViewProps) {
  const [searchLog, setSearchLog] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('All');
  
  // Excel Pasteur State
  const [pastedExcel, setPastedExcel] = useState('');
  const [importResult, setImportResult] = useState<{ success: boolean; count: number; error?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Upload and Parse Excel/CSV Document directly
  const handleUploadExcelFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text.trim()) {
          alert('Tài liệu tải lên trống rỗng!');
          return;
        }
        
        // Remove UTF-8 BOM if present
        const cleanText = text.replace(/^\uFEFF/, '');
        const res = onMassImportResidents(cleanText);
        setImportResult(res);
        if (res.success) {
          alert(`Tải tài liệu lên hệ thống thành công! Đã kết nạp ${res.count} nhân khẩu hàng loạt vào cơ sở dữ liệu thôn.`);
        } else {
          alert(`Thất bại khi phân tích tài liệu: ${res.error || 'Định dạng dữ liệu không khớp'}`);
        }
      } catch (err) {
        alert('Có lỗi xảy ra khi đọc tệp tài liệu. Đảm bảo sử dụng file .csv hoặc .txt tiếng Việt mã hóa UTF-8!');
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow uploading the same file again
    e.target.value = '';
  };

  // Search logs
  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      l.author.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.description.toLowerCase().includes(searchLog.toLowerCase());
    
    if (selectedActionType === 'All') return matchesSearch;
    return matchesSearch && l.actionType === selectedActionType;
  });

  const getLogActions = () => {
    const set = new Set(logs.map(l => l.actionType));
    return Array.from(set);
  };

  // 1. Export Backup JSON
  const handleExportBackup = () => {
    const dataStr = JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      households,
      residents,
      logs
    }, null, 2);

    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_tan_an_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const backup = JSON.parse(text);

        if (backup && Array.isArray(backup.households) && Array.isArray(backup.residents) && Array.isArray(backup.logs)) {
          onRestoreBackup(backup.households, backup.residents, backup.logs);
          alert(`Khôi phục sao lưu thành công! Đã nhập ${backup.households.length} hộ khẩu, ${backup.residents.length} nhân khẩu, và ${backup.logs.length} bản ghi lịch sử.`);
        } else {
          alert('Tệp sao lưu không hợp lệ, thiếu cấu trúc dữ liệu thôn Tân An!');
        }
      } catch (err) {
        alert('Có lỗi xảy ra khi đọc tệp JSON. Vui lòng kiểm tra định dạng tệp!');
      }
    };
    reader.readAsText(file);
  };

  // 3. Process mass pasted data
  const handleMassImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedExcel.trim()) {
      alert('Vui lòng nhập hoặc dán dòng dữ liệu Excel trước khi nhấn import!');
      return;
    }
    const res = onMassImportResidents(pastedExcel);
    setImportResult(res);
    if (res.success) {
      setPastedExcel('');
    }
  };

  // 4. Download Excel Template (.csv)
  const handleDownloadExcelTemplate = () => {
    const headers = "Họ và tên,Ngày sinh (năm-tháng-ngày),Giới tính,Số CCCD,Mã hộ khẩu (ví dụ HK001),Quan hệ với chủ hộ\n";
    const rows = [
      "Nguyễn Văn Linh,1995-10-12,Nam,036095111222,HK001,Con trai",
      "Bùi Thị Ngọc Thảo,1998-05-30,Nữ,036198999444,HK002,Con dâu"
    ].join("\n");
    
    // Create CSV with UTF-8 BOM to ensure Vietnamese characters render properly in Excel
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "mau_nhap_lieu_nhan_khau_tan_an.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 5. Download Word Template (.doc)
  const handleDownloadWordTemplate = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Biểu mẫu thông tin nhân khẩu mẫu</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.5; margin: 1in; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .table-form { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table-form th, .table-form td { border: 1px solid black; padding: 8px; font-size: 11pt; text-align: left; }
          .signature-section { margin-top: 40px; width: 100%; }
          .header { margin-bottom: 25px; }
          .title { font-size: 15pt; font-weight: bold; margin-top: 20px; margin-bottom: 20px; text-transform: uppercase; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <table style="width: 100%; border: none;">
            <tr style="border: none;">
              <td style="width: 50%; text-align: center; border: none; font-size: 11pt; font-family: 'Times New Roman';">
                <span style="font-weight: bold;">ỦY BAN NHÂN DÂN XÃ EA LY</span><br/>
                <span style="font-weight: bold; text-decoration: underline;">BAN TỰ QUẢN THÔN TÂN AN</span>
              </td>
              <td style="width: 50%; text-align: center; border: none; font-size: 11pt; font-family: 'Times New Roman';">
                <span style="font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span><br/>
                <span style="font-style: italic; text-decoration: underline; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</span>
              </td>
            </tr>
          </table>
        </div>
        
        <div class="title" style="text-align: center; font-family: 'Times New Roman';">
          PHIẾU THU THẬP THÔNG TIN CƯ DÂN THÔN TÂN AN<br/>
          <span style="font-size: 11pt; font-weight: normal; font-style: italic;">(Sử dụng để cập nhật Hệ thống sổ sách số hóa Hộ khẩu - Nhân khẩu cấp thôn)</span>
        </div>

        <p style="font-family: 'Times New Roman';"><span class="font-bold">Kính gửi:</span> Ban tự quản Thôn Tân An, xã Ea Ly, huyện Sông Hinh.</p>
        <p style="font-family: 'Times New Roman';">Nhằm chuẩn hóa Cơ sở dữ liệu và Sổ sách quản lý cư trú cấp Thôn, đề nghị Ông/Bà chủ hộ cung cấp đầy đủ thông tin của các thành viên đang sinh sống thực tế tại hộ gia đình theo các tiêu chuẩn biểu mẫu số hóa dưới đây:</p>

        <table class="table-form" style="font-family: 'Times New Roman';">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="width: 5%; text-align: center;">STT</th>
              <th style="width: 25%;">Họ và tên cư dân</th>
              <th style="width: 15%;">Ngày sinh (Năm-Tháng-Ngày)</th>
              <th style="width: 10%;">Giới tính</th>
              <th style="width: 18%;">Số CCCD/Định danh</th>
              <th style="width: 12%;">Mã hộ mới</th>
              <th style="width: 15%;">Quan hệ chủ hộ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center;">1</td>
              <td>Nguyễn Văn Linh</td>
              <td>1995-10-12</td>
              <td>Nam</td>
              <td>036095111222</td>
              <td>HK001</td>
              <td>Con trai</td>
            </tr>
            <tr>
              <td style="text-align: center;">2</td>
              <td>Bùi Thị Ngọc Thảo</td>
              <td>1998-05-30</td>
              <td>Nữ</td>
              <td>036198999444</td>
              <td>HK002</td>
              <td>Con dâu</td>
            </tr>
            <tr>
              <td style="text-align: center;">3</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td style="text-align: center;">4</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td style="text-align: center;">5</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <p style="font-size: 11pt; font-style: italic; margin-top: 15px; font-family: 'Times New Roman';">
          * Lưu ý khi kê khai:<br/>
          - Viết chữ in hoa rõ ràng đối với Họ tên.<br/>
          - Định dạng Ngày sinh ưu tiên ghi rõ Năm-Tháng-Ngày (Ví dụ: 1995-10-12) để cán bộ thôn sao chép dán vào phần mềm nhanh chóng.<br/>
          - Sổ này dùng để cập nhật dữ liệu thôn, vui lòng kê khai trung thực, chính xác.
        </p>

        <table class="signature-section" style="border: none; font-family: 'Times New Roman';">
          <tr style="border: none;">
            <td style="width: 50%; border: none; text-align: center; font-size: 11pt; vertical-align: top;">
              <span class="font-bold">CÁN BỘ ĐIỀU TRA</span><br/>
              <span style="font-style: italic;">(Ký, ghi rõ họ tên)</span>
            </td>
            <td style="width: 50%; border: none; text-align: center; font-size: 11pt; vertical-align: top;">
              <span style="font-style: italic;">Tân An, ngày ..... tháng ..... năm 2026</span><br/>
              <span class="font-bold">ĐẠI DIỆN HỘ GIA ĐÌNH CHỦ HỘ</span><br/>
              <span style="font-style: italic;">(Ký, ghi rõ họ tên)</span>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Create document blob with correct MS Word content type (making it editable in Word!)
    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "phieu_thu_thap_thong_tin_tan_an.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* 2 core action grids: Backup & Permission Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Permission and Active User card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 text-[#118A3B]">
            <ShieldCheck size={20} />
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-800">Quyền hạn Cán bộ đang xử lý</h3>
          </div>
          
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-50 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold">Người dùng trực tuyến</p>
              <h4 id="user-display-name" className="text-sm font-black text-[#118A3B] mt-0.5">{currentUser.fullName} ({currentUser.username})</h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Phân quyền: <span className="text-emerald-800 font-bold uppercase">{currentUser.role === 'admin' ? 'Quản trị viên tối cao' : 'Cán bộ thôn'}</span></p>
            </div>
            
            <button
              onClick={() => {
                const isCurrentAdmin = currentUser.role === 'admin';
                onSetCurrentUser({
                  username: isCurrentAdmin ? 'officer1' : 'admin',
                  fullName: isCurrentAdmin ? 'Nguyễn Mai (Cán bộ thôn)' : 'Dương Văn Hà',
                  role: isCurrentAdmin ? 'officer' : 'admin'
                });
              }}
              id="btn-toggle-role"
              className="bg-white border border-[#118A3B]/40 hover:bg-[#118A3B]/5 text-[#118A3B] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
            >
              <RefreshCw size={12} />
              <span>Chuyển sang {currentUser.role === 'admin' ? 'Cán Bộ' : 'Admin'}</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            * <strong>Quản trị viên (Admin)</strong> có quyền thêm/sửa/xóa vĩnh viễn sổ hộ khẩu và nhân khẩu. <br />
            * <strong>Cán bộ thôn (Officer)</strong> chỉ có quyền xem, sửa, khai báo biến động dân cư (tạm trú, vắng, khai sinh) nhưng không được xóa hẳn hồ sơ vĩnh viễn để bảo mật thông tin.
          </p>
        </div>

        {/* Database Backup Section */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 text-[#118A3B]">
            <Layers size={20} />
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-800">Sao lưu & Khôi phục dữ liệu thôn</h3>
          </div>

          <p className="text-xs text-gray-400 font-bold">Lưu giữ an toàn tuyệt đối thông tin thường trú xóm làng, đề phòng sự cố trình duyệt.</p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={handleExportBackup}
              id="btn-export-backup"
              className="flex-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#118A3B] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
            >
              <Download size={15} />
              <span>Tải file Sao lưu (.json)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              id="btn-trigger-import"
              className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
            >
              <Upload size={15} />
              <span>Chọn file Khôi phục</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
          </div>

          <div className="pt-2 border-t border-red-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                const confirmed = confirm(
                  'CẢNH BÁO BẢO MẬT: BẠN CÓ CHẮC CHẮN MUỐN XÓA SẠCH TOÀN BỘ DỮ LIỆU DEMO?\n\nHành động này sẽ xóa hoàn toàn danh sách các Hộ khẩu, Nhân khẩu hiện tại và dọn sạch Nhật ký lịch sử để quý vị bắt đầu nhập dọn thông tin chính xác thực tế của thôn.'
                );
                if (confirmed) {
                  onClearAllData();
                  alert('Hệ thống của bạn đã được xóa sạch hoàn toàn danh sách mẫu dọn sẵn. Bây giờ bạn có thể nhập cư dân thực tế!');
                }
              }}
              id="btn-clear-all-demo"
              className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-red-600"
            >
              <Trash2 size={14} className="text-red-600" />
              <span>Xóa sạch toàn bộ danh sách Demo</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-400 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
            * Hệ thống tự động ghi nhớ trạng thái trực tiếp trong LocalStorage. Việc sao lưu giúp xuất file nộp lưu trữ cấp Xã dễ dàng.
          </div>
        </div>

      </div>

      {/* Mass template importer from Excel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2.5 text-[#118A3B]">
          <FileSpreadsheet size={20} />
          <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-800">Nhập cư dân hàng loạt bằng Excel (Sổ tính/Word)</h3>
        </div>

        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          Tiết kiệm hàng giờ nhập tay bằng cách sao chép các dòng cột bảng tính của bạn từ Google Sheets, Microsoft Excel hoặc bảng Word rồi dán vào khung dưới đây. Định dạng dán cách nhau bằng dấu phẩy, tab, hoặc gạch dọc.
        </p>

        {/* Dynamic Template Downloads Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <div className="flex flex-col justify-between p-3.5 bg-white rounded-lg border border-gray-100 shadow-xs hover:border-emerald-300 transition-all">
            <div className="flex items-start space-x-2.5">
              <div className="p-2 bg-emerald-50 text-[#118A3B] rounded-lg shrink-0">
                <FileSpreadsheet size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-800">Mẫu bảng tính Excel (.csv)</h4>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-normal">
                  Chứa đầy đủ cột mẫu có cấu trúc định vị tiếng Việt chuẩn Unicode, tương thích Google Sheets và Excel.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              className="mt-3.5 w-full py-1.5 bg-[#118A3B] hover:bg-[#0d6d2e] text-white text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Download size={11} />
              <span>Tải file Excel mẫu (.csv)</span>
            </button>
          </div>

          <div className="flex flex-col justify-between p-3.5 bg-white rounded-lg border border-gray-100 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-start space-x-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <FileText size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-800">Biểu mẫu điều tra Word (.doc)</h4>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-normal">
                  Phiếu thu thập thông tin in ấn phát và ký khảo sát hộ gia đình, mở chỉnh sửa tự do bằng MS Word.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadWordTemplate}
              className="mt-3.5 w-full py-1.5 bg-blue-650 hover:bg-blue-700 bg-blue-600 text-white text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Download size={11} />
              <span>Tải phiếu điều tra Word (.doc)</span>
            </button>
          </div>
        </div>

        {importResult && (
          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs font-bold flex items-center space-x-1.5">
            <CheckCircle2 size={16} className="text-[#118A3B]" />
            <span>{importResult.success ? `Thành công! Đã dán và nhập thêm mới ${importResult.count} nhân khẩu hoàn toàn hợp lệ.` : `Thất bại: ${importResult.error}`}</span>
          </div>
        )}

        {/* Dual Mode: 1. Drag & Drop Upload Excel/CSV Document, 2. Manual Paste spreadsheet content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload Zone */}
          <div 
            onClick={() => csvFileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-200 hover:border-[#118A3B] rounded-2xl bg-emerald-50/5 hover:bg-emerald-50/25 transition-all text-center select-none cursor-pointer group"
          >
            <input
              type="file"
              ref={csvFileInputRef}
              onChange={handleUploadExcelFile}
              accept=".csv,.txt"
              className="hidden"
            />
            <div className="p-3 bg-emerald-50 text-[#118A3B] rounded-full group-hover:scale-110 transition-transform duration-200 shadow-sm">
              <Upload size={20} />
            </div>
            <div className="mt-3">
              <span className="block text-xs font-black text-gray-800">TẢI FILE TÀI LIỆU LÊN HỆ THỐNG</span>
              <span className="block text-[10px] text-gray-400 font-semibold mt-1">
                Kéo thả hoặc nhấp để tải file Excel (.csv mẫu) đã điền thông tin cư dân Thôn Tân An.
              </span>
            </div>
          </div>

          {/* Paste Clipboard Form */}
          <form onSubmit={handleMassImportSubmit} className="space-y-2 flex flex-col justify-between">
            <div className="space-y-1 bg-amber-50/30 p-2.5 rounded-xl border border-amber-100 text-[10px] text-amber-900 font-mono">
              <span className="font-extrabold block mb-0.5">Cách 2: Sao chép dán tay trực tiếp</span>
              <span>Cấu trúc dán: Họ tên, Ngày sinh (YYYY-MM-DD), Giới tính, Số CCCD, Mã hộ, Quan hệ chủ hộ</span>
            </div>

            <textarea
              rows={3}
              value={pastedExcel}
              onChange={(e) => setPastedExcel(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none focus:bg-white focus:border-emerald-600 resize-none"
              placeholder="Hoặc dán các hàng sao chép từ Excel/Google Sheets vào đây..."
            />

            <button
              type="submit"
              className="w-full py-2 bg-[#118A3B] hover:bg-[#0d6d2e] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Nhập hàng loạt nhân khẩu tức thì
            </button>
          </form>
        </div>
      </div>

      {/* Audit History Logs Table */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Table size={18} className="text-[#118A3B]" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-800">Lịch sử cập nhật hệ thống ({filteredLogs.length})</h3>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                placeholder="Tìm tác giả, nội dung log..."
                className="pl-8 pr-3 py-1.5 bg-gray-50 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="px-2 py-1 bg-gray-50 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600"
            >
              <option value="All">Tất cả hành động</option>
              {getLogActions().map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  if (confirm('Bạn có đồng ý xóa toàn bộ các dòng ghi lịch sử cũ?')) {
                    onClearLogs();
                  }
                }}
                className="p-1 px-2.5 hover:bg-red-50 border border-transparent hover:border-red-100 text-red-600 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                title="Xóa lịch sử ghi chép"
              >
                <Trash2 size={13} />
                <span>Xóa hết</span>
              </button>
            )}
          </div>
        </div>

        {/* Table of logs */}
        <div className="border border-gray-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 font-bold text-gray-500">
              <tr>
                <th className="px-4 py-2.5 text-left">Thời gian</th>
                <th className="px-4 py-2.5 text-left">Sự kiện</th>
                <th className="px-4 py-2.5 text-left">Cán bộ thực hiện</th>
                <th className="px-4 py-2.5 text-left">Mô tả chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2 text-[11px] whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${
                      l.actionType === 'Khai sinh' ? 'bg-blue-50 text-blue-700' :
                      l.actionType === 'Khai tử' ? 'bg-stone-100 text-stone-700' :
                      l.actionType === 'Tạm trú' || l.actionType === 'Tạm vắng' ? 'bg-amber-50 text-amber-700' :
                      l.actionType === 'Nhập hàng loạt' ? 'bg-purple-50 text-purple-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {l.actionType}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-bold font-sans text-gray-700 truncate max-w-[124px]" title={l.author}>
                    {l.author}
                  </td>
                  <td className="px-4 py-2 font-sans text-gray-600 text-[11.5px]">
                    {l.description}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400 font-bold">
                    Không có bản ghi nhật ký sự kiện nào phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
