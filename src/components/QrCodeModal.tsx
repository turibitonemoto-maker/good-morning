import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  X,
  Mail,
  Share2,
  Download,
  Info,
} from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, appUrl }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (appUrl) {
      QRCode.toDataURL(appUrl, {
        width: 360,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [appUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MorningSync',
          text: 'MorningSync - 朝の逆算お出かけ＆睡眠マネージャー',
          url: appUrl,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch {
        // cancelled by user
      }
    } else {
      handleCopy();
    }
  };

  // ユーザーのGmail宛てに送るリンク
  const mailSubject = encodeURIComponent('MorningSync スマホアクセス用URL');
  const mailBody = encodeURIComponent(
    `MorningSync（朝の逆算お出かけ＆睡眠マネージャー）のスマホ用URLです。\n\n以下のURLをスマホのChromeで開いてください：\n${appUrl}\n\n開いた後、Chromeのメニューから「ホーム画面に追加」をタップすると、Androidアプリとしてインストールできます。`
  );
  const mailtoHref = `mailto:turibitonemoto@gmail.com?subject=${mailSubject}&body=${mailBody}`;

  return (
    <div className="fixed inset-0 z-[70] bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-scale-up my-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">スマホに送る・開く</h3>
              <p className="text-[11px] text-stone-500">Androidアプリとして手軽にテスト・利用可能</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 方法1: QRコード */}
        <div className="mt-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 border border-stone-200">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="スマホアクセス用QRコード"
              className="w-52 h-52 rounded-xl shadow-xs"
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-xs text-stone-400">
              QRコード生成中...
            </div>
          )}
          <span className="text-[11px] text-stone-700 font-bold mt-2.5 flex items-center space-x-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span>スマホの「カメラ」でかざすとすぐ開きます</span>
          </span>
        </div>

        {/* 方法2: ワンクリック送信＆コピー */}
        <div className="mt-3 space-y-2">
          <div className="text-[11px] font-bold text-stone-700">URLコピー・他の送信方法:</div>
          <div className="flex items-center space-x-2 p-2 bg-stone-100 rounded-xl border border-stone-200">
            <span className="text-[11px] font-mono text-stone-600 truncate flex-1 select-all px-1">
              {appUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shrink-0 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'コピー済' : 'コピー'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* メールで自分に送る */}
            <a
              href={mailtoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition border border-stone-200 shadow-2xs text-center"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gmailで自分に送る</span>
            </a>

            {/* 端末共有 */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition border border-stone-200 shadow-2xs cursor-pointer text-center"
            >
              {shareSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>{shareSuccess ? '共有完了' : 'LINE・他アプリ共有'}</span>
            </button>
          </div>
        </div>

        {/* Androidアプリとしてホームに追加する手順ガイド */}
        <div className="mt-3.5 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-stone-700 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-indigo-950">
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Androidアプリ化（PWA）の3ステップ：</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-stone-600 pl-0.5 leading-relaxed">
            <li>スマホのカメラで上のQRを読み取るか、URLをChromeで開く</li>
            <li>Chrome右上のメニュー（<strong>︙</strong>）を開く</li>
            <li>
              「<strong>アプリをインストール</strong>」または「<strong>ホーム画面に追加</strong>」をタップ
            </li>
          </ol>
          <div className="text-[10px] text-indigo-700 font-medium pt-0.5">
            ※ ホーム画面に専用アプリアイコンが作成され、ブラウザ枠のない全画面アプリとして動作します！
          </div>
        </div>

        {/* 閉じるボタン */}
        <div className="mt-4 pt-2 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
