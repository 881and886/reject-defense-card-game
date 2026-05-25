import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RotateCcw, Sparkles, BookOpen, Skull, Lock } from 'lucide-react';
import { characters, events, resultText } from './gameData';
import './style.css';

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const playableCharacters = characters.filter((c) => c.playable);
const bossCharacters = characters.filter((c) => !c.playable);

function resolveChoice(event, skillId) {
  if (event.secret?.includes(skillId)) return 'PERFECT';
  if (event.best?.includes(skillId)) return skillId === 'reject' ? 'REJECT' : 'PERFECT';
  if (event.good?.includes(skillId)) return 'PASS';
  if (event.risky?.includes(skillId)) return Math.random() > 0.45 ? 'HARD_PASS' : 'COLLAPSE';
  return Math.random() > 0.5 ? 'HARD_PASS' : 'COLLAPSE';
}

function resultLine(character, skill, event, result) {
  const lines = {
    chen: {
      PERFECT: '陳研究生的黑眼圈發出金光：這不是修正，這是反擊。',
      REJECT: '巨大紅色印章落下：不予通過，請重新構思你的指導邏輯。',
      PASS: '陳研究生喘了一口氣：至少這週還沒有死。',
      HARD_PASS: '陳研究生硬撐到凌晨三點，成功但不想再說話。',
      COLLAPSE: '陳研究生看著螢幕，開始懷疑自己是不是被論文寫了。',
    },
    shihan: {
      PERFECT: '詩涵推了推眼鏡，全場瞬間安靜，問題被壓制在原地。',
      PASS: '詩涵穩穩扛住壓力，研究室暫時恢復秩序。',
      HARD_PASS: '詩涵咬牙撐住，但二頭肌開始微微顫抖。',
      COLLAPSE: '場面太亂，連班導威壓都被群組通知淹沒。',
      REJECT: '詩涵把事件按在地上：先安靜，再退件。',
    },
    shuya: {
      PERFECT: '書雅微笑：問題不是不能解，只是你們沒有看見真正的結構。',
      PASS: '書雅完成分析，大家終於知道下一步該往哪裡走。',
      HARD_PASS: '書雅指出一條路，但路上仍然長滿APA格式荊棘。',
      COLLAPSE: '書雅沉默三秒：這個問題，比想像中還沒有邏輯。',
      REJECT: '書雅冷靜補刀：這份提案的邏輯確實不成立。',
    },
    laomo: {
      PERFECT: '老莫喝了一口18天：放空以後，答案自己浮出來了。',
      PASS: '老莫宣布下班，事件因為沒有人理它而逐漸消失。',
      HARD_PASS: '老莫的叛逆火花引發小爆炸，但至少炸出了一條路。',
      COLLAPSE: '老莫點燃叛逆火花，結果整個研究室一起炎上。',
      REJECT: '老莫冷笑：這種東西，我以前看多了。退件。',
    },
  };
  return lines[character.id]?.[result] || `${character.name}使用《${skill.name}》處理了「${event.title}」。`;
}

function CharacterImageCard({ c, onClick, disabled = false }) {
  const content = (
    <>
      <div className="imageWrap">
        <img src={c.image} alt={c.name} />
        {!c.playable && <div className="locked"><Lock size={16} />事件Boss</div>}
      </div>
      <div className="characterInfo">
        <h3>{c.name}</h3>
        <h4>{c.title}</h4>
        <p className="styleTag">{c.style}</p>
        <div className="skillsMini">
          {c.skills.map((s) => <span key={s.id}>{s.name}</span>)}
        </div>
      </div>
    </>
  );

  if (disabled) {
    return <div className="card characterCard disabledCard">{content}</div>;
  }

  return <button className="card characterCard" onClick={onClick}>{content}</button>;
}

function App() {
  const [screen, setScreen] = useState('home');
  const [character, setCharacter] = useState(null);
  const [event, setEvent] = useState(null);
  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(1);
  const [result, setResult] = useState(null);

  const ending = useMemo(() => {
    if (history.length < 8) return null;
    const collapses = history.filter((h) => h.result === 'COLLAPSE').length;
    const perfects = history.filter((h) => h.result === 'PERFECT' || h.result === 'REJECT').length;
    if (collapses >= 3) return 'Bad End：研究題目失蹤';
    if (perfects >= 5) return 'Good End：華衫論壇主場見';
    return 'Normal End：延畢一年，但還活著';
  }, [history]);

  function startWith(c) {
    if (!c.playable) return;
    setCharacter(c);
    setEvent(pickRandom(events));
    setHistory([]);
    setRound(1);
    setResult(null);
    setScreen('game');
  }

  function chooseSkill(skill) {
    const r = resolveChoice(event, skill.id);
    const record = { round, eventTitle: event.title, skill: skill.name, result: r };
    setResult({ type: r, skill, line: resultLine(character, skill, event, r) });
    setHistory((prev) => [...prev, record]);
  }

  function nextRound() {
    setRound((r) => r + 1);
    setEvent(pickRandom(events));
    setResult(null);
  }

  function reset() {
    setScreen('home');
    setCharacter(null);
    setEvent(null);
    setHistory([]);
    setRound(1);
    setResult(null);
  }

  if (screen === 'home') {
    return (
      <main className="app">
        <section className="hero">
          <div className="badge">611研究室 v1.3</div>
          <h1>因為不想改論文<br />我把技能全加在退件防禦了</h1>
          <p>事件相剋型生存卡牌遊戲。選擇角色，用三個技能撐過隨機事件，活著抵達華衫論壇。</p>
        </section>

        <div className="sectionTitle">
          <h2>選擇角色</h2>
          <p>瑪莉教授目前作為事件 Boss，不開放選擇。</p>
        </div>

        <div className="characterGrid playableGrid">
          {playableCharacters.map((c) => (
            <CharacterImageCard key={c.id} c={c} onClick={() => startWith(c)} />
          ))}
        </div>

        <div className="sectionTitle bossTitle">
          <h2>事件 Boss</h2>
        </div>
        <div className="characterGrid bossGrid">
          {bossCharacters.map((c) => (
            <CharacterImageCard key={c.id} c={c} disabled />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <strong>{character.name}</strong><span>｜{character.title}</span>
        </div>
        <button className="ghost" onClick={reset}><RotateCcw size={16} />重新開始</button>
      </header>

      {ending ? (
        <section className="panel ending">
          <Skull size={42} />
          <h1>{ending}</h1>
          <p>你完成了 8 回合研究生生存挑戰。</p>
          <button className="primary" onClick={reset}>回首頁</button>
        </section>
      ) : (
        <div className="gameLayout">
          <aside className="playerSidebar">
            <img src={character.image} alt={character.name} />
            <div className="sidebarText">
              <h2>{character.name}</h2>
              <p>{character.title}</p>
              <small>「{character.quote}」</small>
            </div>
          </aside>

          <section className="gameMain">
            <section className="panel eventPanel">
              <div className="round">第 {round} 週事件</div>
              <h1>{event.title}</h1>
              <p>{event.text}</p>
            </section>

            {!result ? (
              <section className="skillsGrid">
                {character.skills.map((skill) => (
                  <button className="card skillCard" key={skill.id} onClick={() => chooseSkill(skill)}>
                    <Sparkles size={24} />
                    <h3>{skill.name}</h3>
                    <p>{skill.desc}</p>
                  </button>
                ))}
              </section>
            ) : (
              <section className={`panel result ${result.type.toLowerCase()}`}>
                <BookOpen size={34} />
                <h2>{result.type}</h2>
                <p className="resultText">{resultText[result.type]}</p>
                <p className="line">{result.line}</p>
                <button className="primary" onClick={nextRound}>進入下一週</button>
              </section>
            )}

            <section className="history">
              <h3>本局紀錄</h3>
              {history.length === 0 ? <p>尚未行動。</p> : history.map((h, i) => (
                <div key={i} className="historyItem">第{h.round}週｜{h.eventTitle} → {h.skill}｜{h.result}</div>
              ))}
            </section>
          </section>
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
