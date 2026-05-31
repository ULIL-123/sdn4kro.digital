import React, { useState, useEffect } from 'react';
import { CalonSiswa, JalurPendaftaran, Kegiatan } from '../types';
import { Search, Printer, Edit2, Users, RefreshCw, BarChart3, ShieldAlert, Check, HelpCircle, ArrowUpDown, ChevronDown, Lock, Eye, EyeOff, LogOut, Trash2, Upload, Plus, X, Save, FileText, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardCharts from './DashboardCharts';
import Sdn4KronggenLogo from './Sdn4KronggenLogo';
import DinasPendidikanLogo from './DinasPendidikanLogo';
import { syncLogosToServer } from '../utils';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  listDriveBackups, 
  uploadBackupToDrive, 
  deleteDriveFile,
  DriveBackupFile 
} from '../googleDriveService';
import { auth } from '../firebase';
import { signInAnonymously, signOut } from 'firebase/auth';

interface DashboardProps {
  students: CalonSiswa[];
  onChangeStatus: (id: string, newStatus: CalonSiswa['status']) => void;
  onBulkStatusChange?: (updates: { [id: string]: CalonSiswa['status'] }) => void;
  onSelectStudentToPrint: (student: CalonSiswa) => void;
  onAddSampleStudent: () => void;
  onResetDatabase: () => void;
  onDeleteStudent?: (id: string, name: string) => void;
  kegiatanList?: Kegiatan[];
  onUpdateKegiatan?: (newList: Kegiatan[]) => void;
}

export default function Dashboard({ 
  students, 
  onChangeStatus, 
  onBulkStatusChange,
  onSelectStudentToPrint,
  onAddSampleStudent,
  onResetDatabase,
  onDeleteStudent,
  kegiatanList = [],
  onUpdateKegiatan
}: DashboardProps) {
  // Parent Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [parentRecord, setParentRecord] = useState<CalonSiswa | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // States for Toast Notification Center
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    // Auto-dismiss after 3.5 seconds
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  };

  // Staff View States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('spmb_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // States for custom interactive modals (prevents standard window.confirm blocks)
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasCustomLogo, setHasCustomLogo] = useState(() => {
    return typeof window !== 'undefined' && !!localStorage.getItem('sdn4_custom_logo');
  });
  const [hasCustomDinasLogo, setHasCustomDinasLogo] = useState(() => {
    return typeof window !== 'undefined' && !!localStorage.getItem('sdn4_custom_dinas_logo');
  });

  useEffect(() => {
    if (isAdminAuthenticated) {
      signInAnonymously(auth).catch((err: any) => {
        if (err && err.code === 'auth/admin-restricted-operation') {
          console.warn("Informasi: Anonymous Auth dibatasi di Firebase Console. Penyelarasan database lokal panitia ke Firestore akan beroperasi manual melalui otorisasi skema.");
        } else {
          console.error("Failed to authenticate session with Firestore:", err);
        }
      });
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    const handleLogoChange = () => {
      setHasCustomLogo(typeof window !== 'undefined' && !!localStorage.getItem('sdn4_custom_logo'));
    };
    const handleDinasLogoChange = () => {
      setHasCustomDinasLogo(typeof window !== 'undefined' && !!localStorage.getItem('sdn4_custom_dinas_logo'));
    };

    window.addEventListener('sdn4_custom_logo_changed', handleLogoChange);
    window.addEventListener('sdn4_custom_dinas_logo_changed', handleDinasLogoChange);
    return () => {
      window.removeEventListener('sdn4_custom_logo_changed', handleLogoChange);
      window.removeEventListener('sdn4_custom_dinas_logo_changed', handleDinasLogoChange);
    };
  }, []);

  // ==========================================
  // STATE & HANDLER GOOGLE DRIVE CLOUD INTEGRATION
  // ==========================================
  const [driveUser, setDriveUser] = useState<any>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [driveBackups, setDriveBackups] = useState<DriveBackupFile[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<DriveBackupFile | null>(null);

  // Initialize Auth listeners on load
  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setDriveUser(user);
        setDriveToken(token);
        fetchBackups(token);
      },
      () => {
        setDriveUser(null);
        setDriveToken(null);
        setDriveBackups([]);
      }
    );
    return () => unsub();
  }, []);

  const fetchBackups = async (token: string) => {
    setIsDriveLoading(true);
    try {
      const backups = await listDriveBackups(token);
      setDriveBackups(backups);
    } catch (error: any) {
      console.error('Gagal mengambil backup:', error);
      showToast('Gagal memuat daftar backup dari Google Drive.', 'error');
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleDriveLogin = async () => {
    setIsDriveLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setDriveUser(result.user);
        setDriveToken(result.accessToken);
        showToast(`Terhubung dengan Google Drive: ${result.user.email}`, 'success');
        fetchBackups(result.accessToken);
      }
    } catch (error: any) {
      console.error('Koneksi Google Drive gagal:', error);
      showToast('Koneksi Google Drive dibatalkan atau gagal.', 'error');
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleDriveLogout = async () => {
    try {
      await logout();
      setDriveUser(null);
      setDriveToken(null);
      setDriveBackups([]);
      showToast('Sesi Google Drive telah dihentikan.', 'info');
    } catch (err) {
      showToast('Gagal menghentikan sesi Google Drive.', 'error');
    }
  };

  const handleCreateBackup = async () => {
    if (!driveToken) return;
    setIsCreatingBackup(true);
    try {
      const result = await uploadBackupToDrive(driveToken, students);
      showToast(`Backup dengan nama "${result.name}" berhasil diunggah ke Google Drive!`, 'success');
      // Refresh list
      fetchBackups(driveToken);
    } catch (err: any) {
      showToast(`Pembuatan backup gagal: ${err.message || err}`, 'error');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDeleteBackupClick = (backup: DriveBackupFile) => {
    // Show custom dialog confirmation
    setBackupToDelete(backup);
  };

  const confirmDeleteBackup = async () => {
    if (!backupToDelete || !driveToken) return;
    setIsDriveLoading(true);
    try {
      await deleteDriveFile(driveToken, backupToDelete.id);
      showToast(`Arsip backup "${backupToDelete.name}" telah dihapus secara permanen.`, 'success');
      setBackupToDelete(null);
      fetchBackups(driveToken);
    } catch (err: any) {
      showToast(`Gagal menghapus arsip: ${err.message || err}`, 'error');
    } finally {
      setIsDriveLoading(false);
    }
  };

  // ==========================================
  // STATE & HANDLER KONTROL KEGIATAN PRAKTIK BAIK
  // ==========================================
  const [editingKegiatanId, setEditingKegiatanId] = useState<string | null>(null);
  const [editJudul, setEditJudul] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [editKategori, setEditKategori] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  const [isAddingNewKegiatan, setIsAddingNewKegiatan] = useState(false);
  const [newJudul, setNewJudul] = useState('');
  const [newDeskripsi, setNewDeskripsi] = useState('');
  const [newKategori, setNewKategori] = useState('Lingkungan');
  const [newTanggal, setNewTanggal] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Start editing a specific activity
  const startEditKegiatan = (k: Kegiatan) => {
    setEditingKegiatanId(k.id);
    setEditJudul(k.judul);
    setEditDeskripsi(k.deskripsi);
    setEditKategori(k.kategori);
    setEditTanggal(k.tanggalKegiatan);
    setEditImageUrl(k.imageUrl);
  };

  // Save the current active changes of an edited activity
  const handleSaveEditKegiatan = () => {
    if (!editJudul.trim() || !editDeskripsi.trim()) {
      alert('Judul dan Deskripsi kegiatan praktik baik harus diisi!');
      return;
    }
    const updated = kegiatanList.map(k => {
      if (k.id === editingKegiatanId) {
        return {
          ...k,
          judul: editJudul,
          deskripsi: editDeskripsi,
          kategori: editKategori,
          tanggalKegiatan: editTanggal,
          imageUrl: editImageUrl || 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80'
        };
      }
      return k;
    });
    if (onUpdateKegiatan) {
      onUpdateKegiatan(updated);
      showToast('Pembaruan kegiatan praktik baik telah berhasil disimpan!', 'success');
    }
    // Reset editing
    setEditingKegiatanId(null);
  };

  // Delete a specific activity node
  const handleDeleteKegiatan = (id: string, name: string) => {
    const isConfirm = window.confirm(`Apakah Anda yakin ingin menghapus dokumentasi Kegiatan Praktik Baik: "${name}"?`);
    if (isConfirm && onUpdateKegiatan) {
      const filtered = kegiatanList.filter(k => k.id !== id);
      onUpdateKegiatan(filtered);
      showToast('Dokumentasi kegiatan berhasil dihapus!', 'success');
    }
  };

  // Add a brand new activity
  const handleCreateNewKegiatan = () => {
    if (!newJudul.trim() || !newDeskripsi.trim() || !newTanggal.trim()) {
      alert('Mohon lengkapi Judul, Deskripsi, dan Jadwal Hari kegiatan!');
      return;
    }
    
    const newId = `K-${Date.now()}`;
    const newItem: Kegiatan = {
      id: newId,
      judul: newJudul,
      deskripsi: newDeskripsi,
      kategori: newKategori,
      tanggalKegiatan: newTanggal,
      imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80'
    };

    if (onUpdateKegiatan) {
      onUpdateKegiatan([...kegiatanList, newItem]);
      showToast('Kegiatan praktik baik baru telah berhasil ditambahkan & disimpan!', 'success');
    }

    // Reset fields
    setNewJudul('');
    setNewDeskripsi('');
    setNewKategori('Lingkungan');
    setNewTanggal('');
    setNewImageUrl('');
    setIsAddingNewKegiatan(false);
  };

  // Compress image to fit within localStorage limits beautifully and performantly
  const compressImage = (file: File, callback: (base64: string) => void, isLogo = false) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_SIZE = isLogo ? 1024 : 600; // 1024px gives ultra crisp scaling for official logos
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Enable premium smoothing algorithms
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Detect file format and keep PNG transparent/lossless
          const isPNG = file.type?.toLowerCase().includes('png') || isLogo;
          const compressed = isPNG 
            ? canvas.toDataURL('image/png') 
            : canvas.toDataURL('image/jpeg', 0.95); // High quality 95% for non-PNG

          callback(compressed);
        } else {
          callback(event.target?.result as string);
        }
      };
      img.onerror = () => {
        callback(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle local image uploads via Base64 converting with compression
  const handleEditImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (base64) => {
        setEditImageUrl(base64);
        showToast('Foto berhasil diunggah & dioptimalkan otomatis!', 'success');
      });
    }
  };

  const handleCreateImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (base64) => {
        setNewImageUrl(base64);
        showToast('Foto berhasil disiapkan & dioptimalkan otomatis!', 'success');
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    compressImage(file, (base64String) => {
      try {
        localStorage.setItem('sdn4_custom_logo', base64String);
        setHasCustomLogo(true);
        window.dispatchEvent(new Event('sdn4_custom_logo_changed'));
        showToast('Logo kop sekolah SD Negeri 4 Kronggen berhasil disimpan!', 'success');
        syncLogosToServer(base64String, localStorage.getItem('sdn4_custom_dinas_logo'));
      } catch (err) {
        alert('Memori penyimpanan penuh! Gagal mengunggah logo.');
      }
    }, true);
  };

  const handleResetLogo = () => {
    localStorage.removeItem('sdn4_custom_logo');
    setHasCustomLogo(false);
    window.dispatchEvent(new Event('sdn4_custom_logo_changed'));
    showToast('Logo kop sekolah disetel ulang ke logo bawaan aslinya!', 'info');
    syncLogosToServer(null, localStorage.getItem('sdn4_custom_dinas_logo'));
  };

  const handleDinasLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    compressImage(file, (base64String) => {
      try {
        localStorage.setItem('sdn4_custom_dinas_logo', base64String);
        setHasCustomDinasLogo(true);
        window.dispatchEvent(new Event('sdn4_custom_dinas_logo_changed'));
        showToast('Logo Dinas Pendidikan berhasil disimpan!', 'success');
        syncLogosToServer(localStorage.getItem('sdn4_custom_logo'), base64String);
      } catch (err) {
        alert('Memori penyimpanan penuh! Gagal mengunggah logo dinas.');
      }
    }, true);
  };

  const handleResetDinasLogo = () => {
    localStorage.removeItem('sdn4_custom_dinas_logo');
    setHasCustomDinasLogo(false);
    window.dispatchEvent(new Event('sdn4_custom_dinas_logo_changed'));
    showToast('Logo Dinas Pendidikan disetel ulang ke logo bawaan aslinya!', 'info');
    syncLogosToServer(localStorage.getItem('sdn4_custom_logo'), null);
  };

  const [filterJalur, setFilterJalur] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'jarak' | 'usia' | 'tgl'>('usia');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const confirmDelete = () => {
    if (studentToDelete && onDeleteStudent) {
      onDeleteStudent(studentToDelete.id, studentToDelete.name);
      showToast(`Pendaftar "${studentToDelete.name}" berhasil dihapus dari database!`, 'info');
      setStudentToDelete(null);
    }
  };

  const confirmReset = () => {
    if (onResetDatabase) {
      onResetDatabase();
      setShowResetConfirm(false);
      showToast('Database pendaftaran berhasil disetel ulang ke kondisi bawaan!', 'info');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    
    const trimmedUsername = username.trim();
    const defaultUsername = "admin";
    const defaultPassword = "adminkronggen2026";

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: trimmedUsername, 
          password 
        }),
      });

      // Check if the response contains JSON.
      // If the API endpoint exists on the server side (Express container or Vercel serverless function),
      // it returns JSON. This JSON response is AUTHORITATIVE.
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          setIsAdminAuthenticated(true);
          sessionStorage.setItem('spmb_admin_auth', 'true');
          setAuthError('');
        } else {
          setAuthError(data.message || 'Nama pengguna atau kata sandi salah!');
        }
        return; // Halt logic here as the active backend response is authoritative
      }

      // If we don't get a JSON response, it indicates a purely static CDN hosting (e.g. Vercel/Netlify index.html fallback or 404).
      // We fall back securely to client-side authentication supporting custom Vite env vars.
      const expectedUsername = (import.meta as any).env.VITE_ADMIN_USERNAME || defaultUsername;
      const expectedPassword = (import.meta as any).env.VITE_ADMIN_PASSWORD || defaultPassword;

      if (trimmedUsername === expectedUsername && password === expectedPassword) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('spmb_admin_auth', 'true');
        setAuthError('');
      } else {
        setAuthError('Nama pengguna atau kata sandi salah!');
      }
    } catch (err) {
      // In case of any network disconnection, CORS block, or local offline mode, fallback to client-side credentials
      const expectedUsername = (import.meta as any).env.VITE_ADMIN_USERNAME || defaultUsername;
      const expectedPassword = (import.meta as any).env.VITE_ADMIN_PASSWORD || defaultPassword;

      if (trimmedUsername === expectedUsername && password === expectedPassword) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('spmb_admin_auth', 'true');
        setAuthError('');
      } else {
        setAuthError('Nama pengguna atau kata sandi salah!');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('spmb_admin_auth');
    signOut(auth).catch((err) => {
      console.error("Firebase auth signout failed:", err);
    });
    setUsername('');
    setPassword('');
  };

  // Handle Parent search
  const handleParentSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = students.find(
      s => s.id.toLowerCase() === searchQuery.trim().toLowerCase() || s.nik === searchQuery.trim()
    );

    setParentRecord(matched || null);
    setHasSearched(true);
  };

  const handleAddSampleClick = () => {
    onAddSampleStudent();
    showToast('Calon siswa simulasi berhasil ditambahkan & disimpan otomatis!', 'success');
  };

  const handleStatusSelectChange = (id: string, name: string, status: CalonSiswa['status']) => {
    onChangeStatus(id, status);
    showToast(`Status kelulusan ${name} berhasil diperbarui ke "${status}" & disimpan!`, 'success');
  };

  // Run selection algorithm simulator
  const runSelectionSimulator = () => {
    // Jalur Domisili: 23 slots
    // Jalur Afirmasi: 4 slots
    // Jalur Mutasi: 1 slot
    // Seleksi: prioritas usia 7 tahun, kemudian jarak rumah terdekat.
    
    const updatedStudents = [...students].map(s => ({ ...s }));

    // Helper sorting:
    // Urutan prioritas:
    // 1. Siapa saja yang berusia >= 7 tahun lebih diprioritaskan.
    // 2. Jika sama-sama berusia >= 7 tahun, urutkan berdasarkan JARAK TERDEKAT.
    // 3. Jika usia < 7 tahun tapi >= 6 tahun, diurutkan setelah usia >= 7, urut berdasarkan JARAK TERDEKAT juga.
    // 4. Usia < 6 tahun ditempatkan paling akhir (dan butuh rekomendasi).
    const sortSPMB = (a: CalonSiswa, b: CalonSiswa) => {
      // Bandingkan Kategori Usia
      const aPrioritas = a.usiaTahun >= 7 ? 2 : (a.usiaTahun === 6 ? 1 : 0);
      const bPrioritas = b.usiaTahun >= 7 ? 2 : (b.usiaTahun === 6 ? 1 : 0);

      if (aPrioritas !== bPrioritas) {
        return bPrioritas - aPrioritas; // Prioritas yang lebih tinggi di atas
      }

      // Jika prioritas kategori sama, bandingkan Jarak (terdekat di atas)
      return a.jarakKeSekolah - b.jarakKeSekolah;
    };

    // Filter per jalur
    const domisiliSubmissions = updatedStudents.filter(s => s.jalur === 'domisili').sort(sortSPMB);
    const afirmasiSubmissions = updatedStudents.filter(s => s.jalur === 'afirmasi').sort(sortSPMB);
    const mutasiSubmissions = updatedStudents.filter(s => s.jalur === 'mutasi').sort(sortSPMB);

    const bulkUpdates: { [id: string]: CalonSiswa['status'] } = {};

    // Apply selection quota
    domisiliSubmissions.forEach((student, index) => {
      const isAccepted = index < 23; // Kuota 23 kursi
      bulkUpdates[student.id] = isAccepted ? 'Diterima' : 'Cadangan';
    });

    afirmasiSubmissions.forEach((student, index) => {
      const isAccepted = index < 4; // Kuota 4 kursi
      bulkUpdates[student.id] = isAccepted ? 'Diterima' : 'Cadangan';
    });

    mutasiSubmissions.forEach((student, index) => {
      const isAccepted = index < 1; // Kuota 1 kursi
      bulkUpdates[student.id] = isAccepted ? 'Diterima' : 'Cadangan';
    });

    if (onBulkStatusChange) {
      onBulkStatusChange(bulkUpdates);
    } else {
      // Fallback if not defined
      Object.entries(bulkUpdates).forEach(([id, status]) => {
        onChangeStatus(id, status);
      });
    }

    showToast('Simulasi seleksi otomatis selesai dihitung & basis data permanen diperbarui!', 'success');
  };

  // Sort and filter students for admin dashboard
  const filteredStudents = students.filter(s => {
    const matchJalur = filterJalur === 'all' ? true : s.jalur === filterJalur;
    const matchStatus = filterStatus === 'all' ? true : s.status === filterStatus;
    return matchJalur && matchStatus;
  }).sort((a, b) => {
    if (sortField === 'jarak') {
      return sortOrder === 'asc' ? a.jarakKeSekolah - b.jarakKeSekolah : b.jarakKeSekolah - a.jarakKeSekolah;
    } else if (sortField === 'usia') {
      const aUsiaTotal = a.usiaTahun * 12 + a.usiaBulan;
      const bUsiaTotal = b.usiaTahun * 12 + b.usiaBulan;
      return sortOrder === 'asc' ? aUsiaTotal - bUsiaTotal : bUsiaTotal - aUsiaTotal;
    } else {
      return sortOrder === 'asc' 
        ? new Date(a.tanggalDaftar).getTime() - new Date(b.tanggalDaftar).getTime()
        : new Date(b.tanggalDaftar).getTime() - new Date(a.tanggalDaftar).getTime();
    }
  });

  const toggleSort = (field: 'jarak' | 'usia' | 'tgl') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <section id="cek-pendaftaran" className="py-16 bg-white border-t border-slate-100 relative">
      {/* GLOBAL PERSISTENCE TOAST NOTIFIER */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed top-6 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700/60 backdrop-blur-md max-w-sm sm:max-w-md w-[calc(100%-2rem)] bg-slate-900/95 text-white"
        >
          <div className="shrink-0">
            {toast.type === 'success' && (
              <div className="w-8 h-8 rounded-full bg-emerald-500/25 text-emerald-400 flex items-center justify-center font-black">
                ✓
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-8 h-8 rounded-full bg-sky-500/25 text-sky-400 flex items-center justify-center font-black">
                ℹ
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-8 h-8 rounded-full bg-rose-500/25 text-rose-400 flex items-center justify-center font-black">
                !
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[9px] font-black tracking-widest uppercase opacity-60">SINKRONISASI BASIS DATA SOS</h4>
            <p className="text-[11px] font-bold text-white/95 mt-0.5 leading-relaxed whitespace-pre-line">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-white/40 hover:text-white/90 transition-colors p-1 font-sans text-xs cursor-pointer select-none"
          >
            ✕
          </button>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Selector Dashboard Mode */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-205">
            <button
              onClick={() => { setIsAdminMode(false); setHasSearched(false); setParentRecord(null); }}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                !isAdminMode 
                  ? 'bg-white text-emerald-800 shadow-md font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🔍 Portal Pencarian Orang Tua
            </button>
            <button
              onClick={() => { setIsAdminMode(true); }}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isAdminMode 
                  ? 'bg-white text-emerald-800 shadow-md font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ⚙ Panel Panitia (Admin Guru)
            </button>
          </div>
        </div>

        {/* 1. Parent Mode Panel */}
        {!isAdminMode ? (
          <div className="max-w-3xl mx-auto transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                Cek Status Kelulusan & Cetak Kartu
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Masukkan Kode Pendaftaran (contoh: <code>SPMB-2026-4821</code>) atau nomor 16 digit NIK anak Anda yang sudah didaftarkan sebelumnya.
              </p>
            </div>

            {/* Input Form Search */}
            <form onSubmit={handleParentSearch} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 font-medium text-sm transition-all"
                    placeholder="Masukkan Kode SPMB atau NIK Anak..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98"
                >
                  Cari Data
                </button>
              </div>
            </form>

            {/* Search Result display */}
            {hasSearched && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-lg relative overflow-hidden"
              >
                {parentRecord ? (
                  <div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-dashed border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Status Pendaftaran Calon Murid</span>
                        <h3 className="text-xl font-bold uppercase text-slate-850 mt-0.5">{parentRecord.namaLengkap}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Kode Registrasi: <span className="font-mono font-bold text-slate-700">{parentRecord.id}</span></p>
                      </div>

                      {/* Wide Badge */}
                      <div className="shrink-0">
                        {parentRecord.status === 'Diterima' && (
                          <span className="inline-flex px-4 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black uppercase border border-emerald-250 animate-bounce">
                            🎉 LOLOS (DITERIMA ADMISI)
                          </span>
                        )}
                        {parentRecord.status === 'Pending' && (
                          <span className="inline-flex px-4 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold uppercase border border-amber-250">
                            ⏳ PROSES VERIFIKASI DOKUMEN
                          </span>
                        )}
                        {parentRecord.status === 'Terverifikasi' && (
                          <span className="inline-flex px-4 py-1.5 rounded-xl bg-teal-100 text-teal-800 text-xs font-bold uppercase border border-teal-205">
                            ✓ BERKAS VALID (SEDANG DIREKAP)
                          </span>
                        )}
                        {parentRecord.status === 'Cadangan' && (
                          <span className="inline-flex px-4 py-1.5 rounded-xl bg-sky-100 text-sky-800 text-xs font-bold uppercase border border-sky-200">
                            🛟 STATUS CADANGAN
                          </span>
                        )}
                        {parentRecord.status === 'Gugur' && (
                          <span className="inline-flex px-4 py-1.5 rounded-xl bg-rose-100 text-rose-805 text-xs font-bold uppercase border border-rose-205">
                            ❌ BERKAS TIDAK VALID / GUGUR
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm mb-6 leading-relaxed">
                      <div>
                        <p className="text-slate-400 font-medium">Jalur Dituju:</p>
                        <p className="text-slate-800 font-bold uppercase">{parentRecord.jalur === 'domisili' ? '🏠 Zonasi Domisili' : parentRecord.jalur === 'afirmasi' ? '🛡️ Afirmasi Sosial' : '🚚 Mutasi Pindahan'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Jarak Rumah Ke Sekolah:</p>
                        <p className="text-slate-800 font-bold">{parentRecord.jarakKeSekolah} Meter</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Syarat Usia Masuk:</p>
                        <p className="text-slate-800 font-bold">{parentRecord.usiaTahun} Tahun {parentRecord.usiaBulan} Bulan</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">No. HP Orang Tua:</p>
                        <p className="text-slate-800 font-medium">{parentRecord.noHpOrangTua}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed mb-6 space-y-1.5 text-justify">
                      <strong className="text-slate-850">Langkah Berikutnya:</strong>
                      {parentRecord.status === 'Pending' && (
                        <p>Silakan bawa kelengkapan dokumen asli (Akta Lahir, KK, SPTJM bermaterai) untuk diperiksa panitia SPMB di sekolah pada waktu pendaftaran resmi (23 - 25 Juni 2025 pukul 08.00 - 14.00 WIB).</p>
                      )}
                      {parentRecord.status === 'Terverifikasi' && (
                        <p>Dokumen asli Anda telah dinyatakan SAH oleh panitia. Hasil keputusan kelulusan final kuota rombel akan diumumkan secara serentak pada tanggal <strong>26 Juni 2025</strong> pukul 10.00 WIB di website ini maupun mading sekolah.</p>
                      )}
                      {parentRecord.status === 'Diterima' && (
                        <p className="text-emerald-800 font-medium">Selamat! Anak Anda dinyatakan lulus seleksi utama. Langkah berikutnya adalah melakukan <strong>Daftar Ulang</strong> di sekolah pada tanggal <strong>2-4 Juli 2025</strong> dengan menyerahkan fotokopi berkas fisik & bukti kartu pendaftaran ini.</p>
                      )}
                      {parentRecord.status === 'Cadangan' && (
                        <p>Anak Anda masuk dalam kuota cadangan pelamar. Jika kuota utama yang lulus tidak melakukan daftar ulang hingga 4 Juli 2025, maka kuota cadangan akan otomatis naik sesuai urutan usia & jarak terdekat.</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => onSelectStudentToPrint(parentRecord)}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-102 transition-transform"
                      >
                        <Printer className="w-4 h-4" /> Cetak / Lihat Ulang Formulir Bukti SPMB
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-2" />
                    <h4 className="font-extrabold text-slate-800 text-sm">Data Tidak Ditemukan</h4>
                    <p className="text-xs text-slate-500 mt-1">Periksa kembali Kode Pendaftaran atau nomor NIK terdaftar Anda. Pastikan tidak salah ketik.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ) : !isAdminAuthenticated ? (
          /* Admin Login Form */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-xl transition-all duration-300"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800">Autentikasi Panitia Guru</h3>
              <p className="text-xs text-slate-500 mt-1 pb-1">
                Akses terbatas hanya untuk panitia dan administrator resmi SD Negeri 4 Kronggen.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-bounce">
                  <span>⚠️</span> {authError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block pl-1">Nama Pengguna (Username)</label>
                <input
                  type="text"
                  required
                  disabled={isLoggingIn}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-205 bg-white focus:outline-emerald-600 text-sm font-semibold disabled:bg-slate-100 disabled:text-slate-400"
                  placeholder="Masukkan username..."
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setAuthError('');
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block pl-1">Kata Sandi (Password)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoggingIn}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-205 bg-white focus:outline-emerald-600 text-sm font-semibold pr-10 disabled:bg-slate-100 disabled:text-slate-400"
                    placeholder="Masukkan password..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError('');
                    }}
                  />
                  <button
                    type="button"
                    disabled={isLoggingIn}
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-101 active:scale-99 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? "Memverifikasi..." : "Masuk Sesi Kerja Panitia"}
              </button>
            </form>
          </motion.div>
        ) : (
          /* 2. Staff / Admin Mode Panel */
          <div className="transition-all duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-slate-400 py-1 bg-emerald-100 text-emerald-800 px-3 rounded-full uppercase">SISTEM BASIS DATA SPMB LOKAL</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
                  Database Pendaftar SPMB 2026/2027
                </h2>
                <p className="text-xs text-slate-550">Total data pendaftar terkumpul saat ini: <strong>{students.length} Pendaftar</strong></p>
              </div>

              {/* Simulation Admin Actions */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleAddSampleClick}
                  className="px-4 py-2.5 bg-slate-850 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                  title="Simulasikan masuknya calon murid baru baru agar list bervariasi"
                >
                  ＋ Tambah Sampel Murid
                </button>
                <button
                  onClick={runSelectionSimulator}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1 cursor-pointer hover:scale-101 active:scale-99 transition-all"
                  title="Urutkan secara otomatis kuota 28 orangel berdasarkan Perbup Grobogan (Usia -> Jarak)"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Jalankan Seleksi Otomatis
                </button>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3.5 py-2.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  title="Setel ulang seluruh data pendaftaran ke nilai bawaan asli sekolah"
                >
                  Reset Data
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2.5 bg-rose-50 border border-rose-220 text-rose-700 hover:bg-rose-100 text-xs font-extrabold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                  title="Keluar dari sesi admin"
                >
                  <LogOut className="w-3.5 h-3.5" /> Keluar Admin
                </button>
              </div>
            </div>

            {/* Recharts Analytics Visualization Section */}
            <DashboardCharts students={students} />

            {/* Custom Logo Upload Center: Dedicated Admin Feature */}
            <div className="mb-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="inline-block animate-pulse">👑</span> Pusat Kustomisasi Logo Kop & Dokumen SPMB (Khusus Admin)
                </h3>
                <p className="text-slate-500 text-[11px] sm:text-xs mt-1 leading-relaxed max-w-3xl text-justify">
                  Sebagai panitia admin SPMB, Anda dapat mengupload logo kustom (PNG/JPG/SVG) untuk instansi sekolah maupun instansi Dinas Pendidikan. Logo-logo ini akan langsung disinkronkan secara real-time pada <strong>KOP Surat</strong> dan <strong>Bukti Hasil Seleksi SPMB yang Dicetak</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Panel 1: Logo Sekolah */}
                <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0 flex items-center justify-center bg-white border border-slate-200 rounded-xl p-2 shadow-xs w-16 h-16">
                      <Sdn4KronggenLogo size={48} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-emerald-850 font-extrabold uppercase tracking-widest block">Logo Kanan Kop</span>
                      <strong className="text-xs text-slate-800 block">Logo SD Negeri 4 Kronggen</strong>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full sm:w-auto mt-3 sm:mt-0">
                    <label className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-250 font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-101 active:scale-99">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" /> Upload Logo SD
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {hasCustomLogo && (
                      <button
                        onClick={handleResetLogo}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-850 hover:bg-rose-100 border border-rose-220 font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Reset Default
                      </button>
                    )}
                  </div>
                </div>

                {/* Panel 2: Logo Dinas Pendidikan */}
                <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0 flex items-center justify-center bg-white border border-slate-200 rounded-xl p-2 shadow-xs w-16 h-16">
                      <DinasPendidikanLogo size={48} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-sky-850 font-extrabold uppercase tracking-widest block">Logo Kiri Kop</span>
                      <strong className="text-xs text-slate-800 block">Logo Dinas Pendidikan</strong>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full sm:w-auto mt-3 sm:mt-0">
                    <label className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-250 font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-101 active:scale-99">
                      <Upload className="w-3.5 h-3.5 text-sky-600" /> Upload Logo Dinas
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDinasLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {hasCustomDinasLogo && (
                      <button
                        onClick={handleResetDinasLogo}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-850 hover:bg-rose-100 border border-rose-220 font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Reset Default
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Pusat Pengelolaan Kegiatan Praktik Baik (Khusus Admin) */}
            <div className="mb-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="inline-block animate-pulse">📢</span> Pusat Pengelolaan Kegiatan Praktik Baik (Khusus Admin)
                  </h3>
                  <p className="text-slate-500 text-[11px] sm:text-xs mt-1 leading-relaxed max-w-2xl text-justify">
                    Sempurnakan dan kelola galeri foto kegiatan nyata siswa SD Negeri 4 Kronggen yang berbudaya lingkungan hidup. Gambar yang Anda upload atau edit di sini akan langsung disinkronkan secara instan pada beranda depan situs web sekolah.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingNewKegiatan(!isAddingNewKegiatan);
                    setEditingKegiatanId(null);
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 ${
                    isAddingNewKegiatan 
                      ? 'bg-slate-800 text-white hover:bg-slate-900' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isAddingNewKegiatan ? (
                    <> <X className="w-4 h-4" /> Batal Tambah </>
                  ) : (
                    <> <Plus className="w-4 h-4" /> Tambah Kegiatan </>
                  )}
                </button>
              </div>

              {/* FORM TAMBAH KEGIATAN BARU */}
              {isAddingNewKegiatan && (
                <div className="p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/20 space-y-4">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Form Dokumentasi Baru 📝
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column Fields */}
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block pl-1">Judul Kegiatan Praktik Baik</label>
                        <input 
                          type="text"
                          placeholder="Contoh: Pembiasaan SASI SASA Bersih Kelas..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs font-semibold"
                          value={newJudul}
                          onChange={(e) => setNewJudul(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 block pl-1">Kategori Praktik Baik</label>
                          <select 
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs font-semibold"
                            value={newKategori}
                            onChange={(e) => setNewKategori(e.target.value)}
                          >
                            <option value="Lingkungan">Lingkungan</option>
                            <option value="Keagamaan">Keagamaan</option>
                            <option value="Sains & Alam">Sains & Alam</option>
                            <option value="Pelestarian Budaya">Pelestarian Budaya</option>
                            <option value="Lain-lain">Lain-lain</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 block pl-1">Jadwal / Waktu Pelaksanaan</label>
                          <input 
                            type="text"
                            placeholder="Contoh: Setiap Jumat Pagi..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs font-semibold"
                            value={newTanggal}
                            onChange={(e) => setNewTanggal(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Image URL text input option */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block pl-1">Atau Gunakan Link Image URL dari Internet</label>
                        <input 
                          type="text"
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs font-semibold"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                        />
                        <span className="text-[10px] text-slate-400 block pl-1">Kosongkan untuk memakai template visual sekolah modern.</span>
                      </div>
                    </div>

                    {/* Right Column (Description & File Upload) */}
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block pl-1">Deskripsi Kegiatan & Nilai Karakter</label>
                        <textarea 
                          rows={3}
                          placeholder="Tuliskan detail aksi kegiatan, tujuan pendidikan karakter, serta apa saja yang dilakukan siswa-siswi..."
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs font-semibold"
                          value={newDeskripsi}
                          onChange={(e) => setNewDeskripsi(e.target.value)}
                        />
                      </div>

                      {/* File Upload Trigger */}
                      <div className="p-3 border border-dashed border-slate-200 bg-white rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black text-rose-600 block leading-none uppercase">Rekomendasi Foto</span>
                          <strong className="text-[11px] text-slate-800 block mt-1">Upload Gambar Kegiatan (Lokal JPG/PNG)</strong>
                        </div>
                        <label className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200 cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3 text-emerald-600" /> Pilih File Foto
                          <input 
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCreateImgUpload}
                          />
                        </label>
                      </div>

                      {/* Preview Image node */}
                      {(newImageUrl || newImageUrl === '') && (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-bold">Preview Banner:</span>
                          <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0">
                            <img 
                              src={newImageUrl || 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80'} 
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 italic font-medium truncate max-w-[200px]">
                            {newImageUrl ? "Telah Terkait / Gambar Terunggah" : "Menggunakan Default"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-2 border-t border-slate-200/50 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsAddingNewKegiatan(false);
                        setNewJudul('');
                        setNewDeskripsi('');
                        setNewTanggal('');
                        setNewImageUrl('');
                      }}
                      className="py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleCreateNewKegiatan}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                    >
                      Simpan & Publikasikan Kegiatan
                    </button>
                  </div>
                </div>
              )}

              {/* LIST UTAMA KEGIATAN YANG ADA */}
              <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1.5 scrollbar-thin">
                {kegiatanList.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 italic text-xs">
                    Belum ada Kegiatan Praktik Baik yang tersimpan di sistem.
                  </div>
                ) : (
                  kegiatanList.map((k) => {
                    const isEditing = editingKegiatanId === k.id;
                    return (
                      <div 
                        key={k.id} 
                        className={`p-4 rounded-2xl border transition-all ${
                          isEditing 
                            ? 'border-emerald-500 bg-emerald-50/10 shadow-sm' 
                            : 'border-slate-150 hover:border-slate-200 bg-slate-50/30'
                        }`}
                      >
                        {isEditing ? (
                          /* INLINE EDITOR FORM */
                          <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                              <span className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1">
                                <Edit2 className="w-3.5 h-3.5" /> Sedang Mengubah Dokumentasi : {k.judul}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Edit Field Left */}
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 block pl-1">Judul Kegiatan</label>
                                  <input 
                                    type="text"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs font-semibold"
                                    value={editJudul}
                                    onChange={(e) => setEditJudul(e.target.value)}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 block pl-1">Kategori</label>
                                    <select 
                                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs font-semibold"
                                      value={editKategori}
                                      onChange={(e) => setEditKategori(e.target.value)}
                                    >
                                      <option value="Lingkungan">Lingkungan</option>
                                      <option value="Keagamaan">Keagamaan</option>
                                      <option value="Sains & Alam">Sains & Alam</option>
                                      <option value="Pelestarian Budaya">Pelestarian Budaya</option>
                                      <option value="Lain-lain">Lain-lain</option>
                                    </select>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 block pl-1">Waktu / Jadwal Hari</label>
                                    <input 
                                      type="text"
                                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs font-semibold"
                                      value={editTanggal}
                                      onChange={(e) => setEditTanggal(e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 block pl-1">Ganti via Link Image URL Internet</label>
                                  <input 
                                    type="text"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs font-semibold"
                                    value={editImageUrl}
                                    onChange={(e) => setEditImageUrl(e.target.value)}
                                  />
                                </div>
                              </div>

                              {/* Edit Field Right */}
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 block pl-1">Deskripsi Kegiatan & Nilai Karakter</label>
                                  <textarea 
                                    rows={3}
                                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs font-semibold"
                                    value={editDeskripsi}
                                    onChange={(e) => setEditDeskripsi(e.target.value)}
                                  />
                                </div>

                                {/* Local Upload Ganti */}
                                <div className="p-2 bg-white border border-dashed border-slate-200 rounded-xl flex items-center justify-between gap-3">
                                  <span className="text-[10px] font-bold text-slate-500 block pl-1">Atau upload foto lokal baru:</span>
                                  <label className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase border border-emerald-200 cursor-pointer flex items-center gap-1">
                                    <Upload className="w-3 h-3" /> Pilih Foto
                                    <input 
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleEditImgUpload}
                                    />
                                  </label>
                                </div>

                                {/* Image Preview Edit */}
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 font-bold block">Preview Aktif:</span>
                                  <div className="w-14 h-8 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                    <img 
                                      src={editImageUrl} 
                                      alt="Preview Edit"
                                      className="w-full h-full object-cover" 
                                      onError={(e)=>{ e.currentTarget.src='https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80'; }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Save/Cancel */}
                            <div className="pt-2 border-t border-slate-200/50 flex justify-end gap-2">
                              <button
                                onClick={() => setEditingKegiatanId(null)}
                                className="py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-lg cursor-pointer"
                              >
                                Batal
                              </button>
                              <button
                                onClick={handleSaveEditKegiatan}
                                className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                              >
                                <Save className="w-3.5 h-3.5" /> Simpan Pembaruan
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* STATIC ROW VIEW */
                          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                              {/* Thumbnail */}
                              <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden shadow-xs border border-slate-200 shrink-0 bg-slate-200">
                                <img 
                                  src={k.imageUrl} 
                                  alt={k.judul} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1427504494785-3a9ca7544f45?auto=format&fit=crop&w=800&q=80";
                                  }}
                                />
                              </div>

                              {/* Text Info */}
                              <div className="text-center sm:text-left space-y-1">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                                  <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 block">
                                    {k.kategori}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-450 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {k.tanggalKegiatan}
                                  </span>
                                </div>
                                <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{k.judul}</h4>
                                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-normal line-clamp-2 sm:max-w-xl text-justify">
                                  {k.deskripsi}
                                </p>
                              </div>
                            </div>

                            {/* Row Action buttons */}
                            <div className="flex sm:flex-col gap-1.5 shrink-0 self-center">
                              <button
                                onClick={() => startEditKegiatan(k)}
                                className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-100 text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-3 h-3 text-slate-500" /> Ubah Data
                              </button>
                              <button
                                onClick={() => handleDeleteKegiatan(k.id, k.judul)}
                                className="px-2.5 py-1.5 border border-rose-200 rounded-xl bg-rose-50/40 text-rose-700 hover:bg-rose-50 text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Hapus
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 📂 Pusat Google Drive Backup & Integrasi Cloud (Khusus Admin) */}
            <div className="mb-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="inline-block animate-pulse">📂</span> Pusat Integrasi Cloud Google Drive (Khusus Admin)
                </h3>
                <p className="text-slate-500 text-[11px] sm:text-xs mt-1 leading-relaxed max-w-2xl text-justify">
                  Backup basis data pendaftar PPDB SDN 4 Kronggen langsung ke Google Drive Anda secara aman. Koneksi cloud diatur secara privat sehingga data sekolah tersimpan rapi dan dapat diakses kapan saja.
                </p>
              </div>

              {!driveUser ? (
                /* OFF-STATE: CONNECT DRIVE */
                <div className="p-8 border border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-xs">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
                    </svg>
                  </div>
                  <div className="max-w-md bg-transparent">
                    <h4 className="text-xs sm:text-sm font-black text-slate-800">Sesi Google Drive Belum Terhubung</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                      Hubungkan akun Google Drive Anda untuk mulai mencadangkan data pendaftar. Anda akan diminta persetujuan integrasi.
                    </p>
                  </div>
                  <button
                    onClick={handleDriveLogin}
                    disabled={isDriveLoading}
                    className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 disabled:bg-slate-450"
                  >
                    {isDriveLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menghubungkan...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96v0z" />
                        </svg>
                        <span>Hubungkan Google Drive</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* ON-STATE: CONNECTED PANEL & ACTIONS */
                <div className="space-y-6">
                  {/* Account Header */}
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {driveUser.photoURL ? (
                        <img 
                          referrerPolicy="no-referrer"
                          src={driveUser.photoURL} 
                          alt={driveUser.displayName || driveUser.email} 
                          className="w-10 h-10 rounded-full border border-slate-300"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-850 rounded-full flex items-center justify-center font-bold text-sm">
                          {driveUser.email ? driveUser.email[0].toUpperCase() : 'G'}
                        </div>
                      )}
                      <div className="text-left bg-transparent">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest block w-fit">
                          🟢 AKTIF & TERHUBUNG
                        </span>
                        <strong className="text-xs text-slate-800 block mt-0.5">{driveUser.displayName || 'Akun Google'}</strong>
                        <span className="text-[10px] text-slate-500 block">{driveUser.email}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isCreatingBackup ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Backup Sekarang</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDriveLogout}
                        className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Putus</span>
                      </button>
                    </div>
                  </div>

                  {/* Backups List */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                        📂 Riwayat File Cadangan di Google Drive Anda ({driveBackups.length})
                      </h4>
                      <button 
                        onClick={() => fetchBackups(driveToken)}
                        className="text-[10px] font-bold text-slate-400 hover:text-emerald-750 flex items-center gap-1 transition-colors cursor-pointer block"
                      >
                        <RefreshCw className="w-3 h-3" /> Segarkan
                      </button>
                    </div>

                    {isDriveLoading ? (
                      <div className="py-6 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memindai berkas di Google Drive...</span>
                      </div>
                    ) : driveBackups.length === 0 ? (
                      <div className="py-8 border border-dashed border-slate-205 rounded-xl text-center text-slate-400 text-[11px]">
                        Arsip backup pendaftaran tidak ditemukan. Klik "Backup Sekarang" untuk mengunggah salinan data pendaftaran pertama Anda.
                      </div>
                    ) : (
                      <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
                        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                          {driveBackups.map((f) => (
                            <div key={f.id} className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="text-left min-w-0 bg-transparent">
                                  <span className="text-xs font-bold text-slate-700 block truncate">{f.name}</span>
                                  <span className="text-[10px] text-slate-450 block mt-0.5">
                                    Dibuat pada: {new Date(f.createdTime).toLocaleString('id-ID')} {f.size ? `• ${(parseInt(f.size) / 1024).toFixed(2)} KB` : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                {f.webViewLink && (
                                  <a 
                                    href={f.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1 active:scale-95 transition-all text-center"
                                  >
                                    Buka File
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteBackupClick(f)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer text-center"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRM DELETE FILE MODAL FOR GOOGLE DRIVE BACKUPS */}
            <AnimatePresence>
              {backupToDelete && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setBackupToDelete(null)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full relative z-10 space-y-4"
                  >
                    <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-1">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div className="text-center bg-transparent">
                      <h4 className="text-lg font-black text-slate-800">Hapus File Cadangan Cloud?</h4>
                      <p className="text-xs text-slate-550 mt-1 pb-1">
                        Apakah Anda benar-benar yakin ingin menghapus berkas backup <strong>"{backupToDelete.name}"</strong> dari Google Drive Anda?
                      </p>
                      <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-[10px] text-justify text-rose-850 mt-3 leading-relaxed">
                        ⚠️ <strong>Tindakan ini pembersihan absolut!</strong> Berkas ini akan dihapus langsung dari akun penyimpanan Google Drive Anda secara permanen.
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setBackupToDelete(null)}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-50 cursor-pointer active:scale-95 transition-all text-center"
                      >
                        Batal
                      </button>
                      <button
                        onClick={confirmDeleteBackup}
                        className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all text-center"
                      >
                        Ya, Hapus Permanen
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Selection Guidance Rules */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-700 leading-relaxed mb-6 space-y-1.5 text-justify">
              <span className="font-extrabold text-amber-900 block flex items-center gap-1"><HelpCircle className="w-4 h-4 text-amber-600" /> Panduan Hukum Sistem Seleksi Otomatis (Perbup):</span>
              <ul className="list-disc pl-5 space-y-1">
                <li>Jalur Zonasi mengurutkan pendaftar: (1) Usia prioritas utama ≥ 7 tahun. (2) Sorter berikutnya berdasarkan jarak lokasi rumah terdekat (Meter) ke SDN 4 Kronggen.</li>
                <li>Hanya 28 kuota tampung yang dapat masuk ke rombel. Jalankan <strong>Seleksi Otomatis</strong> untuk mensortir pendaftar terbaik langsung ke status <strong>"Diterima"</strong>, memindahkan pendaftar berlebih ke status <strong>"Cadangan"</strong> secara objektif tanpa nepotisme!</li>
              </ul>
            </div>

            {/* Filters Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Saring Jalur Masuk</label>
                <select 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold"
                  value={filterJalur}
                  onChange={(e) => setFilterJalur(e.target.value)}
                >
                  <option value="all">Semua Jalur (Zonasi, Afirmasi, Mutasi)</option>
                  <option value="domisili">Hanya Jalur Zonasi Domisili (Pagu 23)</option>
                  <option value="afirmasi">Hanya Jalur Afirmasi Sosial (Pagu 4)</option>
                  <option value="mutasi">Hanya Jalur Mutasi Pindahan (Pagu 1)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Saring Status Kelulusan</label>
                <select 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Semua Status Kelulusan</option>
                  <option value="Pending">Pending (Verifikasi Dokumen Fisik)</option>
                  <option value="Terverifikasi">Terverifikasi (Verifikat Valid)</option>
                  <option value="Diterima">Diterima (Lolos Seleksi)</option>
                  <option value="Cadangan">Cadangan (Dalam Daftar Tunggu)</option>
                  <option value="Gugur">Gugur (Berkas Salah)</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <span className="text-[11px] text-slate-400 mb-1 font-bold">Urutkan Sorter:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSort('usia')}
                    className={`flex-1 py-2 px-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      sortField === 'usia' ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Kombinasi Usia {sortField === 'usia' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => toggleSort('jarak')}
                    className={`flex-1 py-2 px-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      sortField === 'jarak' ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Jarak Meter {sortField === 'jarak' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              </div>
            </div>

            {/* Responsive Table of Students */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Calon Siswa</th>
                      <th className="py-3 px-4">Jalur</th>
                      <th className="py-3 px-4">Detail Usia (1 Juli 2026)</th>
                      <th className="py-3 px-4">Zonasi (Jarak)</th>
                      <th className="py-3 px-4">Berkas Fisik</th>
                      <th className="py-3 px-4">Status SPMB</th>
                      <th className="py-3 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((siswa, i) => {
                        return (
                          <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4">
                              <span className="block font-bold text-slate-800 uppercase">{siswa.namaLengkap}</span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{siswa.id} | NIK: {siswa.nik}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase ${
                                siswa.jalur === 'domisili' ? 'bg-emerald-100 text-emerald-80s0' : siswa.jalur === 'afirmasi' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {siswa.jalur === 'domisili' ? 'Zonasi' : siswa.jalur === 'afirmasi' ? 'Afirmasi' : 'Mutasi'}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-medium text-slate-700">
                              <span className="block">{siswa.usiaTahun} Th {siswa.usiaBulan} bln</span>
                              <span className="text-[10px] text-slate-400 italic block">{siswa.tanggalLahir}</span>
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-800 text-right pr-10">
                              {siswa.jarakKeSekolah} m
                            </td>
                            <td className="py-4 px-4 text-slate-500">
                              <div className="flex gap-1">
                                <span className={`w-4 h-4 text-[9px] font-bold rounded flex items-center justify-center ${siswa.hasAkta ? 'bg-emerald-105 text-emerald-700 border border-emerald-305' : 'bg-slate-100 text-slate-400'}`} title="Akta">A</span>
                                <span className={`w-4 h-4 text-[9px] font-bold rounded flex items-center justify-center ${siswa.hasKK ? 'bg-emerald-105 text-emerald-700 border border-emerald-305' : 'bg-slate-100 text-slate-400'}`} title="KK">K</span>
                                <span className={`w-4 h-4 text-[9px] font-bold rounded flex items-center justify-center ${siswa.hasSPTJM ? 'bg-emerald-105 text-emerald-700 border border-emerald-305' : 'bg-slate-100 text-slate-400'}`} title="SPTJM">S</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="relative group inline-block">
                                <select
                                  value={siswa.status}
                                  onChange={(e) => handleStatusSelectChange(siswa.id, siswa.namaLengkap, e.target.value as CalonSiswa['status'])}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase pointer border cursor-pointer ${
                                    siswa.status === 'Diterima' ? 'bg-emerald-58 border-emerald-200 text-emerald-700 font-black' :
                                    siswa.status === 'Terverifikasi' ? 'bg-teal-50 border-teal-200 text-teal-700' :
                                    siswa.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                    siswa.status === 'Cadangan' ? 'bg-sky-50 border-sky-200 text-sky-700' :
                                    'bg-rose-50 border-rose-200 text-rose-700'
                                  }`}
                                >
                                  <option value="Pending">⏳ Pending</option>
                                  <option value="Terverifikasi">⌛ Valid</option>
                                  <option value="Diterima">❇ Lolos</option>
                                  <option value="Cadangan">🛡 Cadangan</option>
                                  <option value="Gugur">✖ Gugur</option>
                                </select>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex justify-center items-center gap-1.5">
                                <button
                                  onClick={() => onSelectStudentToPrint(siswa)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-55 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 border border-emerald-200/20"
                                  title="Buka pratinjau dan unduh berkas pendaftaran"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Pratinjau
                                </button>
                                {onDeleteStudent && (
                                  <button
                                    onClick={() => setStudentToDelete({ id: siswa.id, name: siswa.namaLengkap })}
                                    className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 border border-rose-200/40"
                                    title="Hapus pendaftar ini secara permanen dari database"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-450 italic">
                          Belum ada data pendaftar yang cocok dengan filter saringan saat ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- ADMIN CONFIRMATION MODALS (EXCLUSIVE & SAFE FOR IFRAMES) --- */}

            {/* 1. Secure Delete Confirmation Modal */}
            {studentToDelete && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop Blur overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setStudentToDelete(null)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
                />

                {/* Modal Container */}
                <motion.div 
                  initial={{ scale: 0.95, y: 15, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative z-10 space-y-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Konfirmasi Hapus Data</span>
                      <h3 className="text-base sm:text-lg font-black text-slate-850 mt-1 uppercase leading-snug">
                        Hapus Pendaftar Permanen?
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Anda akan menghapus berkas milik <strong className="text-slate-800 uppercase font-extrabold">"{studentToDelete.name}"</strong> (ID: {studentToDelete.id}) secara permanen dari basis data pendaftaran sekolah.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-xs text-rose-800 leading-relaxed text-justify">
                    <strong>⚠️ PERINGATAN RESMI:</strong> Tindakan ini bersifat final, tidak dapat dibatalkan, dan akan menghapus seluruh data umur, berkas akta/KK, kalkulasi jarak zonasi, beserta rekam riwayat pendaftaran calon siswa ini.
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => setStudentToDelete(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      Batalkan
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:scale-101 active:scale-99 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus Permanen
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* 2. Secure Reset Database Confirmation Modal */}
            {showResetConfirm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop Blur overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowResetConfirm(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
                />

                {/* Modal Container */}
                <motion.div 
                  initial={{ scale: 0.95, y: 15, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative z-10 space-y-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                      <RefreshCw className="w-6 h-6 animate-spin-reverse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Penyetelan Ulang Basis Data</span>
                      <h3 className="text-base sm:text-lg font-black text-slate-850 mt-1 uppercase leading-snug">
                        Reset Sensus SPMB?
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Apakah Anda sepenuhnya yakin ingin mereset seluruh database pendaftaran calon peserta didik baru ke data sampel pabrik bawaan sekolah?
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs text-amber-800 leading-relaxed text-justify">
                    <strong>💡 INFO DATABASE:</strong> Seluruh data pendaftar baru yang Anda daftarkan manual akan hilang dan digantikan oleh 15 pendaftar simulasi standar untuk pengujian sistem zonasi sekolah.
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmReset}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:scale-101 active:scale-99 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Ya, Setel Ulang
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
