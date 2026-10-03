import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = 3000;

app.use(express.json({ limit: '20mb' }));

// 時間割画像解析API (Gemini 3.8 Flash Multimodal OCR)
app.post('/api/parse-timetable', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data required' });
    }

    const ai = new GoogleGenAI();
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    const detectedMime = mimeType || 'image/jpeg';

    const prompt = `この画像は大学または高校・専門学校の時間割（スケジュール）です。
画像をOCR解析して、登録されている講義・授業の情報をすべて抽出し、以下のJSON配列形式のみで出力してください。
余計な解説文やマークダウンは不要です。純粋なJSON配列のみを返してください。

[
  {
    "dayOfWeek": "月", // "月", "火", "水", "木", "金" のいずれか
    "period": "1限", // "1限", "2限", "3限", "4限", "5限" 等
    "startTime": "09:00", // 開始時刻 (例: "09:00", "10:40", "13:00", "14:45", "16:30")
    "endTime": "10:30", // 終了時刻
    "subject": "講義名", // 科目名・講義名
    "location": "講義棟 201" // 教室・場所（記載があれば）
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: detectedMime,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    const parsed = JSON.parse(text);
    return res.json({ success: true, items: parsed });
  } catch (err: any) {
    console.error('Error parsing timetable:', err);
    return res.status(500).json({ error: err.message || 'Failed to parse timetable image' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
