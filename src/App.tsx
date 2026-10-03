import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  SlidersVertical,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CodeXml,
  Clock,
  Calendar,
  Bed,
  CloudRain,
  Cloud,
  CloudSnow,
  CloudLightning,
  Layers,
  ArrowRight,
  Smartphone,
  Download,
  QrCode,
  Plus,
} from 'lucide-react';
import {
  ScreenState,
  SwipeWeight,
  TimePresetId,
  WeatherType,
  SleepLog,
  ScheduleItem,
  WeeklyRoutineSlot,
  AppSettings,
} from './types';
import { WeatherOverlay } from './components/WeatherOverlay';
import { SleepManager } from './components/SleepManager';
import { ScheduleManager } from './components/ScheduleManager';
import { SettingsModal } from './components/SettingsModal';
import { QrCodeModal } from './components/QrCodeModal';

interface TimePresetConfig {
  id: TimePresetId;
  name: string;
  subTitle: string;
  timeRange: string;
  representativeHour: number;
  icon: React.ComponentType<{ className?: string }>;
  accentBadge: string;
  screen1: {
    bgContainer: string;
    imgFilter: string;
    gradientOverlay: string;
    glowColor: string;
    skyLabel: string;
  };
  screen2: {
    bgColor: string;
    imgFilter: string;
    overlayGradient: string;
    badgeClass: string;
    badgeLabel: string;
    textColor: string;
  };
}

const TIME_PRESETS: Record<TimePresetId, TimePresetConfig> = {
  morning: {
    id: 'morning',
    name: '朝・黎明',
    subTitle: '爽やかな朝陽と澄んだ光',
    timeRange: '05:00 - 10:59',
    representativeHour: 7,
    icon: Sunrise,
    accentBadge: 'bg-amber-100 text-amber-900 border-amber-300',
    screen1: {
      bgContainer: '#132135',
      imgFilter: 'brightness(1.08) saturate(1.12) contrast(1.04) hue-rotate(-22deg)',
      gradientOverlay:
        'linear-gradient(to bottom, rgba(56, 189, 248, 0.24), rgba(254, 240, 138, 0.16), rgba(15, 23, 42, 0.45))',
      glowColor: 'rgba(254, 243, 199, 0.28)',
      skyLabel: '朝の澄んだ光',
    },
    screen2: {
      bgColor: '#e2f1fd',
      imgFilter: 'hue-rotate(-25deg) brightness(1.06) saturate(1.15)',
      overlayGradient: 'from-sky-300/35 via-amber-100/25 to-sky-200/35',
      badgeClass: 'bg-sky-100/90 text-sky-900 border-sky-300/80',
      badgeLabel: '朝の空',
      textColor: 'text-sky-950',
    },
  },
  day: {
    id: 'day',
    name: '昼・快晴',
    subTitle: '青々とした澄んだ青空と豊かな緑',
    timeRange: '11:00 - 15:59',
    representativeHour: 13,
    icon: Sun,
    accentBadge: 'bg-sky-100 text-sky-900 border-sky-300',
    screen1: {
      bgContainer: '#041f3d',
      imgFilter: 'brightness(1.08) saturate(1.58) contrast(1.14) hue-rotate(180deg)',
      gradientOverlay:
        'linear-gradient(to bottom, rgba(2, 132, 199, 0.44), rgba(56, 189, 248, 0.24), rgba(13, 148, 136, 0.18), rgba(4, 31, 61, 0.52))',
      glowColor: 'rgba(56, 189, 248, 0.55)',
      skyLabel: '青々とした真昼の快晴',
    },
    screen2: {
      bgColor: '#a0e1fd',
      imgFilter: 'hue-rotate(180deg) brightness(1.02) saturate(1.6)',
      overlayGradient: 'from-sky-500/45 via-cyan-300/35 to-blue-400/45',
      badgeClass: 'bg-sky-100/90 text-sky-900 border-sky-300/80',
      badgeLabel: '澄んだ青空',
      textColor: 'text-sky-950',
    },
  },
  sunset: {
    id: 'sunset',
    name: '夕方・黄昏',
    subTitle: '暖かな茜空とアプリコットの夕暮れ（原画）',
    timeRange: '16:00 - 18:59',
    representativeHour: 17,
    icon: Sunset,
    accentBadge: 'bg-amber-100 text-amber-900 border-amber-300',
    screen1: {
      bgContainer: '#1c1917',
      imgFilter: 'none',
      gradientOverlay:
        'linear-gradient(to bottom, rgba(28, 25, 23, 0.12), transparent, rgba(12, 10, 9, 0.38))',
      glowColor: 'rgba(251, 191, 36, 0.2)',
      skyLabel: '茜空の夕暮れ',
    },
    screen2: {
      bgColor: '#fbe7da',
      imgFilter: 'none',
      overlayGradient: 'from-transparent via-amber-100/15 to-amber-200/25',
      badgeClass: 'bg-amber-100/90 text-amber-900 border-amber-300/60',
      badgeLabel: '黄昏の空',
      textColor: 'text-amber-950',
    },
  },
  night: {
    id: 'night',
    name: '夜・星空',
    subTitle: '静寂のインディゴと瞬く月星',
    timeRange: '19:00 - 04:59',
    representativeHour: 22,
    icon: Moon,
    accentBadge: 'bg-indigo-950 text-indigo-200 border-indigo-700',
    screen1: {
      bgContainer: '#050913',
      imgFilter: 'brightness(0.62) saturate(0.85) contrast(1.22) hue-rotate(54deg)',
      gradientOverlay:
        'linear-gradient(to bottom, rgba(15, 23, 42, 0.72), rgba(30, 27, 75, 0.5), rgba(2, 6, 23, 0.88))',
      glowColor: 'rgba(165, 180, 252, 0.18)',
      skyLabel: '静寂の月夜',
    },
    screen2: {
      bgColor: '#090f1d',
      imgFilter: 'hue-rotate(58deg) brightness(0.46) saturate(0.92) contrast(1.3)',
      overlayGradient: 'from-slate-950/85 via-indigo-950/65 to-slate-900/85',
      badgeClass: 'bg-indigo-950/90 text-indigo-200 border-indigo-700/60',
      badgeLabel: '静寂の夜空',
      textColor: 'text-indigo-100',
    },
  },
};

const WEATHER_PRESETS: Record<
  WeatherType,
  { name: string; icon: React.ComponentType<{ className?: string }>; temp: number; desc: string }
> = {
  sunny: { name: '晴れ', icon: Sun, temp: 21, desc: '太陽光線・木漏れ日' },
  rainy: { name: '雨', icon: CloudRain, temp: 16, desc: '穏やかな雨粒と雨霞' },
  cloudy: { name: '曇り', icon: Cloud, temp: 18, desc: 'ゆっくり流れる層雲' },
  snowy: { name: '雪', icon: CloudSnow, temp: 2, desc: '静かに舞う粉雪' },
  thunder: { name: '雷雨', icon: CloudLightning, temp: 15, desc: '豪雨と稲妻フラッシュ' },
};

// 開発者モード用のダミーデータ定義
const DUMMY_SLEEP_LOGS: SleepLog[] = [
  {
    id: 'dummy-sleep-1',
    date: '2026-10-01',
    phoneOffTime: '23:30',
    wakeUpTime: '07:15',
    sleepHours: 7.8,
    fatigueScore: 88,
    mood: 'スッキリ',
    note: '適正睡眠で目覚め快適',
  },
  {
    id: 'dummy-sleep-2',
    date: '2026-09-30',
    phoneOffTime: '00:15',
    wakeUpTime: '07:30',
    sleepHours: 7.2,
    fatigueScore: 78,
    mood: '普通',
  },
  {
    id: 'dummy-sleep-3',
    date: '2026-09-29',
    phoneOffTime: '23:10',
    wakeUpTime: '07:00',
    sleepHours: 7.8,
    fatigueScore: 92,
    mood: 'スッキリ',
  },
];

const DUMMY_WEEKLY_SLOTS: WeeklyRoutineSlot[] = [
  { id: '月-1限', dayOfWeek: '月', period: '1限', startTime: '09:00', endTime: '10:30', subject: 'データサイエンス基礎', location: '講義棟 201', prepMinutes: 40, transitMinutes: 35 },
  { id: '月-3限', dayOfWeek: '月', period: '3限', startTime: '13:00', endTime: '14:30', subject: '線形代数学', location: '大講義室 A', prepMinutes: 40, transitMinutes: 35 },
  { id: '火-2限', dayOfWeek: '火', period: '2限', startTime: '10:40', endTime: '12:10', subject: '英語コミュニケーション', location: '語学棟 102', prepMinutes: 40, transitMinutes: 35 },
  { id: '火-4限', dayOfWeek: '火', period: '4限', startTime: '14:45', endTime: '16:15', subject: 'プログラミング演習', location: '情処実習室 3', prepMinutes: 40, transitMinutes: 35 },
  { id: '水-1限', dayOfWeek: '水', period: '1限', startTime: '09:00', endTime: '10:30', subject: 'ミクロ経済学', location: '講義棟 305', prepMinutes: 40, transitMinutes: 35 },
  { id: '木-1限', dayOfWeek: '木', period: '1限', startTime: '09:00', endTime: '10:30', subject: '統計学入門', location: '講義棟 201', prepMinutes: 40, transitMinutes: 35 },
  { id: '木-3限', dayOfWeek: '木', period: '3限', startTime: '13:00', endTime: '14:30', subject: 'キャリアデザイン', location: 'ホール B', prepMinutes: 40, transitMinutes: 35 },
  { id: '金-1限', dayOfWeek: '金', period: '1限', startTime: '09:00', endTime: '10:30', subject: 'アルゴリズムと論理', location: '講義棟 104', prepMinutes: 40, transitMinutes: 35 },
  { id: '金-2限', dayOfWeek: '金', period: '2限', startTime: '10:40', endTime: '12:10', subject: '情報ネットワーク', location: '講義棟 201', prepMinutes: 40, transitMinutes: 35 },
];

const DUMMY_SCHEDULES: ScheduleItem[] = [
  {
    id: 'dummy-sched-1',
    title: '1限 統計学入門',
    date: '2026-10-01',
    time: '09:00',
    location: '講義棟 201',
    prepMinutes: 40,
    transitMinutes: 35,
    isCompleted: false,
  },
  {
    id: 'dummy-sched-2',
    title: 'カフェ アルバイト',
    date: '2026-10-01',
    time: '17:00',
    location: '駅前店',
    prepMinutes: 25,
    transitMinutes: 20,
    isCompleted: false,
  },
  {
    id: 'dummy-sched-3',
    title: '1限 アルゴリズムと論理',
    date: '2026-10-02',
    time: '09:00',
    location: '講義棟 104',
    prepMinutes: 40,
    transitMinutes: 35,
    isCompleted: false,
    isCustomTomorrow: true,
  },
];

const getPresetByHour = (hour: number): TimePresetId => {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 16) return 'day';
  if (hour >= 16 && hour < 19) return 'sunset';
  return 'night';
};

const SHARED_APP_URL =
  'https://ais-pre-bgii7qmzj325qcc2z5227v-170434650603.asia-east1.run.app';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('screen1');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 公開URL（スマホからアクセス可能なURL）
  const currentAppUrl =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://ais-pre-bgii7qmzj325qcc2z5227v-170434650603.asia-east1.run.app';

  // Android & PWA インストール状態
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  // 開発者モードフラグ
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(() => {
    return localStorage.getItem('morningsync_dev_mode') === 'true';
  });

  // アプリ基本設定
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('morningsync_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      origin: '自宅',
      destination: '大学 講義棟',
      prepTimeMinutes: 40,
      toStationMinutes: 15,
      defaultDeadlineTime: '09:00',
    };
  });

  // 時間連動システム（デバッグ用）
  const [timeMode, setTimeMode] = useState<'auto' | 'manual'>('auto');
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());
  const [manualHour, setManualHour] = useState<number>(() => new Date().getHours());

  // 天気エフェクト（デバッグ用）
  const [weather, setWeather] = useState<WeatherType>(() => {
    return (localStorage.getItem('morningsync_weather') as WeatherType) || 'sunny';
  });

  // スワイプ物理重み設定（デバッグ用）
  const [swipeWeight, setSwipeWeight] = useState<SwipeWeight>(() => {
    return (localStorage.getItem('morningsync_swipe_weight') as SwipeWeight) || 'heavy';
  });

  // 実ユーザーデータ（通常モード用: 空がデフォルト）
  const [userSleepLogs, setUserSleepLogs] = useState<SleepLog[]>(() => {
    const saved = localStorage.getItem('morningsync_user_sleep_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [userWeeklySlots, setUserWeeklySlots] = useState<WeeklyRoutineSlot[]>(() => {
    const saved = localStorage.getItem('morningsync_user_weekly_slots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [userSchedules, setUserSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('morningsync_user_schedules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // 開発者モード専用のダミーデータ
  const [devSleepLogs, setDevSleepLogs] = useState<SleepLog[]>(DUMMY_SLEEP_LOGS);
  const [devWeeklySlots, setDevWeeklySlots] = useState<WeeklyRoutineSlot[]>(DUMMY_WEEKLY_SLOTS);
  const [devSchedules, setDevSchedules] = useState<ScheduleItem[]>(DUMMY_SCHEDULES);

  // 開発者モード ON の時はダミーデータ、OFF の時は実ユーザーデータを使用
  const activeSleepLogs = isDeveloperMode
    ? devSleepLogs.length > 0
      ? devSleepLogs
      : userSleepLogs
    : userSleepLogs;

  const activeWeeklySlots = isDeveloperMode
    ? devWeeklySlots.length > 0
      ? devWeeklySlots
      : userWeeklySlots
    : userWeeklySlots;

  const activeSchedules = isDeveloperMode
    ? devSchedules.length > 0
      ? devSchedules
      : userSchedules
    : userSchedules;

  // モーダル管理
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // ドラッグ状態
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragType, setDragType] = useState<'screen-transition' | 'menu-slide' | null>(null);

  const startY = useRef<number | null>(null);
  const startX = useRef<number | null>(null);
  const activePointerId = useRef<number | null>(null);
  const lastRawY = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const velocityY = useRef<number>(0);

  // Androidバイブレーションフィードバック
  const triggerVibrate = useCallback((pattern: number | number[] = 14) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  }, []);

  // PWA & Android インストールリスナー
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    triggerVibrate(18);
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('📲 アプリのインストールを開始しました！');
        setDeferredInstallPrompt(null);
      }
    } else {
      showToast('Chromeのメニュー (⋮) から「ホーム画面に追加」または「アプリをインストール」をタップしてください');
    }
  };

  // localStorage 同期
  useEffect(() => {
    localStorage.setItem('morningsync_dev_mode', String(isDeveloperMode));
  }, [isDeveloperMode]);

  useEffect(() => {
    localStorage.setItem('morningsync_weather', weather);
  }, [weather]);

  useEffect(() => {
    localStorage.setItem('morningsync_swipe_weight', swipeWeight);
  }, [swipeWeight]);

  useEffect(() => {
    localStorage.setItem('morningsync_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    localStorage.setItem('morningsync_user_sleep_logs', JSON.stringify(userSleepLogs));
  }, [userSleepLogs]);

  useEffect(() => {
    localStorage.setItem('morningsync_user_weekly_slots', JSON.stringify(userWeeklySlots));
  }, [userWeeklySlots]);

  useEffect(() => {
    localStorage.setItem('morningsync_user_schedules', JSON.stringify(userSchedules));
  }, [userSchedules]);

  // リアルタイム時計更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  const activeHour = timeMode === 'auto' ? currentHour : manualHour;
  const activePresetKey = getPresetByHour(activeHour);
  const currentPreset = TIME_PRESETS[activePresetKey];
  const CurrentWeatherIcon = WEATHER_PRESETS[weather].icon;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 開発者モードトグル
  const handleToggleDeveloperMode = (val: boolean) => {
    triggerVibrate(15);
    setIsDeveloperMode(val);
    if (val) {
      setDevSleepLogs(DUMMY_SLEEP_LOGS);
      setDevWeeklySlots(DUMMY_WEEKLY_SLOTS);
      setDevSchedules(DUMMY_SCHEDULES);
      showToast('🛠️ 開発者モード有効: テスト用ダミーデータを投入しました');
    } else {
      showToast('✨ 通常モード: ユーザーデータ画面に戻しました（ダミー非表示）');
    }
  };

  const handleInjectDummyData = () => {
    triggerVibrate(15);
    setDevSleepLogs(DUMMY_SLEEP_LOGS);
    setDevWeeklySlots(DUMMY_WEEKLY_SLOTS);
    setDevSchedules(DUMMY_SCHEDULES);
    showToast('⚡ テスト用ダミーデータ（時間割9コマ・睡眠3件・予定3件）を投入しました');
  };

  const handleClearData = () => {
    triggerVibrate(25);
    if (isDeveloperMode) {
      setDevSleepLogs([]);
      setDevWeeklySlots([]);
      setDevSchedules([]);
    }
    setUserSleepLogs([]);
    setUserWeeklySlots([]);
    setUserSchedules([]);
    showToast('🧹 全データを初期化しました（クリーンな未登録状態）');
  };

  const handleChangeWeather = (w: WeatherType) => {
    triggerVibrate(12);
    setWeather(w);
    showToast(`🌦️ 天気エフェクトを「${WEATHER_PRESETS[w].name}」に変更しました`);
  };

  const handleSelectTimePreset = (id: TimePresetId) => {
    triggerVibrate(12);
    setTimeMode('manual');
    setManualHour(TIME_PRESETS[id].representativeHour);
    showToast(`🎨 壁紙を「${TIME_PRESETS[id].name}」に変更しました`);
  };

  const handleResetToRealTime = () => {
    triggerVibrate(12);
    setTimeMode('auto');
    const h = new Date().getHours();
    setCurrentHour(h);
    setManualHour(h);
    const key = getPresetByHour(h);
    showToast(`🕒 リアルタイム連動中（現在 ${h}時頃 → ${TIME_PRESETS[key].name}）`);
  };

  const handleChangeSwipeWeight = (w: SwipeWeight) => {
    triggerVibrate(12);
    setSwipeWeight(w);
    showToast(`⚙️ スワイプ抵抗を「${w}」に設定しました`);
  };

  const handleUpdateAppSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // 睡眠ログハンドラー
  const handleAddSleepLog = (log: Omit<SleepLog, 'id'>) => {
    triggerVibrate([10, 30, 10]);
    const newLog: SleepLog = {
      ...log,
      id: Date.now().toString(),
    };
    if (isDeveloperMode) {
      setDevSleepLogs([newLog, ...devSleepLogs]);
    } else {
      setUserSleepLogs([newLog, ...userSleepLogs]);
    }
    showToast('🛏️ 睡眠ログを記録しました');
  };

  const handleDeleteSleepLog = (id: string) => {
    triggerVibrate(15);
    if (isDeveloperMode) {
      setDevSleepLogs(devSleepLogs.filter((l) => l.id !== id));
    } else {
      setUserSleepLogs(userSleepLogs.filter((l) => l.id !== id));
    }
    showToast('🗑️ 睡眠ログを削除しました');
  };

  // 予定ハンドラー
  const handleAddSchedule = (item: Omit<ScheduleItem, 'id'>) => {
    triggerVibrate([10, 30, 10]);
    const newItem: ScheduleItem = {
      ...item,
      id: Date.now().toString(),
    };
    if (isDeveloperMode) {
      setDevSchedules([...devSchedules, newItem].sort((a, b) => a.time.localeCompare(b.time)));
    } else {
      setUserSchedules([...userSchedules, newItem].sort((a, b) => a.time.localeCompare(b.time)));
    }
    showToast('📅 予定を登録しました（逆算起床を更新）');
  };

  const handleDeleteSchedule = (id: string) => {
    triggerVibrate(15);
    if (isDeveloperMode) {
      setDevSchedules(devSchedules.filter((s) => s.id !== id));
    } else {
      setUserSchedules(userSchedules.filter((s) => s.id !== id));
    }
    showToast('🗑️ 予定を削除しました');
  };

  const handleToggleSchedule = (id: string) => {
    triggerVibrate(10);
    if (isDeveloperMode) {
      setDevSchedules(
        devSchedules.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
      );
    } else {
      setUserSchedules(
        userSchedules.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
      );
    }
  };

  const handleSaveWeeklySlots = (slots: WeeklyRoutineSlot[]) => {
    triggerVibrate([10, 40, 10]);
    if (isDeveloperMode) {
      setDevWeeklySlots(slots);
    } else {
      setUserWeeklySlots(slots);
    }
    showToast('💾 1週間の大学時間割を保存しました');
  };

  // 逆算計算
  const calculateReverse = (targetTime: string, prep: number, transit: number) => {
    const [h, m] = targetTime.split(':').map(Number);
    const targetMinutes = h * 60 + m;

    let leaveMin = targetMinutes - transit - 10;
    if (leaveMin < 0) leaveMin += 24 * 60;

    let wakeMin = leaveMin - prep;
    if (wakeMin < 0) wakeMin += 24 * 60;

    let sleepMin = wakeMin - 7.5 * 60;
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

  // 今日の直近予定の計算
  const nextSchedule = activeSchedules.find((s) => !s.isCompleted);
  const nextReverse = nextSchedule
    ? calculateReverse(nextSchedule.time, nextSchedule.prepMinutes, nextSchedule.transitMinutes)
    : null;

  // 明日の予定・逆算の計算
  const todayDate = new Date();
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const tomorrowDateStr = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;
  const dayNames: Array<'日' | '月' | '火' | '水' | '木' | '金' | '土'> = ['日', '月', '火', '水', '木', '金', '土'];
  const tomorrowDayOfWeek = dayNames[tomorrowDate.getDay()];

  const tomorrowCustom = activeSchedules.find((s) => s.date === tomorrowDateStr);
  const tomorrowSlots = activeWeeklySlots
    .filter((s) => s.dayOfWeek === tomorrowDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const tomorrowTarget = tomorrowCustom
    ? {
        title: tomorrowCustom.title,
        time: tomorrowCustom.time,
        location: tomorrowCustom.location || '予定先',
        prep: tomorrowCustom.prepMinutes,
        transit: tomorrowCustom.transitMinutes,
        isCustom: true,
      }
    : tomorrowSlots[0]
    ? {
        title: `${tomorrowSlots[0].period} ${tomorrowSlots[0].subject}`,
        time: tomorrowSlots[0].startTime,
        location: tomorrowSlots[0].location || '講義棟',
        prep: tomorrowSlots[0].prepMinutes,
        transit: tomorrowSlots[0].transitMinutes,
        isCustom: false,
      }
    : null;

  const tomorrowReverse = tomorrowTarget
    ? calculateReverse(tomorrowTarget.time, tomorrowTarget.prep, tomorrowTarget.transit)
    : null;

  const latestSleep = activeSleepLogs[0];

  // スワイプ抵抗の係数
  const getWeightFactor = useCallback(() => {
    switch (swipeWeight) {
      case 'normal':
        return 0.2;
      case 'heavy':
        return 0.12;
      case 'extraHeavy':
        return 0.06;
      default:
        return 0.12;
    }
  }, [swipeWeight]);

  // 非線形ダンパー抵抗計算
  const calcDamperResistance = useCallback(
    (rawDiff: number) => {
      const factor = getWeightFactor();
      const sign = Math.sign(rawDiff);
      const absDiff = Math.abs(rawDiff);
      return sign * ((absDiff * factor) / (1 + absDiff * 0.003));
    },
    [getWeightFactor]
  );

  // ポインターイベント
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDragging) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') && !target.closest('.drag-allow')) return;

    startY.current = e.clientY;
    startX.current = e.clientX;
    lastRawY.current = 0;
    lastTime.current = performance.now();
    velocityY.current = 0;
    activePointerId.current = e.pointerId;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setIsDragging(true);
    setDragType(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || startY.current === null || startX.current === null) return;

    const diffY = e.clientY - startY.current;
    const diffX = e.clientX - startX.current;
    const now = performance.now();
    const dt = now - lastTime.current;

    if (dt > 10) {
      velocityY.current = (diffY - lastRawY.current) / dt;
      lastRawY.current = diffY;
      lastTime.current = now;
    }

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 15 && dragType === null) {
      return;
    }

    if (dragType === null && Math.abs(diffY) > 8) {
      if (currentScreen === 'screen1') {
        if (isMenuOpen) {
          if (diffY > 0) setDragType('menu-slide');
        } else {
          if (diffY > 0) setDragType('screen-transition');
          else if (diffY < 0) setDragType('menu-slide');
        }
      } else if (currentScreen === 'screen2') {
        setDragType('screen-transition');
      }
    }

    if (dragType === 'screen-transition') {
      const resisted = calcDamperResistance(diffY);
      setDragOffsetY(resisted);
    } else if (dragType === 'menu-slide') {
      if (isMenuOpen) {
        if (diffY > 0) setDragOffsetY(diffY);
      } else {
        if (diffY < 0) setDragOffsetY(diffY);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || startY.current === null) {
      setIsDragging(false);
      setDragOffsetY(0);
      setDragType(null);
      return;
    }

    try {
      if (
        activePointerId.current !== null &&
        (e.currentTarget as HTMLElement).hasPointerCapture(activePointerId.current)
      ) {
        (e.currentTarget as HTMLElement).releasePointerCapture(activePointerId.current);
      }
    } catch {
      // ignore
    }

    const rawDiffY = e.clientY - startY.current;
    const currentResisted = dragOffsetY;
    const v = velocityY.current;

    if (dragType === 'screen-transition') {
      if (currentScreen === 'screen1') {
        if (rawDiffY >= 180 && (currentResisted >= 24 || (rawDiffY >= 150 && v > 1.2))) {
          triggerVibrate(22);
          setCurrentScreen('screen2');
        }
      } else if (currentScreen === 'screen2') {
        if (rawDiffY <= -180 && (currentResisted <= -24 || (rawDiffY <= -150 && v < -1.2))) {
          triggerVibrate(22);
          setCurrentScreen('screen1');
        }
      }
    } else if (dragType === 'menu-slide') {
      if (isMenuOpen) {
        if (rawDiffY > 60 || v > 0.4) {
          triggerVibrate(12);
          setIsMenuOpen(false);
        }
      } else {
        if (rawDiffY < -50 || v < -0.4) {
          triggerVibrate(12);
          setIsMenuOpen(true);
        }
      }
    }

    startY.current = null;
    startX.current = null;
    activePointerId.current = null;
    setIsDragging(false);
    setDragOffsetY(0);
    setDragType(null);
  };

  const handlePointerCancel = () => {
    startY.current = null;
    startX.current = null;
    activePointerId.current = null;
    setIsDragging(false);
    setDragOffsetY(0);
    setDragType(null);
  };

  // キーボード & Android Back操作対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        if (currentScreen === 'screen1') {
          if (isMenuOpen) setIsMenuOpen(false);
          else setCurrentScreen('screen2');
        }
      } else if (e.key === 'ArrowUp') {
        if (currentScreen === 'screen1') {
          if (!isMenuOpen) setIsMenuOpen(true);
        } else if (currentScreen === 'screen2') {
          setCurrentScreen('screen1');
        }
      } else if (e.key === 'Escape') {
        if (isSettingsModalOpen) setIsSettingsModalOpen(false);
        else if (isSleepModalOpen) setIsSleepModalOpen(false);
        else if (isScheduleModalOpen) setIsScheduleModalOpen(false);
        else if (isMenuOpen) setIsMenuOpen(false);
        else setCurrentScreen('screen1');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, isMenuOpen, isSettingsModalOpen, isSleepModalOpen, isScheduleModalOpen]);

  const getTransitionStyle = () => {
    if (isDragging) return { transition: 'none' };
    return { transition: 'transform 820ms cubic-bezier(0.16, 1, 0.3, 1)' };
  };

  const getContainerTransform = () => {
    const basePercent = currentScreen === 'screen1' ? -50 : 0;
    if (isDragging && dragType === 'screen-transition') {
      return `translate3d(0, calc(${basePercent}% + ${dragOffsetY}px), 0)`;
    }
    return `translate3d(0, ${basePercent}%, 0)`;
  };

  const getMenuTransform = () => {
    if (isMenuOpen) {
      if (isDragging && dragType === 'menu-slide' && dragOffsetY > 0) {
        return `translate3d(-50%, ${dragOffsetY}px, 0)`;
      }
      return 'translate3d(-50%, 0, 0)';
    } else {
      if (isDragging && dragType === 'menu-slide' && dragOffsetY < 0) {
        return `translate3d(-50%, calc(100% + ${dragOffsetY}px), 0)`;
      }
      return 'translate3d(-50%, 100%, 0)';
    }
  };

  const isNightOrEvening = activePresetKey === 'sunset' || activePresetKey === 'night';

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-stone-950 font-sans text-stone-900 select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* 画面全体にかかる天候エフェクト（雨粒、舞い落ちる雪、稲妻、太陽光線） */}
      <WeatherOverlay weather={weather} />

      {/* 2画面垂直スライダーコンテナ (200%高) */}
      <div
        className="w-full h-[200%] flex flex-col will-change-transform"
        style={{ transform: getContainerTransform(), ...getTransitionStyle() }}
      >
        {/* ========================================================
            画面②：上の画面（上空・空の壁紙）
        ======================================================== */}
        <div
          className="relative w-full h-1/2 flex flex-col justify-between p-6 sm:p-10 shadow-inner border-b border-black/10 overflow-hidden transition-colors duration-1000"
          style={{ backgroundColor: currentPreset.screen2.bgColor }}
        >
          {/* 画面②の空壁紙 */}
          <img
            src="/wallpaper_screen2.jpg"
            alt="空の壁紙"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transition-all duration-1000"
            style={{ filter: currentPreset.screen2.imgFilter }}
          />
          {/* オーバーレイグラデーション */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${currentPreset.screen2.overlayGradient} pointer-events-none transition-all duration-1000`}
          />

          {/* 昼モード：青空の光彩エフェクト */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
              activePresetKey === 'day' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute top-0 inset-x-0 h-3/4 bg-gradient-to-b from-sky-400/25 via-cyan-300/15 to-transparent" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[280px] bg-sky-300/20 blur-3xl rounded-full" />
          </div>

          {/* 夜モード：星空エフェクト */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
              activePresetKey === 'night' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute top-[6%] left-[22%] w-1 h-1 rounded-full bg-sky-100 shadow-[0_0_6px_skyblue] animate-twinkle-1" />
            <div className="absolute top-[12%] right-[18%] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] animate-twinkle-2" />
            <div className="absolute top-[18%] left-[64%] w-1 h-1 rounded-full bg-indigo-200 shadow-[0_0_6px_white] animate-twinkle-3" />
            <div className="absolute top-[28%] left-[35%] w-0.5 h-0.5 rounded-full bg-white animate-twinkle-1" />
            <div className="absolute top-[42%] right-[28%] w-1 h-1 rounded-full bg-amber-100 shadow-[0_0_6px_gold] animate-twinkle-2" />
          </div>

          {/* 上部：天気 & 時間帯表示 */}
          <div className="relative z-10 flex justify-between items-center pt-2">
            <div
              className={`flex items-center space-x-2 text-xs font-medium px-3.5 py-1.5 rounded-full backdrop-blur-md border shadow-xs transition-colors duration-500 ${currentPreset.screen2.badgeClass}`}
            >
              <CurrentWeatherIcon className="w-3.5 h-3.5" />
              <span>{WEATHER_PRESETS[weather].name}</span>
              <span className="opacity-40">•</span>
              <span className="font-mono text-[11px]">{WEATHER_PRESETS[weather].temp}°C</span>
            </div>

            {isDeveloperMode && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-stone-950 font-bold text-[10px] shadow-sm">
                <CodeXml className="w-3 h-3" />
                <span>DEBUG (ダミー)</span>
              </div>
            )}
          </div>

          {/* 中央：②番号（デバッグ時）または予定＆時間割カード（通常時） */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-lg mx-auto">
            {isDeveloperMode ? (
              <div className="flex flex-col items-center">
                <span className="text-9xl sm:text-[14rem] font-light text-stone-900 tracking-tight leading-none drop-shadow-[0_2px_18px_rgba(255,255,255,0.7)]">
                  ②
                </span>
                <span className="text-xs font-mono font-bold tracking-widest text-stone-700 mt-2 bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/40">
                  SCREEN 2
                </span>
              </div>
            ) : (
              <div className="w-full space-y-2.5">
                {/* 明日の前日逆算カード */}
                {tomorrowTarget && tomorrowReverse ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerVibrate(15);
                      setIsScheduleModalOpen(true);
                    }}
                    className="p-4 rounded-3xl bg-white/45 hover:bg-white/60 transition backdrop-blur-md border border-white/60 shadow-lg cursor-pointer text-stone-900"
                  >
                    <div className="flex justify-between items-center pb-1.5 border-b border-black/10">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                        <Clock className="w-4 h-4" />
                        <span>明日 ({tomorrowDayOfWeek}) の起床＆出発逆算</span>
                      </div>
                      <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">
                        前日セット済み
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold">{tomorrowTarget.title}</div>
                        <div className="text-[11px] text-stone-600 font-mono mt-0.5">
                          {tomorrowTarget.time} 開始 • {tomorrowTarget.location}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-[10px] text-stone-500">明朝 起床目標</div>
                        <div className="text-lg font-bold text-amber-900 leading-tight">
                          {tomorrowReverse.wakeUp}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-stone-600 font-mono">
                      <span>出発目標: <strong>{tomorrowReverse.leaveHome}</strong></span>
                      <span>今夜の就寝推奨: <strong>{tomorrowReverse.targetSleep}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerVibrate(15);
                      setIsScheduleModalOpen(true);
                    }}
                    className="p-4 rounded-3xl bg-white/35 hover:bg-white/50 transition backdrop-blur-md border border-white/50 shadow-sm cursor-pointer text-stone-700 text-center"
                  >
                    <div className="text-xs font-bold text-stone-800">明日の予定はまだ設定されていません</div>
                    <div className="text-[11px] text-stone-500 mt-1">
                      タップして明日の起床目標や予定をセットできます
                    </div>
                  </div>
                )}

                {/* 1週間の大学時間割サマリーカード */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerVibrate(15);
                    setIsScheduleModalOpen(true);
                  }}
                  className="p-3.5 rounded-3xl bg-white/35 hover:bg-white/50 transition backdrop-blur-md border border-white/50 shadow-sm cursor-pointer text-stone-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-2xl bg-stone-900 text-white">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">1週間のルーティン（大学の時間割）</div>
                      <div className="text-[10px] text-stone-600 mt-0.5">
                        {activeWeeklySlots.length > 0
                          ? `登録中: ${activeWeeklySlots.length} 科目 • タップで確認`
                          : '時間割未登録 • スクショAI読み込み対応'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-500" />
                </div>
              </div>
            )}
          </div>

          {/* 下部：①に戻るガイド */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              triggerVibrate(12);
              setCurrentScreen('screen1');
            }}
            className="relative z-10 flex flex-col items-center cursor-pointer group pb-3 transition"
          >
            <ChevronDown className="w-6 h-6 text-stone-700 group-hover:text-stone-900 transition-transform group-hover:translate-y-0.5" />
            <span className="text-xs font-semibold text-stone-700 group-hover:text-stone-900 mt-1 tracking-wider">
              {isDeveloperMode ? '① に戻る' : 'メイン画面へ戻る'}
            </span>
          </div>
        </div>

        {/* ========================================================
            画面①：中央の画面（山並みと針葉樹林の壁紙）
        ======================================================== */}
        <div
          className="relative w-full h-1/2 flex flex-col justify-between p-6 sm:p-10 overflow-hidden transition-colors duration-1000"
          style={{ backgroundColor: currentPreset.screen1.bgContainer }}
        >
          {/* 画面①の山並み壁紙 */}
          <img
            src="/wallpaper_screen1.jpg"
            alt="山並みと針葉樹林の壁紙"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transition-all duration-1000"
            style={{ filter: currentPreset.screen1.imgFilter }}
          />
          {/* オーバーレイグラデーション */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-1000"
            style={{ background: currentPreset.screen1.gradientOverlay }}
          />

          {/* 光彩グロー */}
          <div
            className="absolute -top-12 -right-12 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
            style={{ background: currentPreset.screen1.glowColor }}
          />

          {/* 昼モード：澄んだ青空と深緑補正光 */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
              activePresetKey === 'day' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-sky-500/35 via-cyan-400/20 to-transparent" />
            <div className="absolute -top-10 right-4 w-80 h-80 rounded-full bg-cyan-300/30 blur-3xl pointer-events-none" />
          </div>

          {/* 夜モード：上空の星々エフェクト */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
              activePresetKey === 'night' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute top-[8%] left-[16%] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] animate-twinkle-1" />
            <div className="absolute top-[13%] right-[24%] w-1 h-1 rounded-full bg-sky-200 shadow-[0_0_6px_skyblue] animate-twinkle-2" />
            <div className="absolute top-[20%] left-[42%] w-1 h-1 rounded-full bg-indigo-100 shadow-[0_0_6px_white] animate-twinkle-3" />
            <div className="absolute top-[9%] left-[72%] w-1.5 h-1.5 rounded-full bg-amber-100 shadow-[0_0_8px_gold] animate-twinkle-1" />
            <div className="absolute top-[26%] right-[14%] w-1 h-1 rounded-full bg-white shadow-[0_0_5px_white] animate-twinkle-2" />
            <div className="absolute top-[17%] left-[28%] w-0.5 h-0.5 rounded-full bg-white animate-twinkle-3" />
            <div className="absolute top-[29%] left-[58%] w-1 h-1 rounded-full bg-cyan-100 shadow-[0_0_5px_white] animate-twinkle-1" />
          </div>

          {/* 上部：②へ行くガイド */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              triggerVibrate(12);
              setCurrentScreen('screen2');
            }}
            className="relative z-10 flex flex-col items-center cursor-pointer group pt-2 transition"
          >
            <span className="text-xs font-semibold text-white/90 group-hover:text-white mb-1 tracking-wider drop-shadow-md">
              {isDeveloperMode ? '② へ' : '上空ビュー・明日の予定へ'}
            </span>
            <ChevronUp className="w-6 h-6 text-white/80 group-hover:text-white transition-transform group-hover:-translate-y-0.5 drop-shadow-md" />
          </div>

          {/* 中央：①番号または時計・直近の予定・睡眠インフォ */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center pointer-events-none">
            {isDeveloperMode ? (
              <div className="flex flex-col items-center">
                <span className="text-9xl sm:text-[14rem] font-light text-white tracking-tight leading-none drop-shadow-[0_2px_18px_rgba(255,255,255,0.7)]">
                  ①
                </span>
                <span className="text-xs font-mono font-bold tracking-widest text-stone-200 mt-2 bg-stone-900/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/15">
                  SCREEN 1
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-white drop-shadow-lg max-w-sm w-full px-4">
                {/* 日時 & 天気バッジ */}
                <div className="flex items-center space-x-2 text-xs font-mono tracking-wider bg-stone-900/40 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md mb-2">
                  <CurrentWeatherIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>{WEATHER_PRESETS[weather].name}</span>
                  <span className="opacity-50">|</span>
                  <span>{WEATHER_PRESETS[weather].temp}°C</span>
                  <span className="opacity-50">|</span>
                  <span>
                    {String(activeHour).padStart(2, '0')}:
                    {new Date().getMinutes().toString().padStart(2, '0')}
                  </span>
                </div>

                {/* 大時計 */}
                <h1 className="text-6xl sm:text-7xl font-extralight tracking-tight text-white font-mono drop-shadow-md">
                  {String(activeHour).padStart(2, '0')}:
                  {new Date().getMinutes().toString().padStart(2, '0')}
                </h1>

                {/* 夕方・夜なら明日の起床目標カード、日中なら本日の直近予定 */}
                {isNightOrEvening && tomorrowTarget && tomorrowReverse ? (
                  <div className="mt-3.5 w-full p-3.5 rounded-2xl bg-stone-900/60 backdrop-blur-md border border-white/25 text-left shadow-lg pointer-events-auto cursor-pointer"
                       onClick={() => {
                         triggerVibrate(15);
                         setIsScheduleModalOpen(true);
                       }}>
                    <div className="flex justify-between items-center text-xs font-bold text-amber-300 mb-1">
                      <span>明日 ({tomorrowDayOfWeek}) の予定</span>
                      <span className="font-mono text-white text-[11px]">{tomorrowTarget.time} 開始</span>
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      {tomorrowTarget.title}
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <span className="text-stone-400 block text-[9px]">明朝 起床目標</span>
                        <span className="text-amber-300 font-bold text-sm">{tomorrowReverse.wakeUp}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-stone-400 block text-[9px]">出発目標</span>
                        <span className="text-white font-medium">{tomorrowReverse.leaveHome}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-indigo-300 block text-[9px]">今夜の推奨就寝</span>
                        <span className="text-indigo-200 font-medium">{tomorrowReverse.targetSleep}</span>
                      </div>
                    </div>
                  </div>
                ) : nextSchedule && nextReverse ? (
                  <div className="mt-3.5 w-full p-3.5 rounded-2xl bg-stone-900/50 backdrop-blur-md border border-white/20 text-left pointer-events-auto cursor-pointer"
                       onClick={() => {
                         triggerVibrate(15);
                         setIsScheduleModalOpen(true);
                       }}>
                    <div className="flex justify-between items-center text-xs font-bold text-white mb-1.5">
                      <span className="truncate">{nextSchedule.title}</span>
                      <span className="font-mono text-amber-300 text-[11px] shrink-0">{nextSchedule.time} 開始</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-stone-200">
                      <span className="text-amber-300 font-bold">起床 {nextReverse.wakeUp}</span>
                      <span className="opacity-40">→</span>
                      <span>出発 {nextReverse.leaveHome}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3.5 p-3 rounded-2xl bg-stone-900/40 backdrop-blur-md border border-white/15 text-xs text-stone-300 pointer-events-auto cursor-pointer"
                       onClick={() => {
                         triggerVibrate(15);
                         setIsScheduleModalOpen(true);
                       }}>
                    本日の予定は未登録です（タップして設定）
                  </div>
                )}

                {/* 昨夜の睡眠状態 */}
                {latestSleep ? (
                  <div className="mt-2 flex items-center space-x-2 text-[11px] font-mono bg-stone-900/35 px-3 py-1 rounded-full border border-white/10 text-stone-300 pointer-events-auto cursor-pointer"
                       onClick={() => {
                         triggerVibrate(15);
                         setIsSleepModalOpen(true);
                       }}>
                    <Bed className="w-3.5 h-3.5 text-indigo-300" />
                    <span>睡眠 {latestSleep.sleepHours}h</span>
                    <span className="opacity-40">•</span>
                    <span>スコア {latestSleep.fatigueScore}点</span>
                    <span className="opacity-40">•</span>
                    <span>{latestSleep.mood}</span>
                  </div>
                ) : (
                  <div className="mt-2 text-[10px] text-white/60 font-mono pointer-events-auto cursor-pointer hover:text-white"
                       onClick={() => {
                         triggerVibrate(15);
                         setIsSleepModalOpen(true);
                       }}>
                    + 睡眠データを記録する
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 下部：半円メニューの引き手 */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              triggerVibrate(12);
              setIsMenuOpen(true);
            }}
            className="relative z-10 flex flex-col items-center cursor-pointer group pb-2 transition"
          >
            <ChevronUp className="w-6 h-6 text-white/80 group-hover:text-white transition-transform group-hover:-translate-y-0.5 drop-shadow-md animate-bounce" />
            <span className="text-xs font-semibold text-white/90 group-hover:text-white mt-0.5 tracking-wider drop-shadow-md">
              {isDeveloperMode ? '③ 半円メニュー' : 'メニューを開く'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          右上のインジケーター（開発者モード時のみデバッグHUD表示）
      ======================================================== */}
      {isDeveloperMode && (
        <div className="fixed top-4 right-4 z-40 flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-stone-900/90 text-white backdrop-blur-md border border-white/20 shadow-sm">
            <CurrentWeatherIcon className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-semibold text-[11px]">{WEATHER_PRESETS[weather].name}</span>
            <span className="opacity-40">|</span>
            <span className="text-[10px] text-stone-400 font-mono">{activeHour}時</span>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-amber-500/90 text-stone-950 font-bold text-[10px] shadow-sm">
            <CodeXml className="w-3 h-3" />
            <span>DEBUG (ダミー)</span>
          </div>
        </div>
      )}

      {/* ========================================================
          デバッグHUD（開発者モード時のみ左上に表示）
      ======================================================== */}
      {isDeveloperMode && (
        <div className="fixed top-4 left-4 z-40 bg-stone-900/90 backdrop-blur-md text-stone-200 border border-white/10 rounded-2xl p-3 text-[10px] font-mono space-y-1 pointer-events-none shadow-lg max-w-[200px]">
          <div className="flex justify-between items-center text-amber-400 font-bold border-b border-stone-700/60 pb-1 mb-1">
            <span>PHYSICS HUD</span>
            <span>{swipeWeight.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Current:</span>
            <span className="font-bold text-white">
              {currentScreen === 'screen1' ? '① Screen 1' : '② Screen 2'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Mode:</span>
            <span className="text-amber-300">DUMMY ACTIVE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Weather:</span>
            <span className="text-sky-300">{WEATHER_PRESETS[weather].name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Offset:</span>
            <span className="text-amber-300">{Math.round(dragOffsetY)}px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Damper:</span>
            <span>{getWeightFactor()}x factor</span>
          </div>
        </div>
      )}

      {/* ========================================================
          トースト通知
      ======================================================== */}
      {toastMessage && (
        <div className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none animate-fade-in">
          <div className="bg-stone-900/95 backdrop-blur-md text-white border border-white/15 px-4 py-2 rounded-full text-xs font-medium shadow-2xl flex items-center space-x-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ========================================================
          ③ 半円メニュー（下部ドロワー）
          「睡眠記録」「予定入力」「設定」の3大機能
      ======================================================== */}
      <div
        className="fixed bottom-0 left-1/2 w-[96vw] max-w-[620px] h-[58vw] sm:h-[290px] min-h-[280px] max-h-[370px] rounded-t-[180px] sm:rounded-t-[310px] bg-white/95 backdrop-blur-md border-t border-x border-stone-300 shadow-2xl z-50 flex flex-col justify-between items-center p-6 sm:px-10 pb-6 will-change-transform"
        style={{ transform: getMenuTransform(), ...getTransitionStyle() }}
      >
        {/* 引き下げハンドル & メニュータイトル */}
        <div className="flex flex-col items-center cursor-pointer pt-1 group" onClick={() => {
          triggerVibrate(12);
          setIsMenuOpen(false);
        }}>
          <div className="w-12 h-1 bg-stone-300 group-hover:bg-stone-500 rounded-full transition mb-2" />
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
            <span className="text-xs sm:text-sm font-bold text-stone-800 tracking-widest font-mono">
              {isDeveloperMode ? '③ メニュー（開発者モード・ダミー中）' : 'メニュー'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
          </div>
        </div>

        {/* スマホに送る・QRコード・ホーム追加バナー */}
        <div className="w-full max-w-[460px] flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              triggerVibrate(15);
              setIsMenuOpen(false);
              setIsQrModalOpen(true);
            }}
            className="flex-1 py-1.5 px-3 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center justify-between text-xs font-bold hover:bg-indigo-100 transition shadow-2xs cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>スマホで開く（QRコード）</span>
            </div>
            <span className="text-[10px] text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full font-medium">
              Android対応
            </span>
          </button>

          {deferredInstallPrompt && !isAppInstalled && (
            <button
              type="button"
              onClick={handleInstallApp}
              className="py-1.5 px-3 rounded-full bg-stone-900 text-white flex items-center space-x-1 text-xs font-bold hover:bg-stone-800 transition shadow-2xs cursor-pointer shrink-0"
            >
              <Download className="w-3 h-3" />
              <span>ホーム追加</span>
            </button>
          )}
        </div>

        {/* 3つの洗練されたメニューカード */}
        <div className="grid grid-cols-3 gap-3 pb-2 w-full max-w-[500px]">
          {/* 睡眠記録 */}
          <button
            type="button"
            onClick={() => {
              triggerVibrate(15);
              setIsMenuOpen(false);
              setIsSleepModalOpen(true);
            }}
            className="flex flex-col items-center p-3 rounded-2xl transition cursor-pointer group active:scale-95 bg-white border border-stone-200 hover:border-indigo-400 hover:bg-indigo-50/50 shadow-xs"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors bg-indigo-50 border border-indigo-200 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white shadow-xs">
              <Bed className="w-6 h-6 transition-colors" />
            </div>
            <span className="text-xs font-bold text-stone-900 mt-2">
              睡眠記録
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5">
              リズム＆スコア
            </span>
          </button>

          {/* 予定入力 */}
          <button
            type="button"
            onClick={() => {
              triggerVibrate(15);
              setIsMenuOpen(false);
              setIsScheduleModalOpen(true);
            }}
            className="flex flex-col items-center p-3 rounded-2xl transition cursor-pointer group active:scale-95 bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 shadow-xs"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors bg-amber-50 border border-amber-200 group-hover:bg-amber-600 text-amber-700 group-hover:text-white shadow-xs">
              <Calendar className="w-6 h-6 transition-colors" />
            </div>
            <span className="text-xs font-bold text-stone-900 mt-2">
              予定入力
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5">
              週間時間割・明日前日
            </span>
          </button>

          {/* 設定 */}
          <button
            type="button"
            onClick={() => {
              triggerVibrate(15);
              setIsMenuOpen(false);
              setIsSettingsModalOpen(true);
            }}
            className="flex flex-col items-center p-3 rounded-2xl transition cursor-pointer group active:scale-95 bg-white border border-stone-200 hover:border-stone-400 hover:bg-stone-50 shadow-xs"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors bg-stone-100 border border-stone-200 group-hover:bg-stone-800 text-stone-700 group-hover:text-white shadow-xs relative">
              <SlidersVertical className="w-6 h-6 transition-colors" />
              {isDeveloperMode && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white" />
              )}
            </div>
            <span className="text-xs font-bold text-stone-900 mt-2">
              設定
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5">
              基本・開発者
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================
          睡眠記録モーダル
      ======================================================== */}
      {isSleepModalOpen && (
        <SleepManager
          logs={activeSleepLogs}
          onAddLog={handleAddSleepLog}
          onDeleteLog={handleDeleteSleepLog}
          onClose={() => setIsSleepModalOpen(false)}
        />
      )}

      {/* ========================================================
          予定入力専用ハブ（明日の前日予定 ＆ 1週間の大学時間割・スクショOCR）
      ======================================================== */}
      {isScheduleModalOpen && (
        <ScheduleManager
          schedules={activeSchedules}
          weeklySlots={activeWeeklySlots}
          onAddSchedule={handleAddSchedule}
          onDeleteSchedule={handleDeleteSchedule}
          onToggleComplete={handleToggleSchedule}
          onSaveWeeklySlots={handleSaveWeeklySlots}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}

      {/* ========================================================
          設定モーダル（基本設定 ＋ PWAインストール ＋ 開発者モード/デバッグ集約欄）
      ======================================================== */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        appSettings={appSettings}
        onUpdateAppSettings={handleUpdateAppSettings}
        onInstallApp={handleInstallApp}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        isAppInstalled={isAppInstalled}
        hasInstallPrompt={!!deferredInstallPrompt}
        isDeveloperMode={isDeveloperMode}
        onToggleDeveloperMode={handleToggleDeveloperMode}
        onInjectDummyData={handleInjectDummyData}
        onClearData={handleClearData}
        weather={weather}
        onChangeWeather={handleChangeWeather}
        timeMode={timeMode}
        activeHour={activeHour}
        activePresetKey={activePresetKey}
        onChangeTimeMode={setTimeMode}
        onChangeManualHour={setManualHour}
        onSelectTimePreset={handleSelectTimePreset}
        onResetToRealTime={handleResetToRealTime}
        swipeWeight={swipeWeight}
        onChangeSwipeWeight={handleChangeSwipeWeight}
      />

      {/* ========================================================
          スマホ連携・QRコードモーダル
      ======================================================== */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        appUrl={currentAppUrl}
      />
    </div>
  );
}
