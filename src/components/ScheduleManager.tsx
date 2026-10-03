import React, { useState, useRef } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Upload,
  Sparkles,
  Camera,
  Layers,
  Moon,
  Sun,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { ScheduleItem, WeeklyRoutineSlot } from '../types';

interface ScheduleManagerProps {
  schedules: ScheduleItem[];
  weeklySlots: WeeklyRoutineSlot[];
  onAddSchedule: (schedule: Omit<ScheduleItem, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onSaveWeeklySlots: (slots: WeeklyRoutineSlot[]) => void;
  onClose: () => void;
}

const PERIODS = [
  { period: '1限', startTime: '09:00', endTime: '10:30' },
  { period: '2限', startTime: '10:40', endTime: '12:10' },
  { period: '3限', startTime: '13:00', endTime: '14:30' },
  { period: '4限', startTime: '14:45', endTime: '16:15' },
  { period: '5限', startTime: '16:30', endTime: '18:00' },
];

const DAYS: Array<'月' | '火' | '水' | '木' | '金'> = ['月', '火', '水', '木', '金'];

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  schedules,
  weeklySlots,
  onAddSchedule,
  onDeleteSchedule,
  onToggleComplete,
  onSaveWeeklySlots,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'tomorrow' | 'weekly'>('tomorrow');

  // 明日の個別予定フォーム用
  const [tomorrowTitle, setTomorrowTitle] = useState('');
  const [tomorrowTime, setTomorrowTime] = useState('09:00');
  const [tomorrowLocation, setTomorrowLocation] = useState('講義棟 201');
  const [tomorrowPrep, setTomorrowPrep] = useState(40);
  const [tomorrowTransit, setTomorrowTransit] = useState(35);
  const [showTomorrowForm, setShowTomorrowForm] = useState(false);

  // 週のコマ編集用モーダル
  const [editingSlot, setEditingSlot] = useState<{
    day: '月' | '火' | '水' | '木' | '金';
    period: string;
    startTime: string;
    endTime: string;
    subject: string;
    location: string;
  } | null>(null);

  // AIスクショ読み込み用ステート
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisError, setImageAnalysisError] = useState<string | null>(null);
  const [analyzedPreviewItems, setAnalyzedPreviewItems] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 明日の日付と曜日を計算
  const getTomorrowInfo = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const dayNames: Array<'日' | '月' | '火' | '水' | '木' | '金' | '土'> = [
      '日',
      '月',
      '火',
      '水',
      '木',
      '金',
      '土',
    ];
    const dayOfWeek = dayNames[tomorrow.getDay()];
    return {
      dateStr,
      displayDate: `${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日 (${dayOfWeek})`,
      dayOfWeek,
      isWeekday: dayOfWeek !== '日' && dayOfWeek !== '土',
    };
  };

  const tomorrowInfo = getTomorrowInfo();

  // 明日の曜日ルーティン（時間割の該当曜日のコマ）
  const tomorrowRoutineSlots = weeklySlots
    .filter((s) => s.dayOfWeek === tomorrowInfo.dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // 明日の個別予定
  const tomorrowCustomSchedules = schedules.filter((s) => s.date === tomorrowInfo.dateStr);

  // 明日のメイン予定（個別予定優先、なければルーティン最速コマ）
  const mainTomorrowTarget = (() => {
    if (tomorrowCustomSchedules.length > 0) {
      return {
        title: tomorrowCustomSchedules[0].title,
        time: tomorrowCustomSchedules[0].time,
        location: tomorrowCustomSchedules[0].location || '未指定',
        prep: tomorrowCustomSchedules[0].prepMinutes,
        transit: tomorrowCustomSchedules[0].transitMinutes,
        isCustom: true,
      };
    }
    if (tomorrowRoutineSlots.length > 0) {
      const first = tomorrowRoutineSlots[0];
      return {
        title: `${first.period} ${first.subject}`,
        time: first.startTime,
        location: first.location || '講義棟',
        prep: first.prepMinutes,
        transit: first.transitMinutes,
        isCustom: false,
      };
    }
    return null;
  })();

  // 逆算起床・出発・就寝時刻の計算
  const calculateReverse = (targetTime: string, prep: number, transit: number) => {
    const [h, m] = targetTime.split(':').map(Number);
    const targetMin = h * 60 + m;

    let leaveMin = targetMin - transit - 10; // 余裕10分
    if (leaveMin < 0) leaveMin += 24 * 60;

    let wakeMin = leaveMin - prep;
    if (wakeMin < 0) wakeMin += 24 * 60;

    let sleepMin = wakeMin - 7.5 * 60; // 7.5時間睡眠目標
    if (sleepMin < 0) sleepMin += 24 * 60;

    const fmt = (minutes: number) => {
      const hh = Math.floor(minutes / 60) % 24;
      const mm = Math.floor(minutes % 60);
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    return {
      wakeUp: fmt(wakeMin),
      leaveHome: fmt(leaveMin),
      targetSleep: fmt(sleepMin),
    };
  };

  const tomorrowReverse = mainTomorrowTarget
    ? calculateReverse(mainTomorrowTarget.time, mainTomorrowTarget.prep, mainTomorrowTarget.transit)
    : null;

  // 明日の個別予定を追加
  const handleAddTomorrowSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tomorrowTitle.trim()) return;

    onAddSchedule({
      title: tomorrowTitle.trim(),
      date: tomorrowInfo.dateStr,
      time: tomorrowTime,
      location: tomorrowLocation.trim() || undefined,
      prepMinutes: tomorrowPrep,
      transitMinutes: tomorrowTransit,
      isCompleted: false,
      isCustomTomorrow: true,
    });

    setTomorrowTitle('');
    setShowTomorrowForm(false);
  };

  // 時間割セルのクリック（コマ追加/編集）
  const handleCellClick = (day: '月' | '火' | '水' | '木' | '金', period: string, startTime: string, endTime: string) => {
    const existing = weeklySlots.find((s) => s.dayOfWeek === day && s.period === period);
    setEditingSlot({
      day,
      period,
      startTime: existing?.startTime || startTime,
      endTime: existing?.endTime || endTime,
      subject: existing?.subject || '',
      location: existing?.location || '',
    });
  };

  // コマの保存
  const handleSaveSlot = (subject: string, location: string) => {
    if (!editingSlot) return;

    const filtered = weeklySlots.filter(
      (s) => !(s.dayOfWeek === editingSlot.day && s.period === editingSlot.period)
    );

    if (subject.trim()) {
      const newSlot: WeeklyRoutineSlot = {
        id: `${editingSlot.day}-${editingSlot.period}`,
        dayOfWeek: editingSlot.day,
        period: editingSlot.period,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        subject: subject.trim(),
        location: location.trim() || undefined,
        prepMinutes: 40,
        transitMinutes: 35,
      };
      onSaveWeeklySlots([...filtered, newSlot]);
    } else {
      onSaveWeeklySlots(filtered);
    }
    setEditingSlot(null);
  };

  // 時間割スクショ画像のAI解析（Gemini 3.8 Flash）
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    setImageAnalysisError(null);
    setAnalyzedPreviewItems(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await fetch('/api/parse-timetable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
            }),
          });

          if (!res.ok) {
            throw new Error(`解析エラー (Status: ${res.status})`);
          }

          const data = await res.json();
          if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            setAnalyzedPreviewItems(data.items);
          } else {
            setImageAnalysisError('講義が見つかりませんでした。画像が明瞭かご確認ください。');
          }
        } catch (err: any) {
          console.error(err);
          setImageAnalysisError(err.message || 'AI解析に失敗しました。');
        } finally {
          setIsAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setImageAnalysisError(err.message || '画像読み込みエラー');
      setIsAnalyzingImage(false);
    }
  };

  // サンプル時間割の適用（大学標準モデル）
  const handleApplySampleTimetable = () => {
    const samples: WeeklyRoutineSlot[] = [
      { id: '月-1限', dayOfWeek: '月', period: '1限', startTime: '09:00', endTime: '10:30', subject: 'データサイエンス基礎', location: '講義棟 201', prepMinutes: 40, transitMinutes: 35 },
      { id: '月-3限', dayOfWeek: '月', period: '3限', startTime: '13:00', endTime: '14:30', subject: '線形代数学', location: '大講義室 A', prepMinutes: 40, transitMinutes: 35 },
      { id: '火-2限', dayOfWeek: '火', period: '2限', startTime: '10:40', endTime: '12:10', subject: '英語コミュニケーション', location: '語学棟 102', prepMinutes: 40, transitMinutes: 35 },
      { id: '火-4限', dayOfWeek: '火', period: '4限', startTime: '14:45', endTime: '16:15', subject: 'プログラミング演習', location: '情処実習室 3', prepMinutes: 40, transitMinutes: 35 },
      { id: '水-1限', dayOfWeek: '水', period: '1限', startTime: '09:00', endTime: '10:30', subject: 'ミクロ経済学', location: '講義棟 305', prepMinutes: 40, transitMinutes: 35 },
      { id: '木-2限', dayOfWeek: '木', period: '2限', startTime: '10:40', endTime: '12:10', subject: '統計学入門', location: '講義棟 201', prepMinutes: 40, transitMinutes: 35 },
      { id: '木-3限', dayOfWeek: '木', period: '3限', startTime: '13:00', endTime: '14:30', subject: 'キャリアデザイン', location: 'ホール B', prepMinutes: 40, transitMinutes: 35 },
      { id: '金-1限', dayOfWeek: '金', period: '1限', startTime: '09:00', endTime: '10:30', subject: 'アルゴリズムと論理', location: '講義棟 104', prepMinutes: 40, transitMinutes: 35 },
      { id: '金-2限', dayOfWeek: '金', period: '2限', startTime: '10:40', endTime: '12:10', subject: '情報ネットワーク', location: '講義棟 201', prepMinutes: 40, transitMinutes: 35 },
    ];
    onSaveWeeklySlots(samples);
  };

  // AI解析結果を時間割に一括反映
  const handleApplyAnalyzedItems = () => {
    if (!analyzedPreviewItems) return;

    const newSlots: WeeklyRoutineSlot[] = analyzedPreviewItems.map((item, index) => {
      const matchedPeriod = PERIODS.find((p) => p.period === item.period) || PERIODS[0];
      return {
        id: `${item.dayOfWeek}-${item.period || index}`,
        dayOfWeek: item.dayOfWeek as any,
        period: item.period || '1限',
        startTime: item.startTime || matchedPeriod.startTime,
        endTime: item.endTime || matchedPeriod.endTime,
        subject: item.subject || '講義',
        location: item.location || '講義棟',
        prepMinutes: 40,
        transitMinutes: 35,
      };
    });

    onSaveWeeklySlots(newSlots);
    setAnalyzedPreviewItems(null);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-800">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">予定入力ハブ</h3>
              <p className="text-[11px] text-stone-500">
                明日の前日個別予定 ＆ 1週間の大学時間割（スクショ読み込み対応）
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* トップタブ切り替え：明日の予定（前日セット） ⇄ 1週間のルーティン（時間割） */}
        <div className="flex space-x-1 mt-3 bg-stone-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('tomorrow')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'tomorrow'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>明日の予定 (前日入力)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'weekly'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1週間のルーティン (時間割)</span>
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="overflow-y-auto mt-4 space-y-4 pr-1 flex-1">
          {/* ========================================================
              タブ①: 明日の予定（前日入力・逆算セット）
          ======================================================== */}
          {activeTab === 'tomorrow' && (
            <div className="space-y-4">
              {/* 明日サマリーカード */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-600/10 border border-amber-200">
                <div className="flex justify-between items-center pb-2 border-b border-amber-200/60">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-stone-900">
                      {tomorrowInfo.displayDate} の予定
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full">
                    前日自動逆算中
                  </span>
                </div>

                {mainTomorrowTarget && tomorrowReverse ? (
                  <div className="mt-3 space-y-2.5">
                    {/* メイン予定名 */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-stone-900">
                          {mainTomorrowTarget.title}
                        </div>
                        <div className="text-[11px] text-stone-600 flex items-center space-x-2 mt-0.5">
                          <span className="font-mono font-bold text-amber-900">
                            {mainTomorrowTarget.time} 開始
                          </span>
                          <span>•</span>
                          <span>{mainTomorrowTarget.location}</span>
                          {mainTomorrowTarget.isCustom && (
                            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded text-[10px]">
                              個別上書き
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 逆算スケジュールストリップ */}
                    <div className="grid grid-cols-3 gap-2 bg-white/80 p-3 rounded-2xl border border-amber-200 shadow-2xs text-center font-mono">
                      <div>
                        <span className="text-[10px] text-stone-500 block">明朝の起床目標</span>
                        <span className="text-base font-bold text-amber-800">
                          {tomorrowReverse.wakeUp}
                        </span>
                      </div>
                      <div className="border-x border-stone-200">
                        <span className="text-[10px] text-stone-500 block">家を出る出発</span>
                        <span className="text-base font-bold text-stone-900">
                          {tomorrowReverse.leaveHome}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-700 block">今夜の推奨就寝</span>
                        <span className="text-base font-bold text-indigo-950">
                          {tomorrowReverse.targetSleep}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-stone-500 flex items-center justify-between px-1">
                      <span>身支度 {mainTomorrowTarget.prep}分 ＋ 移動 {mainTomorrowTarget.transit}分 ＋ 余裕10分</span>
                      <span>7.5h 睡眠計算</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-stone-500">
                    明日の予定がまだありません。下の「明日の個別予定を追加」から登録するか、「1週間のルーティン（時間割）」に登録してください。
                  </div>
                )}
              </div>

              {/* 明日の個別予定登録フォーム */}
              {showTomorrowForm ? (
                <form
                  onSubmit={handleAddTomorrowSchedule}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                    <span className="text-xs font-bold text-stone-900">
                      明日の個別予定をセット (前日入力)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTomorrowForm(false)}
                      className="text-[11px] text-stone-500 hover:text-stone-800"
                    >
                      キャンセル
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      予定名（例: 1限休講のため2限から、朝バイト、ゼミ発表）
                    </label>
                    <input
                      type="text"
                      placeholder="予定名を入力"
                      value={tomorrowTitle}
                      onChange={(e) => setTomorrowTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-amber-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        開始時刻（必着）
                      </label>
                      <input
                        type="time"
                        value={tomorrowTime}
                        onChange={(e) => setTomorrowTime(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-amber-600 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        場所・教室
                      </label>
                      <input
                        type="text"
                        placeholder="例: 講義棟 201"
                        value={tomorrowLocation}
                        onChange={(e) => setTomorrowLocation(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-stone-600 mb-1">
                        <span>身支度時間</span>
                        <span className="font-mono text-amber-700 font-bold">{tomorrowPrep}分</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="90"
                        step="5"
                        value={tomorrowPrep}
                        onChange={(e) => setTomorrowPrep(Number(e.target.value))}
                        className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-stone-600 mb-1">
                        <span>移動時間</span>
                        <span className="font-mono text-amber-700 font-bold">{tomorrowTransit}分</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        step="5"
                        value={tomorrowTransit}
                        onChange={(e) => setTomorrowTransit(Number(e.target.value))}
                        className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition cursor-pointer"
                    >
                      明日の予定に登録
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTomorrowForm(true)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>明日の個別予定を追加・上書きする</span>
                </button>
              )}

              {/* 明日の登録済み予定一覧 */}
              <div>
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  明日の個別予定一覧
                </div>
                {tomorrowCustomSchedules.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-400">
                    明日の個別登録はありません（時間割ルーティンが適用されます）。
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tomorrowCustomSchedules.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-white border border-stone-200 flex items-center justify-between shadow-2xs"
                      >
                        <div>
                          <div className="text-xs font-bold text-stone-900">{item.title}</div>
                          <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                            {item.time} 開始 • {item.location || '場所未指定'} (身支度 {item.prepMinutes}分 / 移動 {item.transitMinutes}分)
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteSchedule(item.id)}
                          className="p-1.5 text-stone-300 hover:text-rose-600 rounded-lg transition"
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              タブ②: 1週間のルーティン（大学の時間割＆スクショ読み込み）
          ======================================================== */}
          {activeTab === 'weekly' && (
            <div className="space-y-4">
              {/* スクショ読み込みバー */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold">時間割のスクショからAI自動解析</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono">
                    Gemini 3.8 Flash
                  </span>
                </div>

                <p className="text-[11px] text-stone-300 leading-relaxed">
                  大学のポータル画面や履修アプリの時間割表スクショを読み込むと、月〜金の講義名・時限・教室・時間を自動抽出し、週間ルーティンに一括登録します。
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzingImage}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAnalyzingImage ? '画像をAI解析中...' : 'スクショ画像をアップロード'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplySampleTimetable}
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition cursor-pointer"
                  >
                    大学標準サンプルを適用
                  </button>
                </div>

                {imageAnalysisError && (
                  <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-xl border border-rose-800">
                    {imageAnalysisError}
                  </div>
                )}

                {/* AI解析プレビューモーダル / バナー */}
                {analyzedPreviewItems && (
                  <div className="p-3 bg-white text-stone-900 rounded-2xl space-y-2 mt-2">
                    <div className="flex justify-between items-center text-xs font-bold text-stone-800">
                      <span>解析成功: {analyzedPreviewItems.length} コマの講義を検出</span>
                      <button
                        type="button"
                        onClick={handleApplyAnalyzedItems}
                        className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700"
                      >
                        時間割に反映する
                      </button>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] text-stone-600">
                      {analyzedPreviewItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between border-b border-stone-100 py-0.5">
                          <span>
                            {item.dayOfWeek}曜 {item.period}: <strong>{item.subject}</strong>
                          </span>
                          <span className="text-stone-400 font-mono">{item.startTime}〜</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 大学の時間割グリッド表 */}
              <div className="overflow-x-auto pb-2">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200">
                      <th className="p-2 text-stone-500 font-medium text-[11px] w-14">時限</th>
                      {DAYS.map((day) => (
                        <th key={day} className="p-2 font-bold text-stone-800 text-center">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((period) => (
                      <tr key={period.period} className="border-b border-stone-100 hover:bg-stone-50/50">
                        {/* 時限ラベル */}
                        <td className="p-2 text-center text-stone-500 bg-stone-50/80 border-r border-stone-100">
                          <div className="font-bold text-stone-800 text-[11px]">{period.period}</div>
                          <div className="text-[9px] font-mono text-stone-400">{period.startTime}</div>
                        </td>

                        {/* 各曜日のマス */}
                        {DAYS.map((day) => {
                          const slot = weeklySlots.find(
                            (s) => s.dayOfWeek === day && s.period === period.period
                          );
                          return (
                            <td
                              key={day}
                              onClick={() =>
                                handleCellClick(day, period.period, period.startTime, period.endTime)
                              }
                              className={`p-1.5 border border-stone-100 text-center transition cursor-pointer min-w-[70px] h-[64px] align-top ${
                                slot
                                  ? 'bg-amber-50/70 hover:bg-amber-100/70 text-stone-900'
                                  : 'hover:bg-stone-100/60 text-stone-300'
                              }`}
                            >
                              {slot ? (
                                <div className="h-full flex flex-col justify-between text-left">
                                  <div className="font-bold text-[11px] line-clamp-2 text-amber-950 leading-tight">
                                    {slot.subject}
                                  </div>
                                  {slot.location && (
                                    <div className="text-[9px] text-stone-500 truncate mt-0.5">
                                      {slot.location}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center text-stone-300 text-[10px]">
                                  +
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-stone-400 text-right">
                ※ 各マス目をタップして講義の追加・変更・削除ができます
              </p>
            </div>
          )}
        </div>

        {/* コマ編集モーダル */}
        {editingSlot && (
          <div className="fixed inset-0 z-[70] bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-stone-200 space-y-3">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <span className="text-xs font-bold text-stone-900">
                  {editingSlot.day}曜日 {editingSlot.period} の講義設定
                </span>
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="text-stone-400 hover:text-stone-800 text-xs"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">講義名（空欄で削除）</label>
                <input
                  type="text"
                  placeholder="例: マクロ経済学"
                  defaultValue={editingSlot.subject}
                  id="modal-subject"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">教室・場所</label>
                <input
                  type="text"
                  placeholder="例: 講義棟 201"
                  defaultValue={editingSlot.location}
                  id="modal-location"
                  className="w-full text-xs p-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex justify-between">
                {editingSlot.subject && (
                  <button
                    type="button"
                    onClick={() => handleSaveSlot('', '')}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    コマを削除
                  </button>
                )}
                <div className="flex space-x-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-lg"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const subj = (document.getElementById('modal-subject') as HTMLInputElement)?.value;
                      const loc = (document.getElementById('modal-location') as HTMLInputElement)?.value;
                      handleSaveSlot(subj, loc);
                    }}
                    className="px-4 py-1.5 text-xs bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition cursor-pointer"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};
