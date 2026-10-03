export interface AppSettings {
  origin: string; // 出発地 (例: 自宅)
  destination: string; // 到着地 (例: 大学 講義棟)
  prepTimeMinutes: number; // 準備にかかる時間 (例: 40分)
  toStationMinutes: number; // 駅/バス停までの徒歩時間 (例: 10分)
  defaultDeadlineTime: string; // デッドライン時間 (例: "09:00")
}

export interface RoutePattern {
  id: string;
  name: '余裕' | '通常' | 'ギリギリ';
  badgeColor: string;
  wakeUpTime: string; // 起床時間
  leaveHomeTime: string; // 家を出る時間
  busTime: string; // 乗るバス/電車時刻
  stationTime: string; // 駅到着/乗り継ぎ
  arrivalTime: string; // 大学到着時間
  isRecommended?: boolean;
}

export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD
  phoneOffTime: string; // スマホを触らなくなった時間 / 就寝時刻 (例: "23:30")
  wakeUpTime: string; // 起床時間 (例: "07:30")
  sleepHours: number; // 睡眠時間 (例: 8.0)
  fatigueScore: number; // 疲労・リカバリースコア (0-100)
  mood: 'スッキリ' | '普通' | 'だるい' | '寝不足';
  wakeCount?: number; // 中途覚醒回数 (0, 1, 2...)
  tags?: string[]; // 「湯船に入った」「スマホ控えめ」「カフェインなし」など
  note?: string;
}

export interface ScheduleItem {
  id: string;
  title: string; // 予定名 (例: "1限 データサイエンス", "アルバイト")
  date: string; // YYYY-MM-DD
  time: string; // 開始時間 (例: "09:00")
  location?: string; // 場所 (例: "講義棟 201", "渋谷")
  prepMinutes: number; // 身支度時間 (分)
  transitMinutes: number; // 移動時間 (分)
  isCompleted?: boolean;
  isCustomTomorrow?: boolean; // 明日の個別予定フラグ
}

// 一週間の大学時間割・ルーティン用
export interface WeeklyRoutineSlot {
  id: string;
  dayOfWeek: '月' | '火' | '水' | '木' | '金';
  period: string; // "1限" | "2限" | "3限" | "4限" | "5限"
  startTime: string; // "09:00"
  endTime?: string; // "10:30"
  subject: string; // 講義名
  location?: string; // 教室・場所
  prepMinutes: number;
  transitMinutes: number;
}

export type ScreenState = 'screen1' | 'screen2';
export type SwipeWeight = 'normal' | 'heavy' | 'extraHeavy';
export type TimePresetId = 'morning' | 'day' | 'sunset' | 'night';
export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'thunder';

export interface WeatherConfig {
  id: WeatherType;
  name: string;
  iconName: string;
  temp: number;
  humidity: number;
  conditionDescription: string;
}
