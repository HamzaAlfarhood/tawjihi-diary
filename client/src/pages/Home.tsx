import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Moon, Sun, Trash2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface DiaryEntry {
  dateInfo: string;
  dateStr: string;
  done: string;
  tomorrow: string;
}

const DAYS_ARABIC = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/**
 * Design Philosophy: Minimalist Productivity + Warm Accents
 * - Clean interface focused on core tasks
 * - Warm colors (blue + orange) for encouragement
 * - Responsive design for all screen sizes
 * - Dark mode support for comfortable night studying
 */
export default function Home() {
  const { theme, toggleTheme, switchable } = useTheme();
  const [notes, setNotes] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doneText, setDoneText] = useState('');
  const [tomorrowText, setTomorrowText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('diaryNotes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Error loading notes:', e);
      }
    }
  }, []);

  // Auto-save notes to localStorage with debouncing
  const saveNotes = (updatedNotes: DiaryEntry[]) => {
    setIsSaving(true);
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('diaryNotes', JSON.stringify(updatedNotes));
        setIsSaving(false);
      } catch (e) {
        console.error('Error saving notes:', e);
        setIsSaving(false);
      }
    }, 500);
  };

  const getFormattedDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedDateDisplay = (date: Date) => {
    const dayName = DAYS_ARABIC[date.getDay()];
    const dateStr = getFormattedDateString(date);
    return `📅 ${dateStr} | 🗓️ ${dayName}`;
  };

  const loadCurrentDayData = () => {
    const dateStr = getFormattedDateString(selectedDate);
    const existingNote = notes.find(n => n.dateStr === dateStr);
    if (existingNote) {
      setDoneText(existingNote.done);
      setTomorrowText(existingNote.tomorrow);
    } else {
      setDoneText('');
      setTomorrowText('');
    }
  };

  const handleOpenModal = () => {
    setSelectedDate(new Date());
    setDoneText('');
    setTomorrowText('');
    loadCurrentDayData();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveEntry = () => {
    const dateStr = getFormattedDateString(selectedDate);
    const dateInfo = getFormattedDateDisplay(selectedDate);
    
    const updatedNotes = notes.filter(n => n.dateStr !== dateStr);
    
    if (doneText.trim() || tomorrowText.trim()) {
      updatedNotes.unshift({
        dateInfo,
        dateStr,
        done: doneText,
        tomorrow: tomorrowText,
      });
    }

    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    toast.success('✓ تم الحفظ بنجاح');
    handleCloseModal();
  };

  const handleDeleteEntry = (dateStr: string) => {
    const updatedNotes = notes.filter(n => n.dateStr !== dateStr);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    toast.success('✓ تم الحذف بنجاح');
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    setTimeout(loadCurrentDayData, 0);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    setTimeout(loadCurrentDayData, 0);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value));
      setTimeout(loadCurrentDayData, 0);
    }
  };

  const totalDays = notes.length;
  const lastNoteDate = notes.length > 0 ? notes[0].dateStr : '-';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      {/* Header - Responsive */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white truncate">
              🎯 إنجاز التوجيهي
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 line-clamp-1">
              نظام متابعة يومي للدراسة والإنجاز
            </p>
          </div>
          <button
            onClick={() => toggleTheme?.()}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
            disabled={!switchable}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Panel - Responsive Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-4 lg:p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-1 sm:mb-2">
                {totalDays}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">أيام الالتزام</p>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 lg:p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-xs sm:text-sm lg:text-lg font-bold text-blue-500 mb-1 sm:mb-2 truncate">
                {lastNoteDate}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">آخر تحديث</p>
            </div>
          </Card>
        </div>

        {/* History Section - Responsive */}
        <div className="mb-20 sm:mb-24">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
            📜 سجل دراستك السابق
          </h2>
          
          {notes.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                لم تضف أي مذكرات بعد. ابدأ الآن! 🚀
              </p>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {notes.map((note) => (
                <Card
                  key={note.dateStr}
                  className="p-4 sm:p-5 lg:p-6 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">
                        {note.dateInfo}
                      </p>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">
                            ✅ إنجازات اليوم
                          </p>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words line-clamp-3">
                            {note.done || 'لا يوجد'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                            🎯 خطة الغد
                          </p>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words line-clamp-3">
                            {note.tomorrow || 'لا يوجد'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteEntry(note.dateStr)}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button - Responsive */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-2xl sm:text-3xl font-bold z-50"
        aria-label="Add new entry"
      >
        +
      </button>

      {/* Modal Dialog - Responsive */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-md mx-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right text-lg sm:text-xl text-slate-900 dark:text-white">
              📝 إضافة مذكرة يومية
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-4">
            {/* Date Navigation - Responsive */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevDay}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="اليوم السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex-1 text-center truncate">
                  {getFormattedDateDisplay(selectedDate)}
                </p>
                <button
                  onClick={handleNextDay}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="اليوم التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              
              <Input
                type="date"
                value={getFormattedDateString(selectedDate)}
                onChange={handleDateChange}
                className="w-full text-center text-xs sm:text-sm bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
              />
            </div>

            {/* Done Input - Responsive */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1 sm:mb-2">
                ✅ ماذا أنجزت اليوم؟
              </label>
              <Textarea
                value={doneText}
                onChange={(e) => setDoneText(e.target.value)}
                placeholder="اكتب إنجازاتك..."
                className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
              />
            </div>

            {/* Tomorrow Input - Responsive */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1 sm:mb-2">
                🚀 ما هي خطتك لغد؟
              </label>
              <Textarea
                value={tomorrowText}
                onChange={(e) => setTomorrowText(e.target.value)}
                placeholder="اكتب خطتك..."
                className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
              />
            </div>

            {/* Save Status */}
            {isSaving && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ⏳ جاري الحفظ...
              </p>
            )}
          </div>

          {/* Action Buttons - Responsive */}
          <div className="flex gap-2 sm:gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="text-xs sm:text-sm border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSaveEntry}
              className="text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              حفظ المذكرة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
