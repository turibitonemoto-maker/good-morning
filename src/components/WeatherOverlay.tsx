import React, { useMemo } from 'react';
import { WeatherType } from '../types';

interface WeatherOverlayProps {
  weather: WeatherType;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ weather }) => {
  // 雨粒のランダム配置（メモ化して不変）
  const raindrops = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${(i * 2.2 + (i % 7) * 1.5) % 100}%`,
      duration: `${0.45 + ((i % 5) * 0.08)}s`,
      delay: `${((i * 0.17) % 2).toFixed(2)}s`,
      height: `${50 + (i % 4) * 25}px`,
      opacity: 0.35 + (i % 3) * 0.2,
    }));
  }, []);

  // 雪粒のランダム配置
  const snowflakes = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${(i * 2.6 + (i % 9) * 2.1) % 100}%`,
      duration: `${3.5 + (i % 6) * 0.8}s`,
      delay: `${((i * 0.23) % 4).toFixed(2)}s`,
      size: `${3 + (i % 4) * 2}px`,
      opacity: 0.4 + (i % 4) * 0.18,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 transition-all duration-700">
      {/* 晴れ: 太陽光線 & レンズフレア */}
      {weather === 'sunny' && (
        <div className="absolute inset-0 transition-opacity duration-1000 opacity-90">
          {/* 上部からの光条 */}
          <div
            className="absolute -top-32 right-1/4 w-[600px] h-[700px] origin-top-right animate-sunbeam pointer-events-none"
            style={{
              background:
                'conic-gradient(from 180deg at 70% 0%, transparent 0deg, rgba(254, 240, 138, 0.18) 25deg, transparent 50deg, rgba(253, 224, 71, 0.22) 80deg, transparent 110deg, rgba(254, 243, 199, 0.15) 140deg, transparent 180deg)',
              filter: 'blur(20px)',
            }}
          />
          {/* 優しいフレアグロー */}
          <div className="absolute top-4 right-12 w-48 h-48 rounded-full bg-amber-200/25 blur-3xl pointer-events-none" />
          <div className="absolute top-24 right-32 w-16 h-16 rounded-full bg-yellow-100/35 blur-xl pointer-events-none" />
        </div>
      )}

      {/* 曇り: 流れる雲のレイヤー */}
      {weather === 'cloudy' && (
        <div className="absolute inset-0 transition-opacity duration-1000 opacity-80">
          {/* 薄暗い拡散トーン */}
          <div className="absolute inset-0 bg-stone-900/15 backdrop-brightness-95 pointer-events-none" />
          {/* 上層の雲 */}
          <div
            className="absolute -top-10 -left-1/4 w-[160%] h-72 rounded-full blur-3xl opacity-35 animate-cloud-slow bg-gradient-to-r from-stone-300 via-stone-100 to-stone-400"
          />
          {/* 下層の雲 */}
          <div
            className="absolute top-20 -left-1/3 w-[170%] h-80 rounded-full blur-3xl opacity-25 animate-cloud-fast bg-gradient-to-r from-slate-200 via-stone-300 to-slate-200"
          />
        </div>
      )}

      {/* 雨: 降り注ぐ雨粒 & 霞 */}
      {weather === 'rainy' && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          {/* 雨霞フィルター */}
          <div className="absolute inset-0 bg-slate-900/20 backdrop-contrast-105 pointer-events-none" />
          {/* 雨粒たち */}
          {raindrops.map((drop) => (
            <div
              key={drop.id}
              className="absolute top-0 w-[1.5px] rounded-full bg-gradient-to-b from-transparent via-sky-200/80 to-white"
              style={{
                left: drop.left,
                height: drop.height,
                opacity: drop.opacity,
                animation: `rainfall ${drop.duration} linear infinite`,
                animationDelay: drop.delay,
              }}
            />
          ))}
          {/* 画面下部の水しぶきグラデーション */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-sky-900/20 to-transparent pointer-events-none" />
        </div>
      )}

      {/* 雪: 舞い落ちる雪の結晶 */}
      {weather === 'snowy' && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          {/* 寒冷トーン */}
          <div className="absolute inset-0 bg-sky-950/10 pointer-events-none" />
          {/* 雪片たち */}
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="absolute top-0 rounded-full bg-white shadow-[0_0_6px_white]"
              style={{
                left: flake.left,
                width: flake.size,
                height: flake.size,
                opacity: flake.opacity,
                animation: `snowfall ${flake.duration} ease-in-out infinite`,
                animationDelay: flake.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* 雷雨: 激しい豪雨 & 閃光フラッシュ */}
      {weather === 'thunder' && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          {/* 稲妻フラッシュ */}
          <div className="absolute inset-0 bg-white/90 animate-lightning pointer-events-none" />
          {/* 暗雲オーバーレイ */}
          <div className="absolute inset-0 bg-slate-950/35 backdrop-contrast-125 pointer-events-none" />
          {/* 激しい雨粒 */}
          {raindrops.map((drop) => (
            <div
              key={drop.id}
              className="absolute top-0 w-[2px] rounded-full bg-gradient-to-b from-transparent via-cyan-100 to-white"
              style={{
                left: drop.left,
                height: `calc(${drop.height} * 1.3)`,
                opacity: Math.min(1, drop.opacity * 1.3),
                animation: `rainfall ${parseFloat(drop.duration) * 0.75}s linear infinite`,
                animationDelay: drop.delay,
              }}
            />
          ))}
          {/* 時折鳴る雷鳴の遠雷グロー */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-sky-200/20 blur-3xl animate-lightning pointer-events-none" />
        </div>
      )}
    </div>
  );
};
