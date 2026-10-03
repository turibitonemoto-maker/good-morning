import React, { useState } from 'react';
import {
  SlidersVertical,
  CodeXml,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CloudRain,
  Cloud,
  CloudSnow,
  CloudLightning,
  Clock,
  Sparkles,
  Check,
  RotateCcw,
  Palette,
  ShieldAlert,
  Activity,
  ChevronRight,
  Database,
  Trash2,
  Smartphone,
  Download,
  X,
} from 'lucide-react';
import { SwipeWeight, TimePresetId, WeatherType, AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 一般設定
  appSettings: AppSettings;
  onUpdateAppSettings: (newSettings: Partial<AppSettings>) => void;
  // PWA & Android インストール
  onInstallApp: () => void;
  onOpenQrModal: () => void;
  isAppInstalled: boolean;
  hasInstallPrompt: boolean;
  // 開発者モード関連
  isDeveloperMode: boolean;
  onToggleDeveloperMode: (val: boolean) => void;
  // デバッグ項目: ダミーデータ
  onInjectDummyData: () => void;
  onClearData: () => void;
  // デバッグ項目: 天気
  weather: WeatherType;
  onChangeWeather: (w: WeatherType) => void;
  // デバッグ項目: 時間帯・壁紙
  timeMode: 'auto' | 'manual';
  activeHour: number;
  activePresetKey: TimePresetId;
  onChangeTimeMode: (mode: 'auto' | 'manual') => void;
  onChangeManualHour: (hour: number) => void;
  onSelectTimePreset: (id: TimePresetId) => void;
  onResetToRealTime: () => void;
  // デバッグ項目: スワイプ物理
  swipeWeight: SwipeWeight;
  onChangeSwipeWeight: (w: SwipeWeight) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appSettings,
  onUpdateAppSettings,
  onInstallApp,
  onOpenQrModal,
  isAppInstalled,
  hasInstallPrompt,
  isDeveloperMode,
  onToggleDeveloperMode,
  onInjectDummyData,
  onClearData,
  weather,
  onChangeWeather,
  timeMode,
  activeHour,
  activePresetKey,
  onChangeTimeMode,
  onChangeManualHour,
  onSelectTimePreset,
  onResetToRealTime,
  swipeWeight,
  onChangeSwipeWeight,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'developer'>('general');
  const [devSubTab, setDevSubTab] = useState<'data' | 'weather' | 'wallpaper' | 'physics' | 'hud'>('data');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-stone-100 text-stone-800">
              <SlidersVertical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">設定</h3>
              <p className="text-[11px] text-stone-500">基本動作および環境設定</p>
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

        {/* トップタブバー：基本設定 ⇄ 開発者モード */}
        <div className="flex space-x-1 mt-3 bg-stone-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>基本設定</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('developer')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'developer'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <CodeXml className="w-3.5 h-3.5" />
            <span>開発者モード (デバッグ)</span>
            {isDeveloperMode && (
              <span className="w-2 h-2 rounded-full bg-amber-200 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="overflow-y-auto mt-4 space-y-4 pr-1 flex-1">
          {/* ========================================================
              基本設定 (一般ユーザー向け)
          ======================================================== */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Android / スマホ向けホーム画面追加 (PWA) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-100 space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-950">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>Android アプリとしてホーム画面に追加</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  ブラウザのURLバーや枠線を隠し、Androidのネイティブアプリのような全画面で軽快に動作します。
                </p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={onInstallApp}
                    className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {isAppInstalled
                        ? 'アプリインストール済み'
                        : hasInstallPrompt
                        ? 'ホーム画面に追加'
                        : 'アプリ追加'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenQrModal}
                    className="py-2.5 px-3.5 bg-white hover:bg-stone-100 text-indigo-950 border border-indigo-200 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>QRで開く</span>
                  </button>
                </div>
              </div>

              {/* デフォルトの身支度時間 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-stone-800">標準の身支度時間</span>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {appSettings.prepTimeMinutes} 分
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mb-2 leading-relaxed">
                  起床してから家を出るまでにかかる標準時間です。予定追加時の初期値として使用されます。
                </p>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={appSettings.prepTimeMinutes}
                  onChange={(e) =>
                    onUpdateAppSettings({ prepTimeMinutes: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-1">
                  <span>15分</span>
                  <span>45分</span>
                  <span>90分</span>
                </div>
              </div>

              {/* デフォルトの移動・徒歩時間 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-stone-800">駅・バス停までの標準徒歩時間</span>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {appSettings.toStationMinutes} 分
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mb-2 leading-relaxed">
                  自宅から最寄りの駅やバス停までの移動時間です。
                </p>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={appSettings.toStationMinutes}
                  onChange={(e) =>
                    onUpdateAppSettings({ toStationMinutes: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              {/* 出発地・目的地 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="text-xs font-bold text-stone-800">登録拠点</div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">出発地</label>
                  <input
                    type="text"
                    value={appSettings.origin}
                    onChange={(e) => onUpdateAppSettings({ origin: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    主な目的地（大学／キャンパス）
                  </label>
                  <input
                    type="text"
                    value={appSettings.destination}
                    onChange={(e) => onUpdateAppSettings({ destination: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* 開発者モードへの導線バナー */}
              <div
                onClick={() => setActiveTab('developer')}
                className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <CodeXml className="w-4 h-4 text-amber-700" />
                  <div>
                    <div className="text-xs font-bold text-stone-900">開発者モード（デバッグ機能）</div>
                    <div className="text-[10px] text-stone-500">
                      ダミーデータ投入・天気・壁紙時間帯・スワイプ抵抗の調整
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
            </div>
          )}

          {/* ========================================================
              開発者モード (デバッグ機能の集約欄)
          ======================================================== */}
          {activeTab === 'developer' && (
            <div className="space-y-4">
              {/* 開発者モード メイントグル */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center space-x-2">
                    <CodeXml className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold">開発者モード（デバッグ有効化）</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1">
                    {isDeveloperMode
                      ? '有効: テスト用ダミーデータ・画面①②番号・PHYSICS HUDが有効中'
                      : '無効: 通常モード（余計なダミーデータやデバッグ表示なし）'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleDeveloperMode(!isDeveloperMode)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    isDeveloperMode ? 'bg-amber-500 justify-end' : 'bg-stone-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* デバッグ機能サブタブ */}
              <div className="flex space-x-1 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDevSubTab('data')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    devSubTab === 'data'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  ダミーデータ
                </button>
                <button
                  type="button"
                  onClick={() => setDevSubTab('weather')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    devSubTab === 'weather'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  天気効果
                </button>
                <button
                  type="button"
                  onClick={() => setDevSubTab('wallpaper')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    devSubTab === 'wallpaper'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  時間帯
                </button>
                <button
                  type="button"
                  onClick={() => setDevSubTab('physics')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    devSubTab === 'physics'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  重み抵抗
                </button>
                <button
                  type="button"
                  onClick={() => setDevSubTab('hud')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    devSubTab === 'hud'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  画面番号
                </button>
              </div>

              {/* --- サブ1: ダミーデータ管理 --- */}
              {devSubTab === 'data' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-stone-500">
                    開発・デザイン確認用のサンプルデータ（時間割・睡眠記録・明日の予定）を一括管理します。
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                      <Database className="w-4 h-4 text-amber-700" />
                      <span>テスト用ダミーデータの即時投入</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      1週間の大学時間割（月〜金・9科目）、直近の睡眠ログ（3日分）、今日・明日の予定＆逆算起床アラートを一括で流し込みます。
                    </p>
                    <div className="pt-1 flex space-x-2">
                      <button
                        type="button"
                        onClick={onInjectDummyData}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>ダミーデータを投入する</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-stone-800">
                      <Trash2 className="w-4 h-4 text-stone-600" />
                      <span>本番初期状態にリセット（全データを空にする）</span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      投入したダミーデータをすべて消去し、初回起動時と同じクリーンな状態（未登録状態）に戻します。
                    </p>
                    <div className="pt-1 flex space-x-2">
                      <button
                        type="button"
                        onClick={onClearData}
                        className="px-4 py-2 bg-white hover:bg-stone-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5"
                      >
                        <span>データを全消去（空にする）</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- サブ2: 天気シミュレーター --- */}
              {devSubTab === 'weather' && (
                <div className="space-y-2.5">
                  <div className="text-[11px] text-stone-500">
                    天候エフェクト（太陽光線・雨粒・雲・雪結晶・稲妻）を強制シミュレーションします。
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: 'sunny', name: '晴れ', icon: Sun, desc: '太陽光線・木漏れ日' },
                      { key: 'rainy', name: '雨', icon: CloudRain, desc: '穏やかな雨粒と雨霞' },
                      { key: 'cloudy', name: '曇り', icon: Cloud, desc: 'ゆっくり流れる層雲' },
                      { key: 'snowy', name: '雪', icon: CloudSnow, desc: '舞い落ちる粉雪結晶' },
                      { key: 'thunder', name: '雷雨', icon: CloudLightning, desc: '豪雨と稲妻フラッシュ' },
                    ].map((item) => {
                      const IconComp = item.icon;
                      const isSelected = weather === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => onChangeWeather(item.key as WeatherType)}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'border-sky-600 bg-sky-50 font-bold text-stone-900 shadow-xs'
                              : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-xl ${
                                isSelected ? 'bg-sky-600 text-white' : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold">{item.name}</div>
                              <div className="text-[10px] text-stone-500 mt-0.5">{item.desc}</div>
                            </div>
                          </div>
                          {isSelected && <span className="text-sky-600 text-xs font-mono font-bold">● 現在選択中</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- サブ3: 時間帯・壁紙シミュレーター --- */}
              {devSubTab === 'wallpaper' && (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-stone-50 border border-stone-200">
                    <div>
                      <div className="text-xs font-bold text-stone-800">
                        {timeMode === 'auto' ? '🕒 リアルタイム自動連動' : '🎨 手動タイムシミュレーター'}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {timeMode === 'auto'
                          ? '端末の現在時刻に合わせて色味が自動変化中'
                          : '手動テスト中（時刻を自由に変更可能）'}
                      </div>
                    </div>
                    {timeMode === 'manual' && (
                      <button
                        type="button"
                        onClick={onResetToRealTime}
                        className="px-3 py-1 rounded-full bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800 transition cursor-pointer"
                      >
                        実時間に戻す
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'morning', name: '朝・黎明', icon: Sunrise, range: '05:00 - 10:59' },
                      { key: 'day', name: '昼・快晴', icon: Sun, range: '11:00 - 15:59' },
                      { key: 'sunset', name: '夕方・黄昏', icon: Sunset, range: '16:00 - 18:59' },
                      { key: 'night', name: '夜・星空', icon: Moon, range: '19:00 - 04:59' },
                    ].map((p) => {
                      const IconComp = p.icon;
                      const isSelected = activePresetKey === p.key;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => onSelectTimePreset(p.key as TimePresetId)}
                          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                            isSelected
                              ? 'border-amber-600 bg-amber-50/80 shadow-xs'
                              : 'border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <IconComp
                              className={`w-4 h-4 ${isSelected ? 'text-amber-700' : 'text-stone-600'}`}
                            />
                            <span className="text-xs font-bold text-stone-900">{p.name}</span>
                          </div>
                          <div className="text-[10px] font-mono text-stone-400 mt-1">{p.range}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* 24時間スライダー */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-stone-800">24時間スライダー</span>
                      <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {activeHour}:00 頃
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="23"
                      step="1"
                      value={activeHour}
                      onChange={(e) => {
                        onChangeTimeMode('manual');
                        onChangeManualHour(parseInt(e.target.value, 10));
                      }}
                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>
                </div>
              )}

              {/* --- サブ4: スワイプ重み抵抗 --- */}
              {devSubTab === 'physics' && (
                <div className="space-y-2.5">
                  <div className="text-[11px] text-stone-500">
                    画面ドラッグ時の物理ダンパー（非線形抵抗）の強度を調整します。
                  </div>

                  {[
                    { key: 'normal', name: '標準（かなりずっしり）', factor: '0.2x 係数' },
                    { key: 'heavy', name: '強（推奨：完全な重量感）', factor: '0.12x 係数' },
                    { key: 'extraHeavy', name: '超重量（極めて強い抵抗）', factor: '0.06x 係数' },
                  ].map((w) => {
                    const isSelected = swipeWeight === w.key;
                    return (
                      <button
                        key={w.key}
                        type="button"
                        onClick={() => onChangeSwipeWeight(w.key as SwipeWeight)}
                        className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-stone-900 bg-stone-50 font-bold text-stone-900 shadow-xs'
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{w.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5">{w.factor}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-stone-900" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* --- サブ5: 画面番号 & HUD --- */}
              {devSubTab === 'hud' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-stone-500">
                    開発者・設計確認用のオーバーレイ表示を制御します。
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-900">①②画面番号・ガイドの表示</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        画面①・画面②の中央に巨大な識別番号を表示します
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                        isDeveloperMode
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isDeveloperMode ? '表示中 (ON)' : '非表示 (OFF)'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-900">PHYSICS HUD（左上メーター）</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        リアルタイムのドラッグ距離・ダンパー抵抗値を表示します
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                        isDeveloperMode
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isDeveloperMode ? '表示中 (ON)' : '非表示 (OFF)'}
                    </span>
                  </div>
                </div>
              )}
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
