import React, { useState } from 'react';
import {
  Moon,
  Plus,
  Trash2,
  Bed,
  Sun,
  Clock,
  Sparkles,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  Tag,
  BarChart3,
  Calendar,
  CheckCircle2,
  X,
  Zap,
} from 'lucide-react';
import { SleepLog } from '../types';

interface SleepManagerProps {
  logs: SleepLog[];
  onAddLog: (log: Omit<SleepLog, 'id'>) => void;
  onDeleteLog: (id: string) => void;
  onClose: () => void;
}

const QUICK_TAGS = [
  '🛁 湯船に入った',
  '📱 寝る前スマホなし',
  '☕ カフェイン控えめ',
  '🧘 ストレッチ',
  '🌙 遮光・静寂',
  '🍺 飲酒あり',
  '📚 深夜まで勉強',
];

export const SleepManager: React.FC<SleepManagerProps> = ({
  logs,
  onAddLog,
  onDeleteLog,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');

  // フォーム用入力ステート
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [phoneOffTime, setPhoneOffTime] = useState('23:30');
  const [wakeUpTime, setWakeUpTime] = useState('07:15');
  const [mood, setMood] = useState<'スッキリ' | '普通' | 'だるい' | '寝不足'>('スッキリ');
  const [wakeCount, setWakeCount] = useState<number>(0);
  const [fatigueScore, setFatigueScore] = useState<number>(85);
  const [selectedTags, setSelectedTags] = useState<string[]>(['🛁 湯船に入った']);
  const [note, setNote] = useState('');

  // 睡眠時間の自動計算 (就寝〜起床)
  const calculateDuration = (start: string, end: string): number => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diffMinutes = endH * 60 + endM - (startH * 60 + startM);
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // 日付跨ぎ
    }
    return Math.round((diffMinutes / 60) * 10) / 10;
  };

  const calculatedHours = calculateDuration(phoneOffTime, wakeUpTime);

  // 現在時刻を就寝時刻としてセット
  const setNowAsPhoneOff = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setPhoneOffTime(`${hh}:${mm}`);
  };

  // 現在時刻を起床時刻としてセット
  const setNowAsWakeUp = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setWakeUpTime(`${hh}:${mm}`);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog({
      date,
      phoneOffTime,
      wakeUpTime,
      sleepHours: calculatedHours,
      fatigueScore,
      mood,
      wakeCount,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      note: note.trim() || undefined,
    });
    setNote('');
    setActiveTab('history');
  };

  // 統計値の計算
  const avgSleepHours = logs.length
    ? (logs.reduce((acc, curr) => acc + curr.sleepHours, 0) / logs.length).toFixed(1)
    : '7.5';
  const latestLog = logs[0];

  return (
    <div className="fixed inset-0 z-[60] bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-700">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">睡眠データ記録</h3>
              <p className="text-[11px] text-stone-500">就寝・起床リズムとリカバリー管理</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* トップタブ：睡眠を記録する ⇄ 睡眠履歴・統計 */}
        <div className="flex space-x-1 mt-3 bg-stone-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('record')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'record'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>睡眠を記録する (入力)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>睡眠履歴・分析 ({logs.length}件)</span>
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="overflow-y-auto mt-4 space-y-4 pr-1 flex-1">
          {/* ========================================================
              タブ①: 睡眠を記録する (入力フォーム)
          ======================================================== */}
          {activeTab === 'record' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* クイック現在時刻セットボタン */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={setNowAsPhoneOff}
                  className="p-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-950 flex items-center justify-center space-x-1.5 text-xs font-bold transition cursor-pointer"
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-700" />
                  <span>今スマホを置いた（就寝）</span>
                </button>

                <button
                  type="button"
                  onClick={setNowAsWakeUp}
                  className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-950 flex items-center justify-center space-x-1.5 text-xs font-bold transition cursor-pointer"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-700" />
                  <span>今起きた！（起床）</span>
                </button>
              </div>

              {/* 日付 ＆ 睡眠時間プレビュー */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      対象日
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-indigo-600 font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <span className="text-[11px] font-medium text-stone-600 mb-1">
                      実質睡眠時間（自動計算）
                    </span>
                    <div className="text-sm font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-center font-mono">
                      {calculatedHours} 時間
                      <span className="text-[10px] text-stone-500 font-normal ml-1">
                        (目標7.5h)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 就寝時刻 ＆ 起床時刻 */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-200/80">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center space-x-1">
                      <Bed className="w-3 h-3 text-indigo-600" />
                      <span>就寝（スマホを置いた時間）</span>
                    </label>
                    <input
                      type="time"
                      value={phoneOffTime}
                      onChange={(e) => setPhoneOffTime(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-indigo-600 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center space-x-1">
                      <Sun className="w-3 h-3 text-amber-600" />
                      <span>起床時刻</span>
                    </label>
                    <input
                      type="time"
                      value={wakeUpTime}
                      onChange={(e) => setWakeUpTime(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-indigo-600 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 朝の目覚め・コンディション */}
              <div>
                <label className="block text-[11px] font-bold text-stone-800 mb-1.5">
                  起床時のコンディション
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'スッキリ', label: 'スッキリ', icon: Smile, color: 'emerald' },
                    { key: '普通', label: '普通', icon: Meh, color: 'blue' },
                    { key: 'だるい', label: 'だるい', icon: Frown, color: 'amber' },
                    { key: '寝不足', label: '寝不足', icon: AlertTriangle, color: 'rose' },
                  ].map((m) => {
                    const isSelected = mood === m.key;
                    const IconComp = m.icon;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMood(m.key as any)}
                        className={`py-2 px-1.5 rounded-2xl text-xs font-bold border flex flex-col items-center justify-center transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <IconComp className="w-4 h-4 mb-0.5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 中途覚醒（途中で目が覚めた回数） */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-stone-800">途中で目が覚めた回数</span>
                  <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {wakeCount === 0 ? '朝までぐっすり (0回)' : `${wakeCount} 回`}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {[0, 1, 2, 3].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setWakeCount(count)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                        wakeCount === count
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {count === 0 ? '0回' : `${count}回`}
                    </button>
                  ))}
                </div>
              </div>

              {/* リカバリースコア */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-stone-800">回復・リカバリースコア</span>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                    {fatigueScore} 点
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={fatigueScore}
                  onChange={(e) => setFatigueScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-1">
                  <span>疲労強 (30)</span>
                  <span>普通 (70)</span>
                  <span>完全回復 (100)</span>
                </div>
              </div>

              {/* クイック就寝前タグ */}
              <div>
                <label className="block text-[11px] font-bold text-stone-800 mb-1.5 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-stone-500" />
                  <span>就寝前の行動・環境タグ（タップで選択）</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* メモ */}
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  メモ (任意)
                </label>
                <input
                  type="text"
                  placeholder="例: 早めに寝てスッキリ目覚めた、少しエアコンが寒かった"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* 登録ボタン */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>この睡眠データを記録する</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              タブ②: 睡眠履歴・データ分析
          ======================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* サマリーカード */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col items-center text-center">
                  <span className="text-[10px] text-indigo-700 font-medium">直近の睡眠</span>
                  <span className="text-xl font-bold text-indigo-950 mt-0.5">
                    {latestLog ? `${latestLog.sleepHours}h` : '-'}
                  </span>
                  <span className="text-[10px] text-indigo-600 mt-0.5">
                    {latestLog ? latestLog.mood : '未記録'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center text-center">
                  <span className="text-[10px] text-stone-500 font-medium">平均睡眠</span>
                  <span className="text-xl font-bold text-stone-900 mt-0.5">
                    {logs.length > 0 ? `${avgSleepHours}h` : '-'}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">目標 7.5h</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center text-center">
                  <span className="text-[10px] text-amber-700 font-medium">平均スコア</span>
                  <span className="text-xl font-bold text-amber-950 mt-0.5">
                    {latestLog ? `${latestLog.fatigueScore}点` : '-'}
                  </span>
                  <span className="text-[10px] text-amber-700 mt-0.5 font-medium">良好</span>
                </div>
              </div>

              {/* 新規記録へ戻るボタン */}
              <button
                type="button"
                onClick={() => setActiveTab('record')}
                className="w-full py-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold hover:bg-indigo-100 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>新しい睡眠データを入力する</span>
              </button>

              {/* 履歴リスト */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  登録済みの睡眠ログ
                </div>
                {logs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400 border border-stone-200 rounded-2xl bg-stone-50">
                    睡眠記録がまだありません。「新しい睡眠データを入力する」から昨夜の睡眠を記録してみましょう。
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition flex items-start justify-between shadow-2xs"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 mt-0.5">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-stone-900">{log.date}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                log.mood === 'スッキリ'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.mood === '寝不足'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {log.mood}
                            </span>
                            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {log.sleepHours}時間
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-500 font-mono mt-1">
                            {log.phoneOffTime} 就寝 → {log.wakeUpTime} 起床
                            {log.wakeCount !== undefined && log.wakeCount > 0 && (
                              <span className="ml-1 text-stone-400">
                                (中途覚醒 {log.wakeCount}回)
                              </span>
                            )}
                          </div>

                          {log.tags && log.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {log.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {log.note && (
                            <div className="text-[11px] text-stone-600 mt-1 italic">
                              {log.note}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-mono text-indigo-900 bg-indigo-50 px-2 py-1 rounded-xl">
                          {log.fatigueScore}点
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 text-stone-300 hover:text-rose-600 rounded-lg transition"
                          title="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
