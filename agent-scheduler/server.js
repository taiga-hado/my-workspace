const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// All agent data with scheduling URLs
const agents = [
  {
    name: "meevo",
    platform: "timerex",
    contacts: [
      { name: "松永様", url: "https://timerex.net/s/saiyo-meevo/948a8594" },
      { name: "森川様", url: "https://timerex.net/s/morikawa_ead4_cd8b/02f8d38f" },
      { name: "清水様", url: "https://timerex.net/s/saiyo-meevo/46e83c44" },
      { name: "蓮沼様", url: "https://timerex.net/s/hasunuma_1c1e/1dcf2355" },
      { name: "長尾", url: "https://timerex.net/s/nagao_6d83_5c3e/05b83b1f" },
      { name: "宮原", url: "https://timerex.net/s/miyahara_71d4_50c8/25b0d86c" },
      { name: "上野", url: "https://timerex.net/s/ueno_f00f_a8da/dc9aed0a" },
    ],
  },
  {
    name: "Nexil",
    platform: "timerex",
    contacts: [
      { name: "依田様", url: "https://timerex.net/s/kenichirou.yoda_f0c6/4229ccca" },
    ],
  },
  {
    name: "HRteam",
    platform: "timerex",
    contacts: [
      { name: "近藤さん", url: "https://timerex.net/s/s-kondo_3a1b/02af3036" },
      { name: "下形さん", url: "https://timerex.net/s/k-shimogata_7a28/ed9a7923" },
      { name: "角田さん", url: "https://timerex.net/s/s-tsunoda_e1d2/48b5aac3" },
      { name: "中塚さん", url: "https://timerex.net/s/k-nakatsuka_81f6_dc20/a89da9ef" },
      { name: "深澤さん", url: "https://timerex.net/s/s-hukazawa_7176/a3789091" },
      { name: "中村さん", url: "https://timerex.net/s/s-nakamura_9c1b_2cda/e8abe8bf" },
      { name: "中尾さん", url: "https://timerex.net/s/k-nakao_1d9b_8310/6f171a69" },
      { name: "山戸さん", url: "https://timerex.net/s/t-yamato_f6a8_4877/7c4e723c" },
      { name: "近藤(隆)さん", url: "https://timerex.net/s/r-kondo_b2f8_13be/0d9515e5" },
      { name: "伊藤さん", url: "https://timerex.net/s/n.ito_4fda_c3d0/f5bbde4f" },
    ],
  },
  {
    name: "HIRAKUTO",
    platform: "timerex",
    contacts: [
      { name: "山田様", url: "https://timerex.net/s/h_yamada_7a6c_296d/430030d2" },
    ],
  },
  {
    name: "エントリーゲート",
    platform: "timerex",
    contacts: [
      { name: "（共通）", url: "https://timerex.net/s/jobagency_4d9c/868726d1" },
    ],
  },
  {
    name: "ROXX",
    platform: "timerex",
    contacts: [
      { name: "池田様", area: "一都三県・愛知", url: "https://timerex.net/s/rikuya.ikeda_4213/918589ba" },
      { name: "寺尾様", area: "一都三県・愛知", url: "https://timerex.net/s/shota.terao_e460/74d83f17" },
      { name: "森岡様", area: "一都三県・愛知", url: "https://timerex.net/s/naohiro.morioka_ad73/28aa0d9b" },
      { name: "林様", area: "大阪・京都・兵庫", url: "https://timerex.net/s/shogo.hayashi_9016/0069e319" },
      { name: "荒井様", area: "大阪・京都・兵庫", url: "https://timerex.net/s/jou.arai_0032/37c382b8" },
      { name: "谷口様", area: "大阪・京都・兵庫", url: "https://timerex.net/s/ryuya.taniguchi_c84f/3ee83854" },
      { name: "鈴木様", area: "茨城・群馬・栃木・宮城・静岡", url: "https://timerex.net/s/yusuke.suzuki_edac_61cb/b7c5c11d" },
      { name: "山田様", area: "茨城・群馬・栃木・宮城・静岡", url: "https://timerex.net/s/kaito.yamada_bd36/14ed531b" },
    ],
  },
  {
    name: "Smart Force",
    platform: "timerex",
    contacts: [
      { name: "安良岡", url: "https://timerex.net/s/kenta.yasuraoka_d327/38d8ec29" },
      { name: "鈴木", url: "https://timerex.net/s/ryosuke.suzuki_b9fa_8616/2133155f" },
      { name: "富樫", url: "https://timerex.net/s/akari.togashi_3a14/8d04b25f" },
    ],
  },
  {
    name: "Eウェルスマネジメント",
    platform: "timerex",
    contacts: [
      { name: "田中大志", url: "https://timerex.net/s/ht550393_36b3/35c8b55a" },
      { name: "多田逸人", url: "https://timerex.net/s/hayato_c5dc_3989/09efc30d" },
      { name: "工藤慎平", url: "https://timerex.net/s/shinpei_c74c_519f/c090f39a" },
    ],
  },
  {
    name: "インバウンドテクノロジー",
    platform: "timerex",
    contacts: [
      { name: "建部様", url: "https://timerex.net/s/s-tatebe_2e3c/e6e80a59" },
    ],
  },
  {
    name: "エイト",
    platform: "timerex",
    contacts: [
      { name: "水主様", url: "https://timerex.net/s/y.suishu_2719_6f07/02557fc6" },
    ],
  },
  {
    name: "ForAcareer",
    platform: "jicoo",
    contacts: [
      { name: "関東", url: "https://www.jicoo.com/t/ogqaWfd75nJ_/e/tokyo_alliance" },
      { name: "関西", url: "https://www.jicoo.com/t/ogqaWfd75nJ_/e/kansai_alliance" },
    ],
  },
  {
    name: "ラストデータ",
    platform: "jicoo",
    contacts: [
      { name: "（共通）", url: "https://www.jicoo.com/t/kW07Vx_6UpuG/e/5jOQHxU1" },
    ],
  },
  {
    name: "パーソルイノベーション",
    platform: "eeasy",
    contacts: [
      { name: "都心エリア", url: "https://persol-innovation.eeasy.jp/90m" },
      { name: "地方エリア", url: "https://persol-innovation.eeasy.jp/90m_rural" },
    ],
  },
  {
    name: "UZUZ",
    platform: "eeasy",
    contacts: [
      { name: "一都三県×1年以上", url: "https://uzuz-inc.eeasy.jp/hakkutsu-over1year-kanto" },
      { name: "一都三県×1年未満", url: "https://uzuz-inc.eeasy.jp/hakkutsu-under1year-kanto" },
      { name: "大阪×1年以上", url: "https://uzuz-inc.eeasy.jp/hakkutsu-over1year-osaka" },
      { name: "大阪×1年未満", url: "https://uzuz-inc.eeasy.jp/hakkutsu-under1year-osaka" },
    ],
  },
  {
    name: "サプリレ",
    platform: "google",
    contacts: [
      { name: "（共通）", url: "https://calendar.app.google/wisp92wW3KGV66jw9" },
    ],
  },
  {
    name: "HADO",
    platform: "google",
    contacts: [
      { name: "（共通）", url: "https://calendar.app.google/V34rzHHUdDPMDe1n6" },
    ],
  },
  {
    name: "ユニポテンシャル",
    platform: "google",
    contacts: [
      { name: "枠1", url: "https://calendar.app.google/m5ZaEoquogCScn3K9" },
      { name: "枠2", url: "https://calendar.app.google/LtBJdrwAE1SPNxFf6" },
      { name: "枠3", url: "https://calendar.app.google/UW8vBynhtam1Hgf39" },
    ],
  },
  {
    name: "move on",
    platform: "spirinc",
    contacts: [
      { name: "（共通）", url: "https://app.spirinc.com/t/fTPSgfsjYaUMqu_ou8FgT/as/1-7kyxqQ_dhRmonhpMHnt/confirm-guest" },
    ],
  },
];

// Fetch Timerex slots via their JSON API (no browser needed!)
async function fetchTimerexSlots(url, targetDate) {
  try {
    // Convert YYYY-MM-DD to YYYYMMDD
    const dateStr = targetDate.replace(/-/g, "");
    const apiUrl = `${url}/calendar_week?start_date=${dateStr}&end_date=${dateStr}&locale=ja&timezone=Asia%2FTokyo`;

    const response = await fetch(apiUrl, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      // 500 typically means the date is outside the booking window
      if (response.status === 500) {
        return { slots: [], error: null };
      }
      return { slots: [], error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    if (!data.status || !data.slots) {
      return { slots: [], error: "無効なレスポンス" };
    }

    // Extract slots for the target date from all day keys
    const allSlots = [];
    for (const [dayKey, daySlots] of Object.entries(data.slots)) {
      for (const slot of daySlots) {
        if (!slot.disable) {
          allSlots.push(`${slot.start_time} - ${slot.end_time}`);
        }
      }
    }

    return { slots: allSlots, error: null };
  } catch (err) {
    return { slots: [], error: err.message };
  }
}

// Main endpoint: check availability for a specific date
app.post("/api/check", async (req, res) => {
  const { date, agentFilter } = req.body;
  if (!date) return res.status(400).json({ error: "date is required (YYYY-MM-DD)" });

  try {
    // Filter to only Timerex agents
    let targetAgents = agents.filter((a) => a.platform === "timerex");
    if (agentFilter) {
      targetAgents = targetAgents.filter((a) =>
        a.name.toLowerCase().includes(agentFilter.toLowerCase())
      );
    }

    // Build flat list of all contacts
    const tasks = [];
    for (const agent of targetAgents) {
      for (const contact of agent.contacts) {
        tasks.push({
          agentName: agent.name,
          contactName: contact.name,
          area: contact.area || "",
          url: contact.url,
          platform: agent.platform,
        });
      }
    }

    // Fetch ALL in parallel (no browser, just HTTP requests - very fast!)
    const results = await Promise.all(
      tasks.map(async (task) => {
        const { slots, error } = await fetchTimerexSlots(task.url, date);
        return { ...task, slots, error };
      })
    );

    res.json({
      date,
      results,
      summary: {
        total: results.length,
        available: results.filter((r) => r.slots.length > 0).length,
        errors: results.filter((r) => r.error).length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all agents
app.get("/api/agents", (req, res) => {
  res.json(agents);
});

const PORT = 3456;
app.listen(PORT, () => {
  console.log(`Agent Scheduler server running at http://localhost:${PORT}`);
});
