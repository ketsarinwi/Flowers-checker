import React, { useState, useRef } from 'react';
import { Upload, X, Check, Cloud, Image as ImageIcon, ExternalLink, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Flower } from '../types';
import { uploadImageToDrive, getAccessToken, googleSignIn, auth } from '../services/googleDrive';

interface UploadImageModalProps {
  isOpen: boolean;
  flower: Flower | null;
  onClose: () => void;
  onSaveImage: (flowerId: string, imageUrl: string, driveFileId?: string, driveLink?: string) => void;
  onRemoveImage: (flowerId: string) => void;
}

export const UploadImageModal: React.FC<UploadImageModalProps> = ({
  isOpen,
  flower,
  onClose,
  onSaveImage,
  onRemoveImage,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !flower) return null;

  const currentImage = flower.imageUrl;
  const currentDriveLink = flower.driveWebViewLink;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP, GIF)');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadToDrive = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('กำลังตรวจสอบสิทธิ์การเข้าถึง Google Drive...');
    setErrorMessage(null);

    try {
      let token = await getAccessToken();

      // If token not in memory, trigger Google Sign-In with popup
      if (!token) {
        setUploadStatus('กรุณาเข้าสู่ระบบ Google เพื่ออนุญาตบันทึกไฟล์...');
        const authResult = await googleSignIn();
        token = authResult?.accessToken || null;
      }

      if (!token) {
        throw new Error('ไม่ได้รับสิทธิ์การเชื่อมต่อ Google Drive');
      }

      setUploadStatus(`กำลังอัปโหลดไฟล์รูปไปยัง Google Drive...`);
      const uploadResult = await uploadImageToDrive(selectedFile, flower.name, token);

      setUploadStatus('อัปโหลดสำเร็จเรียบร้อย!');
      
      // Use drive thumbnail or direct reader URL
      const displayUrl = uploadResult.thumbnailLink || uploadResult.webContentLink || previewUrl || '';
      onSaveImage(flower.id, displayUrl, uploadResult.fileId, uploadResult.webViewLink);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Upload to Drive error:', err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดไปยัง Google Drive');
      setIsUploading(false);
      setUploadStatus(null);
    }
  };

  const handleSaveLocalFallback = () => {
    if (!selectedFile && !previewUrl) return;
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onSaveImage(flower.id, base64);
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
      };
      reader.readAsDataURL(selectedFile);
    } else if (previewUrl) {
      onSaveImage(flower.id, previewUrl);
      onClose();
    }
  };

  const handleRemove = () => {
    onRemoveImage(flower.id);
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const displayImage = previewUrl || currentImage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  flower.tier === 'ม่วง'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                    : flower.tier === 'ส้ม'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                }`}
              >
                พื้นสี{flower.tier}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                จัดการรูปภาพ: {flower.name}
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              (ดอกไม้ 1 ชนิดมีรูปได้ 1 รูป — อัปโหลดจากเครื่องเข้า Google Drive)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing / Preview Image Container */}
        <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center min-h-56">
          {displayImage ? (
            <div className="relative w-full h-56 flex items-center justify-center bg-zinc-950/5">
              <img
                src={displayImage}
                alt={flower.name}
                className="max-h-full max-w-full object-contain p-2 rounded-lg"
              />
              {currentDriveLink && !selectedFile && (
                <a
                  href={currentDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-xs transition"
                >
                  <Cloud className="w-3.5 h-3.5 text-blue-400" />
                  เปิดใน Google Drive
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-56 flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl cursor-pointer p-6 text-center transition"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกรูป
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                รองรับไฟล์ PNG, JPG, WEBP, GIF
              </p>
            </div>
          )}
        </div>

        {/* Change / Select File Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl transition"
          >
            <ImageIcon className="w-4 h-4 text-zinc-500" />
            {displayImage ? 'เปลี่ยนไฟล์รูปภาพใหม่' : 'เลือกรูปภาพจากเครื่อง'}
          </button>

          {currentImage && (
            <button
              type="button"
              onClick={handleRemove}
              title="ลบรูปภาพนี้"
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {selectedFile && (
          <div className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 p-2.5 rounded-lg flex items-center justify-between">
            <span className="truncate max-w-[280px]">
              ไฟล์ที่เลือก: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> พร้อมอัปโหลด
            </span>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload status */}
        {uploadStatus && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="w-full sm:w-auto px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          >
            ปิด
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            {selectedFile && (
              <button
                type="button"
                onClick={handleSaveLocalFallback}
                disabled={isUploading}
                title="บันทึกรูปเก็บไว้ในระบบทันทีโดยไม่เชื่อมต่อ Google Drive"
                className="px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                บันทึกลงระบบทันที
              </button>
            )}

            <button
              type="button"
              onClick={handleUploadToDrive}
              disabled={!selectedFile || isUploading}
              className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white shadow-md transition ${
                !selectedFile || isUploading
                  ? 'bg-zinc-400 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังอัปโหลด...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  อัปโหลดเข้า Google Drive
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
