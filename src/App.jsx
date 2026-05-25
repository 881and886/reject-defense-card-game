import React, { useMemo, useState } from 'react';
import { RotateCcw, Sparkles, BookOpen, Lock } from 'lucide-react';
import { characters, events, resultText } from './gameData';
import endingOverview from './assets/endings/ending-overview.png';
import './style.css';

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);
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

  if (disabled) return <div className="card characterCard disabledCard">{content}</div>;
  return <button className="card characterCard" onClick={onClick}>{content}</button>;
}

function getEnding(history) {
  if (history.length < 8) return null;

  const counts = history.reduce((acc, h) => {
    acc[h.result] = (acc[h.result] || 0) + 1;
    return acc;
  }, {});

  const strongWins = (counts.PERFECT || 0) + (counts.REJECT || 0);
  const collapses = counts.COLLAPSE || 0;
  const hardPasses = counts.HARD_PASS || 0;

  if (strongWins >= 5) {
    return {
      key: 'pass',
      title: '論文通過｜順利畢業',
      subtitle: '你終於逃離611研究室。',
      quote: '「終於……自由了！」',
    };
  }

  if (collapses >= 3) {
    return {
      key: 'collapse',
      title: '研究崩潰｜精神炸裂',
      subtitle: '論文開始反過來寫你。',
      quote: '「我還要再改多久……？」',
    };
  }

  if (hardPasses >= 4) {
    return {
      key: 'dropout',
      title: '受不了壓榨｜選擇退學',
      subtitle: '你離開了這場無止盡的壓力。',
      quote: '「我才不要一輩子當研究生！」',
    };
  }

  return {
    key: 'reject',
    title: '論文沒通過｜延後畢業',
    subtitle: '下一次，再努力一點吧……',
    quote: '「再改一次就好……再改一次就好……」',
  };
}

function EndingScreen({ ending, onReset }) {
  const slots = [
    { key: 'reject', left: '2.4%', color: '#ef4444' },
    { key: 'pass', left: '26.1%', color: '#f5c542' },
    { key: 'dropout', left: '49.8%', color: '#7c8cff' },
    { key: 'collapse', left: '73.5%', color: '#b45cff' },
  ];

  return (
    <section style={styles.endingPanel}>
      <div style={styles.endingHeader}>
        <h1 style={styles.endingTitle}>{ending.title}</h1>
        <p style={styles.endingSubtitle}>{ending.subtitle}</p>
      </div>

      <div style={styles.imageStage}>
        <img src={endingOverview} alt="挑戰結果" style={styles.endingImage} />
        {slots.map((slot) => {
          const active = slot.key === ending.key;
          return (
            <div
              key={slot.key}
              style={{
                ...styles.endingSlot,
                left: slot.left,
                opacity: active ? 1 : 0.62,
                background: active ? 'transparent' : 'rgba(0,0,0,0.62)',
                border: active ? `3px solid ${slot.color}` : '1px solid rgba(255,255,255,0.05)',
                boxShadow: active ? `0 0 34px ${slot.color}, inset 0 0 24px ${slot.color}44` : 'none',
                transform: active ? 'scale(1.015)' : 'scale(1)',
                zIndex: active ? 3 : 2,
              }}
            />
          );
        })}
      </div>

      <p style={styles.endingQuote}>{ending.quote}</p>
      <button className="primary" onClick={onReset}>回首頁</button>
    </section>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [character, setCharacter] = useState(null);
  const [event, setEvent] = useState(null);
  const [eventDeck, setEventDeck] = useState([]);
  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(1);
  const [result, setResult] = useState(null);

  const ending = useMemo(() => getEnding(history), [history]);

  function startWith(c) {
    if (!c.playable) return;
    const deck = shuffleArray(events);
    setCharacter(c);
    setEvent(deck[0]);
    setEventDeck(deck.slice(1));
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
    setEventDeck((deck) => {
      const freshDeck = deck.length > 0 ? deck : shuffleArray(events);
      setEvent(freshDeck[0]);
      return freshDeck.slice(1);
    });
    setResult(null);
  }

  function reset() {
    setScreen('home');
    setCharacter(null);
    setEvent(null);
    setEventDeck([]);
    setHistory([]);
    setRound(1);
    setResult(null);
  }

  if (screen === 'home') {
    return (
      <main className="app">
        <section className="hero">
          <div className="badge">611研究室 v1.5</div>
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
        <EndingScreen ending={ending} onReset={reset} />
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

const styles = {
  endingPanel: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '24px',
    textAlign: 'center',
  },
  endingHeader: {
    marginBottom: '18px',
  },
  endingTitle: {
    margin: 0,
    color: '#f5d06f',
    fontSize: 'clamp(28px, 5vw, 52px)',
    letterSpacing: '0.06em',
  },
  endingSubtitle: {
    color: '#d8c7a0',
    fontSize: '18px',
  },
  imageStage: {
    position: 'relative',
    width: '100%',
    border: '1px solid rgba(245, 208, 111, 0.45)',
    borderRadius: '18px',
    overflow: 'hidden',
    background: '#050505',
  },
  endingImage: {
    width: '100%',
    display: 'block',
  },
  endingSlot: {
    position: 'absolute',
    top: '13.5%',
    width: '23.4%',
    height: '74%',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
  },
  endingQuote: {
    margin: '20px auto',
    color: '#f3d27a',
    fontSize: '22px',
    fontWeight: 700,
  },
};
