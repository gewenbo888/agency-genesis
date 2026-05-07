// ============ i18n + theme ============
const root = document.documentElement;
const LANG_KEY = "ag-lang";
const THEME_KEY = "ag-theme";

function applyLang(lang) {
  root.setAttribute("data-lang", lang);
  document.querySelectorAll(".lang-toggle button").forEach(b => {
    b.classList.toggle("active", b.dataset.langSet === lang);
  });
  document.querySelectorAll("[data-en-placeholder]").forEach(el => {
    el.placeholder = el.getAttribute(`data-${lang}-placeholder`) || el.placeholder;
  });
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
}
function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-toggle button").forEach(b => {
    b.classList.toggle("active", b.dataset.themeSet === theme);
  });
  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
}
const initLang = (() => {
  try { const s = localStorage.getItem(LANG_KEY); if (s) return s; } catch (_) {}
  return (navigator.language || "en").toLowerCase().startsWith("zh") ? "zh" : "en";
})();
applyLang(initLang);
applyTheme(localStorage.getItem(THEME_KEY) || "light");

document.querySelectorAll(".lang-toggle button").forEach(btn =>
  btn.addEventListener("click", () => applyLang(btn.dataset.langSet)));
document.querySelectorAll(".theme-toggle button").forEach(btn =>
  btn.addEventListener("click", () => applyTheme(btn.dataset.themeSet)));

// ============ Reflection prompts (40 across themes) ============
const PROMPTS = [
  // matrix · forces at work
  { theme: "matrix", theme_zh: "矩阵",
    en: "Whose voice were you hearing when you decided this was important?", zh: "当你决定“这件事重要”时，你听到的是谁的声音？" },
  { theme: "matrix", theme_zh: "矩阵",
    en: "Which app spends the most of you, and what does it give back?", zh: "哪个应用消耗你最多 —— 它给你回报了什么？" },
  { theme: "matrix", theme_zh: "矩阵",
    en: "What 'should' in your head was installed by someone who isn't in your life anymore?", zh: "你头脑里的哪条“应该”，是由现在已不在你生活里的人安装的？" },
  { theme: "matrix", theme_zh: "矩阵",
    en: "What 'success' definition were you handed and never questioned?", zh: "什么样的“成功”定义是被递给你的，而你从未质疑过？" },
  { theme: "matrix", theme_zh: "矩阵",
    en: "If your phone was 100m away for a day, what would you actually miss?", zh: "如果你的手机距离你 100 米一整天，你真正会想念的是什么？" },

  // awareness · the observer
  { theme: "awareness", theme_zh: "觉察",
    en: "What did you do today that you can't remember <em>deciding</em> to do?", zh: "今天有哪些事，是你“做了”但不记得“决定”过的？" },
  { theme: "awareness", theme_zh: "觉察",
    en: "What's the first thing you reach for when you're uncomfortable?", zh: "当你感到不舒服时，第一件想抓的东西是什么？" },
  { theme: "awareness", theme_zh: "觉察",
    en: "What sentence do you reflexively say that isn't really yours?", zh: "你反射性会说出来的哪一句话，其实并不是你自己的？" },
  { theme: "awareness", theme_zh: "觉察",
    en: "When was the last time you said 'yes' that you wish you'd thought about for one minute longer?", zh: "你上一次说“好”的时候，事后希望自己多想了一分钟 —— 是什么时候？" },
  { theme: "awareness", theme_zh: "觉察",
    en: "Where in your day does autopilot run longest?", zh: "你一天中，自动驾驶模式最长的那一段是哪里？" },

  // attention · perception
  { theme: "attention", theme_zh: "注意",
    en: "How many high-spike inputs are in your day? How many low-spike, high-depth ones?", zh: "你一天里有多少高峰值输入？又有多少低峰值、高深度的？" },
  { theme: "attention", theme_zh: "注意",
    en: "When was the last time you sustained one thought for 30 minutes without checking anything?", zh: "你上一次连续 30 分钟保持一个想法、不查任何东西，是什么时候？" },
  { theme: "attention", theme_zh: "注意",
    en: "What's the most boring thing you can still find interesting?", zh: "你<em>仍然</em>能觉得有趣的、最无聊的事是什么？" },
  { theme: "attention", theme_zh: "注意",
    en: "What are you afraid would happen if you actually rested?", zh: "你害怕“如果真的休息了，会发生什么”？" },

  // identity · narrative
  { theme: "identity", theme_zh: "身份",
    en: "Write three sentences that begin 'I'm the kind of person who…'", zh: "写下三句以“我是那种……的人”开头的身份语。" },
  { theme: "identity", theme_zh: "身份",
    en: "Whose voice first said this about you? A parent? A teacher? A peer?", zh: "你的这条身份语，最早是谁的声音说给你听的？父母？老师？同伴？" },
  { theme: "identity", theme_zh: "身份",
    en: "Of those sentences, which is still useful even though you didn't author it?", zh: "这些身份语中，哪一句虽然不是你写的，但仍然有用？" },
  { theme: "identity", theme_zh: "身份",
    en: "Which one would you stop performing if you didn't fear losing approval?", zh: "如果不再害怕“失去认可”，你会停止“扮演”哪一句？" },
  { theme: "identity", theme_zh: "身份",
    en: "What one identity sentence do you want to be true that isn't yet?", zh: "有哪一句身份语，你<em>想让它成为真的</em>但目前还不是？" },
  { theme: "identity", theme_zh: "身份",
    en: "Who are you when no one is watching, and no algorithm is rewarding you?", zh: "没人在看，也没有算法奖励你的时候 —— 你是谁？" },

  // emotion · parts
  { theme: "emotion", theme_zh: "情绪",
    en: "What part of you wants this — and what part of you fears it?", zh: "你内在哪一部分想要这件事 —— 哪一部分又害怕它？" },
  { theme: "emotion", theme_zh: "情绪",
    en: "What feeling do you avoid most? What do you do <em>instead</em> of feeling it?", zh: "你最回避哪种情绪？你用什么动作<em>替代</em>感受它？" },
  { theme: "emotion", theme_zh: "情绪",
    en: "If you stayed in this feeling for 90 seconds, what would happen?", zh: "如果你在这个情绪里安住 90 秒，会发生什么？" },
  { theme: "emotion", theme_zh: "情绪",
    en: "What conversation do you keep replaying in your head?", zh: "什么对话你一直在脑子里反复重播？" },
  { theme: "emotion", theme_zh: "情绪",
    en: "Whose loop is this — yours, or one you inherited?", zh: "这是<em>谁的</em>回路 —— 你的，还是你继承来的？" },

  // self-deception
  { theme: "deception", theme_zh: "自欺",
    en: "What is something true about you that you're pretending not to know?", zh: "关于你自己，有什么“已经是真的”，但你在假装不知道？" },
  { theme: "deception", theme_zh: "自欺",
    en: "What's something you say is 'temporary' that has been true for years?", zh: "有什么你称之为“暂时”的事，已经持续了好几年？" },
  { theme: "deception", theme_zh: "自欺",
    en: "What decision have you already made but haven't admitted to yourself?", zh: "有什么决定你其实已经做了，但还没向自己承认？" },
  { theme: "deception", theme_zh: "自欺",
    en: "What part of your story do you tell so it sounds better than it was?", zh: "你的故事里哪一段，你讲得比“它实际是的样子”更好听？" },
  { theme: "deception", theme_zh: "自欺",
    en: "What's the question you're afraid to ask yourself in plain language?", zh: "有哪个问题，你害怕用最简单的语言问自己？" },

  // direction · meaning
  { theme: "direction", theme_zh: "方向",
    en: "What does your calendar say is most important to you? Does it match what you'd <em>say</em> is most important?", zh: "你的日历显示什么对你最重要？这和你“嘴上说”最重要的事一致吗？" },
  { theme: "direction", theme_zh: "方向",
    en: "In ten years, what would have <em>made it</em> a life you respect?", zh: "十年之后，什么会让这一生<em>对得起</em>“我尊重的人生”？" },
  { theme: "direction", theme_zh: "方向",
    en: "What are you waiting for permission to do?", zh: "有什么事，你在等“被允许”才去做？" },
  { theme: "direction", theme_zh: "方向",
    en: "What kind of mistake have you been refusing to make for so long that not making it is now its own mistake?", zh: "有什么错你拒绝了太久，以至于“不犯它”本身已经成了一个错？" },
  { theme: "direction", theme_zh: "方向",
    en: "What would you do if you weren't trying to be someone you're not?", zh: "如果你不再试图成为某个“不是你”的人，你会做什么？" },

  // agency · the seed
  { theme: "agency", theme_zh: "主体性",
    en: "Where in your life do you act <em>by choice</em>, not by default?", zh: "你生活的哪一处，是<em>有选择地</em>在行动，不是默认地？" },
  { theme: "agency", theme_zh: "主体性",
    en: "What's one rule you could install once that would replace 365 daily decisions?", zh: "有什么规则你只决定一次，就能替代每天 365 次的决定？" },
  { theme: "agency", theme_zh: "主体性",
    en: "What environment, redesigned, would make the right thing the easy thing?", zh: "如果重新设计哪一个环境，对的事就会成为容易的事？" },
  { theme: "agency", theme_zh: "主体性",
    en: "What does 'self-directed' mean to you specifically — not abstractly?", zh: "对你来说，“自主”具体是什么意思 —— 不要抽象地说？" },
  { theme: "agency", theme_zh: "主体性",
    en: "If you could only keep one habit for the next ten years, which one?", zh: "如果未来十年只能保留一个习惯，哪一个？" },
  { theme: "agency", theme_zh: "主体性",
    en: "What would change if you treated this week as data instead of judgment?", zh: "如果你把这一周当作“数据”而不是“评判”，什么会变？" },
];

let lastIdx = -1;
let currentTheme = null;

function pickPrompt(theme) {
  const pool = theme
    ? PROMPTS.map((p, i) => ({ p, i })).filter(x => x.p.theme === theme)
    : PROMPTS.map((p, i) => ({ p, i }));
  let pickFrom = pool;
  if (pool.length > 1) pickFrom = pool.filter(x => x.i !== lastIdx);
  const choice = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  lastIdx = choice.i;
  currentTheme = choice.p.theme;
  return { p: choice.p, idx: choice.i };
}
function renderPrompt(picked) {
  const p = picked.p;
  document.getElementById("prompt-text").innerHTML =
    `<span lang="en">${p.en}</span><span lang="zh">${p.zh}</span>`;
  document.getElementById("prompt-meta").innerHTML =
    `<span class="pip"><span lang="en">${p.theme}</span><span lang="zh">${p.theme_zh}</span></span>`;
  document.getElementById("prompt-num").textContent = "№ " + String(picked.idx + 1).padStart(2, "0");
}
renderPrompt(pickPrompt());
document.getElementById("shuffle-btn").addEventListener("click", () => renderPrompt(pickPrompt()));
document.getElementById("theme-btn").addEventListener("click", () => renderPrompt(pickPrompt(currentTheme)));

// ============ Guide ============
const GUIDE = {
  "not-mine": {
    q: { en: "My desires don't feel like mine.", zh: "我的“想要”感觉不像我的。" },
    a: {
      en: [
        "<strong>This is one of the most useful sentences you can say honestly.</strong> 'I want X' is a much more constructed thing than the language suggests. Almost every want has a source — an environment, a peer, an algorithm, a story.",
        "<div class='question'>For one specific recurring desire — pick one — ask three questions: Whose voice first wanted this? When did this 'become important' to me? What environment is rewarding the wanting?</div>",
        "<strong>This isn't an exercise in shame.</strong> Inherited desires aren't worse than authored ones. The question isn't 'is this mine?' — that's binary and unhelpful. The question is: 'now that I see where this came from, do I still want to invest in it?'",
        "<strong>Most don't survive the question.</strong> A few do — and those are <em>extremely</em> valuable, because you've audited them. The rest you can let go without ceremony."
      ],
      zh: [
        "<strong>这是你能诚实说出口最有用的句子之一。</strong>“我想要 X”是一个比语法暗示的“被构建”得多得多的事。几乎每个“想要”都有来源 —— 一个环境、一个同伴、一个算法、一个故事。",
        "<div class='question'>对一个具体的、反复出现的“想要” —— 挑一个 —— 问三个问题：这件事最早是谁的声音想要的？它从什么时候开始对我“变得重要”？什么环境正在奖励这个“想要”？</div>",
        "<strong>这不是用来羞愧的练习。</strong>继承的“想要”不比自著的差。问题不是“这是不是我的” —— 那是二元、没用的问题。问题是：在看清来源之后，<em>我还想继续投资在它上面吗？</em>",
        "<strong>多数想要扛不过这个问题。</strong>少数能扛过 —— 而那些是<em>极其</em>有价值的，因为它们被你审计过了。其他的，可以悄悄放下。"
      ]
    }
  },
  autopilot: {
    q: { en: "I'm running on autopilot.", zh: "我在自动驾驶。" },
    a: {
      en: [
        "<strong>Autopilot is the default state.</strong> Most behavior, most thoughts, most reactions are running scripts that were installed before you could vote on them. The fact that you <em>noticed</em> is itself unusual.",
        "<div class='question'>Where in your day does autopilot run longest — and what is the cue that turns it on?</div>",
        "<strong>The first move is not to fight it.</strong> It's to <em>name the cue</em>. Morning phone-grab. 3pm scroll. Late-night news loop. Each cue is a door — and you can't choose what to do at the door until you can see the door.",
        "<strong>Once you can name three cues</strong> reliably for a week, pick one. Insert a 60-second pause between cue and action. Don't try to do the right thing yet — just see what happens when the script can't run unimpeded."
      ],
      zh: [
        "<strong>自动驾驶是默认状态。</strong>多数行为、想法、反应都在跑一些“在你能投票之前就被安装好”的脚本。你<em>察觉到了</em>这件事本身已经不寻常。",
        "<div class='question'>你一天里自动驾驶最长的那段是什么时候 —— 把它打开的“线索”是什么？</div>",
        "<strong>第一步不是对抗它，</strong>是<em>命名那个线索</em>。早上抓手机；下午三点开始刷；深夜资讯循环。每个线索都是一扇门 —— 在你能看见这扇门之前，你无法选择“在门口做什么”。",
        "<strong>当你能可靠地命名三个线索一周后，</strong>挑一个。在线索与动作之间插入 60 秒的暂停。不要急着去做“对的事” —— 先看看：当脚本无法畅通运行时，会发生什么。"
      ]
    }
  },
  parts: {
    q: { en: "Parts of me disagree with each other.", zh: "我内在的几部分彼此不合。" },
    a: {
      en: [
        "<strong>This is good news, even if it doesn't feel like it.</strong> The parts disagreeing means you can <em>see</em> them. Most people don't — they just experience whatever part fired loudest as 'me'.",
        "<div class='question'>Of the parts in conflict, which is younger? Which is older? What is each one protecting against?</div>",
        "<strong>Most parts are not enemies.</strong> They're old strategies still running — usually because no one has ever told them they could stand down. Yelling at them or trying to delete them strengthens them.",
        "<strong>Try a conversation instead.</strong> Ask the louder part what it wants. Ask the quieter part what it needs. You become the chair, not a participant. The energy that was spent on internal war becomes available for the external one."
      ],
      zh: [
        "<strong>这其实是好消息 —— 即使感觉不像。</strong>各部分在分歧，意味着你能<em>看见</em>它们。多数人看不见 —— 他们只是把“声音最大的那个部分”当作“我”来体验。",
        "<div class='question'>在冲突的几个部分里，哪一个更年轻？哪一个更老？每一个在防御什么？</div>",
        "<strong>多数部分并不是敌人。</strong>它们是仍在运行的旧策略 —— 通常是因为从来没有人告诉过它们“可以下岗了”。对它们吼，或试图删掉它们，反而会让它们更强。",
        "<strong>试着对话。</strong>问那个大声的部分：“你想要什么？” 问那个安静的部分：“你需要什么？” 你成为<em>主持者</em>，不是参与者。原本被消耗在“内战”上的能量，会被释放到外部的事上。"
      ]
    }
  },
  agency: {
    q: { en: "I want agency but I keep waiting.", zh: "我想要主体性，但我一直在等。" },
    a: {
      en: [
        "<strong>Waiting is a strategy that worked once.</strong> Earlier in life, somewhere, agency cost you — and the system learned: don't decide, don't choose, don't visibly want, and you'll be safe.",
        "<div class='question'>Was there a moment, earlier in your life, where openly wanting something was punished or shamed?</div>",
        "<strong>The repair is small, repeated acts of authorship.</strong> Not 'design my life' yet. Just: choose what you eat for breakfast on purpose. Choose the music. Pick the chair. Tiny, frequent, deliberate.",
        "<strong>The nervous system has to relearn that wanting is safe</strong> before bigger choices come back online. They have to come downstream of the small ones — or the system won't believe you, and won't release the energy you need."
      ],
      zh: [
        "<strong>“等”是一个曾经奏效的策略。</strong>更早的某个时刻，“主动”曾让你付出代价，于是系统学到：不决定、不选择、不<em>显著地</em>想要 —— 这样会更安全。",
        "<div class='question'>更早一些，是不是有过这样的时刻：你公开地“想要”什么，结果被惩罚或被羞辱？</div>",
        "<strong>修复是一连串“小幅度的、反复的”自主行为。</strong>不是“设计我的人生”，是：今天的早餐有意识地选；选哪首歌；坐哪把椅子。小、频繁、刻意。",
        "<strong>神经系统要先重新学到“想要是安全的”，</strong>更大的选择才会重新上线。它们必须在小决定的下游 —— 否则系统不会信你，也不会释放你真正去动所需要的能量。"
      ]
    }
  },
  meaning: {
    q: { en: "Nothing feels meaningful anymore.", zh: "什么都让我觉得没意义。" },
    a: {
      en: [
        "<strong>Be careful with this one.</strong> 'Nothing feels meaningful' has at least three different roots, and they need different responses.",
        "<div class='question'>Is your sleep below 6.5h for the past month? Are you isolated? Has anything you cared about ended without being grieved?</div>",
        "<strong>If sleep, isolation, or unmourned loss is the answer,</strong> meaning is downstream of those. No amount of philosophy fixes a tired, lonely, or grieving system. Address those first; meaning will partly return on its own.",
        "<strong>If none of the three apply, the question is real.</strong> In that case the answer almost always lives in <em>doing something for someone specific</em>, in person, this week. Meaning is not an idea you find by thinking. It's a byproduct of contact."
      ],
      zh: [
        "<strong>这一题要小心。</strong>“什么都没意义”至少有三种不同的根，需要不同的回应。",
        "<div class='question'>过去一个月你的睡眠是不是低于 6.5 小时？你是不是处于孤立中？有什么你在乎过的事悄悄结束了，但没有被哀悼？</div>",
        "<strong>如果是睡眠、孤立或未被哀悼的失去 —— </strong>意义就在它们的下游。哲学修不好一个疲惫、孤独或哀伤的系统。先处理那些，意义会自动回来一部分。",
        "<strong>如果三个都不是，这个问题就是真问题了。</strong>那么答案<em>几乎总是</em>住在这里：本周内，<em>当面</em>，为一个具体的人做一件具体的事。意义不是靠想找到的概念 —— 是接触的副产物。"
      ]
    }
  }
};

const stream = document.getElementById("guide-stream");
function pushMsg(role, en, zh) {
  const msg = document.createElement("div");
  msg.className = "msg" + (role === "user" ? " user" : "");
  msg.innerHTML = `
    <div class="role">${role === "user"
      ? '<span lang="en">You</span><span lang="zh">你</span>'
      : '<span lang="en">Guide</span><span lang="zh">引导</span>'}</div>
    <div class="bubble">
      <div lang="en">${en}</div>
      <div lang="zh">${zh}</div>
    </div>
  `;
  stream.appendChild(msg);
  stream.scrollTo({ top: stream.scrollHeight, behavior: "smooth" });
}
function answer(key) {
  const item = GUIDE[key];
  if (!item) return;
  pushMsg("user", item.q.en, item.q.zh);
  setTimeout(() => {
    const wrap = arr => arr.map(p => p.startsWith("<div") ? p : `<p>${p}</p>`).join("");
    pushMsg("guide", wrap(item.a.en), wrap(item.a.zh));
  }, 320);
}
document.querySelectorAll(".guide-pill").forEach(p =>
  p.addEventListener("click", () => answer(p.dataset.q)));

document.getElementById("guide-send").addEventListener("click", sendCustom);
document.getElementById("guide-input").addEventListener("keydown", e => {
  if (e.key === "Enter") sendCustom();
});
function sendCustom() {
  const input = document.getElementById("guide-input");
  const text = input.value.trim();
  if (!text) return;
  pushMsg("user", text, text);
  input.value = "";
  const t = text.toLowerCase();
  let key = null;
  if (/(want.*not mine|desire.*not mine|programmed|inherited.*want)/.test(t) || /想要.*不像|不像我的|被植入|被植入/.test(text)) key = "not-mine";
  else if (/(autopilot|reflex|automatic|don't notice|on autopilot)/.test(t) || /自动|反射|不自觉|没意识/.test(text)) key = "autopilot";
  else if (/(parts.*disagree|conflict|two minds|split|disagree.*myself)/.test(t) || /分裂|矛盾|分歧|内在冲突|两个我/.test(text)) key = "parts";
  else if (/(agency|waiting|permission|drift|passive)/.test(t) || /主体性|等|被动|许可|漂/.test(text)) key = "agency";
  else if (/(meaning|empty|pointless|no purpose|nothing matters)/.test(t) || /意义|空虚|没意思|没意义|麻木/.test(text)) key = "meaning";

  if (key) {
    setTimeout(() => {
      const item = GUIDE[key];
      const wrap = arr => arr.map(p => p.startsWith("<div") ? p : `<p>${p}</p>`).join("");
      pushMsg("guide", wrap(item.a.en), wrap(item.a.zh));
    }, 320);
  } else {
    setTimeout(() => {
      pushMsg("guide",
        "<p>Help me get more specific. <strong>One scene from this week</strong> — not a summary, an actual moment — where this showed up. Patterns hide in scenes, not in summaries.</p>",
        "<p>再给我一个更具体的东西。本周里<strong>一个场景</strong> —— 不是总结，是一个真实的瞬间 —— 这件事在哪里冒出来。模式藏在场景里，不在总结里。</p>"
      );
    }, 320);
  }
}

// ============ Reveal on scroll ============
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll(".section-head, .force-item, .observer, .gate, .narrative, .stage, .env-cell, .thinking-cell, .dash-cell").forEach(el => {
  el.classList.add("fade-in");
  io.observe(el);
});
