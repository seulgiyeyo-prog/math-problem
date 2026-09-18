// ============================================================
//  창의 수학 문제집 — 메인 앱 (app.js)
//  - "최종 채점 대상" 완전 제거: 모든 소문제 개별 채점 & 점수 부여
//  - 소문제별 정답 판정 & 교사용 정답 완벽 지원
// ============================================================

// ── 소문제별 배점, 정답 기준 및 교사용 정답 데이터 ────────────────────────
const SUB_CONFIG = {
  1: {
    1: { points: 10, answer: "15", valids: ["15"] },
    2: { points: 10, answer: "5 (가운데)", valids: ["5", "5 (가운데)", "가운데 5", "숫자 5"] },
    3: { points: 10, answer: "2, 7, 6 / 9, 5, 1 / 4, 3, 8", valids: ["완성", "5", "확인", "성공", "15", "2, 7, 6 / 9, 5, 1 / 4, 3, 8", "마방진"] }
  },
  2: {
    1: { points: 10, answer: "A, C 모순 발생 / B 거짓말 시 성립", valids: ["b", "성립", "모순", "확인", "b만 거짓말", "b가 거짓말쟁이", "b 거짓말"] },
    2: { points: 10, answer: "B", valids: ["b", "b가 거짓말쟁이"] }
  },
  3: {
    1: { points: 10, answer: "1, 4, 9", valids: ["1, 4, 9", "1,4,9", "1 4 9", "1, 4, 9개", "1,4,9 (3개)"] },
    2: { points: 10, answer: "10개", valids: ["10", "10개"] },
    3: { points: 10, answer: "제곱수 (쌍이 없는 제곱근 약수)", valids: ["제곱수", "완전제곱수", "제곱", "쌍"] }
  },
  4: {
    1: { points: 10, answer: "72개 (LCM(18, 24) = 72)", valids: ["72", "72개"] },
    2: { points: 10, answer: "A: 4바퀴, B: 3바퀴", valids: ["4, 3", "4,3", "4 3", "4바퀴 3바퀴", "4", "3", "a: 4, b: 3", "a 4, b 3", "4바퀴, 3바퀴"] },
    3: { points: 10, answer: "360개 (LCM(18, 24, 30) = 360)", valids: ["360", "360개"] }
  },
  5: {
    1: { points: 10, answer: "2.4초 (12/5초)", valids: ["2.4", "2.4초", "12/5", "12/5초"] },
    2: { points: 10, answer: "-2.2 (또는 -11/5)", valids: ["-2.2", "-11/5", "-2.2 지점"] },
    3: { points: 10, answer: "-11/12", valids: ["-11/12", "-5.5", "-5.5초"] }
  },
  6: {
    1: { points: 10, answer: "p=3 또는 p=11", valids: ["3", "11", "17", "소수", "19", "가능"] },
    2: { points: 10, answer: "19", valids: ["19"] },
    3: { points: 10, answer: "2+2=4(합성수)가 되므로 불가", valids: ["합성수", "짝수", "4", "2+2=4", "소수가 아님"] }
  },
  7: {
    1: { points: 10, answer: "1275", valids: ["1275"] },
    2: { points: 10, answer: "47", valids: ["47"] },
    3: { points: 10, answer: "23, 24", valids: ["23, 24", "23,24", "23 24", "23과 24", "22, 23", "22,23", "22과 23"] }
  },
  8: {
    1: { points: 10, answer: "1, 3, 6, 10개", valids: ["1, 3, 6, 10", "1,3,6,10", "10", "1 3 6 10"] },
    2: { points: 10, answer: "n(n-1)/2", valids: ["n(n-1)/2", "n*(n-1)/2", "n(n-1)÷2"] },
    3: { points: 10, answer: "15", valids: ["15"] }
  },
  9: {
    1: { points: 10, answer: "x = 8 또는 x = -2", valids: ["8, -2", "8,-2", "-2, 8", "-2,8", "8과 -2", "-2와 8", "8", "-2"] },
    2: { points: 10, answer: "x = -5 또는 x = 1", valids: ["-5, 1", "-5,1", "1, -5", "1,-5", "1", "-5"] },
    3: { points: 10, answer: "-1 (또는 5)", valids: ["-1", "-1, 5", "-1,5", "-1과 5", "5"] }
  },
  10: {
    1: { points: 10, answer: "3개", valids: ["3", "3개"] },
    2: { points: 10, answer: "n(n-1)/2", valids: ["n(n-1)/2", "n*(n-1)/2", "n(n-1)÷2"] },
    3: { points: 10, answer: "15개", valids: ["15", "15개"] }
  },
  11: {
    1: { points: 10, answer: "110880", valids: ["110880", "110,880"] },
    2: { points: 10, answer: "불가능 (6자리 수)", valids: ["불가능", "안됨", "아니다", "x", "아니오", "no", "6자리"] },
    3: { points: 10, answer: "기념일 소인수분해 확인", valids: ["확인", "완료", "성공", "제출", "소인수분해"] }
  },
  12: {
    1: { points: 20, answer: "95°", valids: ["95", "95°"] }
  },
  13: {
    1: { points: 10, answer: "11개", valids: ["11", "11개"] },
    2: { points: 10, answer: "9개", valids: ["9", "9개"] },
    3: { points: 10, answer: "7개", valids: ["7", "7개"] }
  },
  14: {
    1: { points: 10, answer: "A=4kg, B=10kg, C=7kg", valids: ["4, 10, 7", "4,10,7", "a=4, b=10, c=7", "4 10 7", "4, 10, 7kg"] },
    2: { points: 10, answer: "21kg", valids: ["21", "21kg", "42"] },
    3: { points: 10, answer: "18kg", valids: ["18", "18kg"] }
  },
  15: {
    1: { points: 10, answer: "5/1", valids: ["5/1", "5", "3/4"] },
    2: { points: 10, answer: "24번째", valids: ["24", "24번째"] },
    3: { points: 10, answer: "군수열에 유한 순번 대응", valids: ["유한", "군수열", "자연수", "대응"] }
  },
  16: {
    1: { points: 10, answer: "최솟값 8", valids: ["8", "15", "10", "최소 8"] },
    2: { points: 10, answer: "8", valids: ["8"] },
    3: { points: 10, answer: "중앙값 5에서의 거리 합", valids: ["거리", "중앙값", "5"] }
  },
  17: {
    1: { points: 10, answer: "0", valids: ["0"] },
    2: { points: 10, answer: "3", valids: ["3"] },
    3: { points: 10, answer: "5", valids: ["5"] },
    4: { points: 10, answer: "PM=3, MQ=2", valids: ["3, 2", "3,2", "3 2", "pm=3, mq=2"] }
  },
  18: {
    1: { points: 10, answer: "n(n-1)/2 + 1", valids: ["n(n-1)/2+1", "n(n-1)/2 + 1"] },
    2: { points: 10, answer: "175", valids: ["175"] },
    3: { points: 10, answer: "8번째 줄", valids: ["8", "8번째", "8번째 줄", "9", "9번째"] }
  },
  19: {
    1: { points: 10, answer: "180°", valids: ["180", "180°"] },
    2: { points: 10, answer: "36°", valids: ["36", "36°"] },
    3: { points: 10, answer: "180°", valids: ["180", "180°"] }
  },
  20: {
    1: { points: 10, answer: "2, 3, 5, 7의 공배수", valids: ["공배수", "210의 배수", "210", "배수"] },
    2: { points: 15, answer: "211, 421, 631, 841", valids: ["211, 421, 631, 841", "211,421,631,841", "4개"] },
    3: { points: 15, answer: "2104", valids: ["2104", "1471"] }
  }
};

// ── 상태 관리 ──────────────────────────────
const state = {
  solved: {},          // 완료된 문제 { [id]: true }
  solvedSubParts: {},  // 완료된 소문제 { ["id-part"]: true }
  incorrect: {},
  hintShown: {},
  subAnswers: {},      // 학생 입력값 { [id]: { [part]: string } }
  totalScore: 0,
  currentProblemId: null,
  teacherMode: false,
};

// 로컬 스토리지 불러오기
try {
  const s = localStorage.getItem('math_solved');
  if (s) state.solved = JSON.parse(s);
  const sp = localStorage.getItem('math_solved_subparts');
  if (sp) state.solvedSubParts = JSON.parse(sp);
  const inc = localStorage.getItem('math_incorrect');
  if (inc) state.incorrect = JSON.parse(inc);
  const sc = localStorage.getItem('math_score');
  if (sc) state.totalScore = parseInt(sc, 10) || 0;
  const sub = localStorage.getItem('math_sub_answers');
  if (sub) state.subAnswers = JSON.parse(sub);
} catch (e) {}

function saveState() {
  try {
    localStorage.setItem('math_solved', JSON.stringify(state.solved));
    localStorage.setItem('math_solved_subparts', JSON.stringify(state.solvedSubParts));
    localStorage.setItem('math_incorrect', JSON.stringify(state.incorrect));
    localStorage.setItem('math_score', state.totalScore.toString());
    localStorage.setItem('math_sub_answers', JSON.stringify(state.subAnswers));
  } catch (e) {}
}

function _verifyTeacher(input) {
  try { return btoa(input.trim()) === 'MDczMA=='; } catch(e) { return false; }
}

function renderStars(difficulty) {
  const colors = ['', '#4ade80', '#22d3ee', '#fb923c', '#f472b6'];
  const labels = ['', '기본', '중급', '심화', '도전'];
  let stars = '';
  for (let i = 1; i <= 4; i++) {
    stars += `<span class="diff-star" style="color:${i <= difficulty ? colors[difficulty] : '#333'}">${i <= difficulty ? '★' : '☆'}</span>`;
  }
  return `<span title="${labels[difficulty]}">${stars}</span>`;
}

function getSubPartCount(problem) {
  const matches = problem.problem.match(/<strong>\(\d+\)<\/strong>/g);
  return matches ? matches.length : 0;
}

const normalize = s => s.toLowerCase().replace(/\s/g, '').replace(/,/g, '');

// ── 소문제 채점 로직 ──────────────────────
function gradeSubPart(problemId, partNum) {
  const key = `${problemId}-${partNum}`;
  if (state.solvedSubParts[key] || state.teacherMode) return;

  const inputEl = document.getElementById(`subAnswer-${partNum}`);
  if (!inputEl) return;

  const userVal = inputEl.value.trim();
  if (!userVal) {
    inputEl.focus();
    inputEl.style.borderColor = '#f472b6';
    setTimeout(() => { inputEl.style.borderColor = ''; }, 1000);
    return;
  }

  const problem = PROBLEMS.find(p => p.id === problemId);
  const conf = (SUB_CONFIG[problemId] && SUB_CONFIG[problemId][partNum]) || null;
  const normUser = normalize(userVal);

  let isCorrect = false;
  if (conf && conf.valids) {
    isCorrect = conf.valids.some(v => {
      const nv = normalize(v);
      return nv === normUser || (normUser.length >= 2 && nv.includes(normUser));
    });
  } else if (problem) {
    isCorrect = problem.answers.some(a => normalize(a) === normUser);
  }

  const points = conf ? conf.points : 10;
  const rowEl = document.getElementById(`subRow-${partNum}`);
  const statusEl = document.getElementById(`subStatus-${partNum}`);

  if (isCorrect) {
    state.solvedSubParts[key] = true;
    state.totalScore += points;
    saveState();

    if (rowEl) {
      rowEl.style.borderColor = '#34d399';
      rowEl.style.background = 'rgba(52, 211, 153, 0.12)';
    }
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#34d399;font-weight:bold;font-size:0.8rem;">✅ 정답 (+${points}점)</span>`;
    }
    inputEl.disabled = true;

    // 모든 소문제 해결 여부 검사
    const subCount = getSubPartCount(problem);
    const totalParts = subCount === 0 ? 1 : subCount;
    let allDone = true;
    for (let p = 1; p <= totalParts; p++) {
      if (!state.solvedSubParts[`${problemId}-${p}`]) {
        allDone = false;
        break;
      }
    }

    if (allDone) {
      state.solved[problemId] = true;
      delete state.incorrect[problemId];
      saveState();
      launchConfetti();
      addMarioGameButton();
      const sol = document.getElementById('solutionSection');
      if (sol) {
        sol.classList.add('visible');
        document.getElementById('solutionText').innerHTML = problem.solution;
      }
    }

    updateStats();
  } else {
    state.incorrect[problemId] = true;
    saveState();
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#f87171;font-size:0.75rem;font-weight:bold;">❌ 다시 생각해보세요</span>`;
    }
  }
}

// ── 모달 내 소문제별 입력 UI 빌드 ──────────
function buildSubAnswers(problem) {
  const container = document.getElementById('subAnswersContainer');
  container.innerHTML = '';

  const subCount = getSubPartCount(problem);
  const totalParts = subCount === 0 ? 1 : subCount;
  const savedNotes = state.subAnswers[problem.id] || {};

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;';
  header.innerHTML = `
    <span style="font-size:0.9rem;font-weight:bold;color:#cbd5e1;">✏️ 소문제별 답안 입력 & 채점</span>
    <span style="font-size:0.75rem;color:#818cf8;">모든 소문제에 점수가 부여됩니다</span>
  `;
  container.appendChild(header);

  for (let i = 1; i <= totalParts; i++) {
    const key = `${problem.id}-${i}`;
    const isSolved = !!state.solvedSubParts[key];
    const conf = (SUB_CONFIG[problem.id] && SUB_CONFIG[problem.id][i]) || { points: 10, answer: problem.answer };
    const teacherAns = conf.answer;

    const row = document.createElement('div');
    row.id = `subRow-${i}`;
    row.className = 'sub-answer-row';
    row.style.cssText = `
      padding: 12px 14px;
      margin-bottom: 10px;
      border-radius: 12px;
      background: ${isSolved ? 'rgba(52, 211, 153, 0.1)' : '#0f172a'};
      border: 1px solid ${isSolved ? '#34d399' : '#334155'};
      transition: all 0.2s;
    `;

    row.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-weight:bold;color:#a5b4fc;font-family:monospace;">${subCount > 0 ? `(${i})번 문제` : '답안'}</span>
          <span style="font-size:0.7rem;font-weight:bold;color:#fbbf24;background:rgba(251,191,36,0.15);padding:2px 8px;border-radius:999px;">🏅 ${conf.points}점</span>
        </div>
        <div id="subStatus-${i}">
          ${isSolved ? `<span style="color:#34d399;font-weight:bold;font-size:0.8rem;">✅ 정답 (+${conf.points}점)</span>` : (state.teacherMode ? '<span style="color:#4ade80;font-size:0.75rem;">선생님 확인용</span>' : '')}
        </div>
      </div>

      <div style="display:flex;gap:8px;">
        <input
          type="text"
          id="subAnswer-${i}"
          class="answer-input"
          style="margin:0;flex:1;padding:8px 12px;font-size:0.85rem;"
          value="${savedNotes[i] || ''}"
          placeholder="${isSolved ? '정답을 맞혔습니다!' : `(${i})번의 답을 입력하세요`}"
          ${isSolved || state.teacherMode ? 'disabled' : ''}
          autocomplete="off"
        />
        ${!isSolved && !state.teacherMode ? `
          <button type="button" class="sub-grade-btn" data-part="${i}" style="padding:8px 14px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-size:0.8rem;font-weight:bold;cursor:pointer;">
            채점
          </button>
        ` : ''}
      </div>

      ${state.teacherMode && teacherAns ? `
        <div style="margin-top:6px;padding:6px 10px;border-radius:6px;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);color:#4ade80;font-size:0.75rem;font-weight:bold;">
          🟢 교사용 정답: ${teacherAns}
        </div>
      ` : ''}
    `;

    container.appendChild(row);

    const inputEl = row.querySelector(`#subAnswer-${i}`);
    if (inputEl) {
      inputEl.addEventListener('input', () => {
        if (!state.subAnswers[problem.id]) state.subAnswers[problem.id] = {};
        state.subAnswers[problem.id][i] = inputEl.value;
        saveState();
      });
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          gradeSubPart(problem.id, i);
        }
      });
    }

    const btn = row.querySelector('.sub-grade-btn');
    if (btn) {
      btn.addEventListener('click', () => gradeSubPart(problem.id, i));
    }
  }

  // 전체 일괄 채점 버튼
  if (!state.teacherMode) {
    const batchBtn = document.createElement('button');
    batchBtn.type = 'button';
    batchBtn.style.cssText = 'width:100%;margin-top:8px;padding:10px;border-radius:10px;background:linear-gradient(to right, #6366f1, #8b5cf6, #06b6d4);color:#fff;border:none;font-weight:bold;font-size:0.85rem;cursor:pointer;';
    batchBtn.textContent = '⚡ 전체 소문제 일괄 채점하기';
    batchBtn.addEventListener('click', () => {
      for (let i = 1; i <= totalParts; i++) {
        gradeSubPart(problem.id, i);
      }
    });
    container.appendChild(batchBtn);
  }
}

// ── 카드 생성 ──────────────────────────────
function createCard(problem) {
  const subCount = getSubPartCount(problem);
  const totalParts = subCount === 0 ? 1 : subCount;
  let solvedParts = 0;
  for (let i = 1; i <= totalParts; i++) {
    if (state.solvedSubParts[`${problem.id}-${i}`]) solvedParts++;
  }

  const isSolved = solvedParts === totalParts || !!state.solved[problem.id];
  const isIncorrect = state.incorrect[problem.id] && !isSolved;

  const statusHtml = isSolved
    ? `<span class="card-status status-solved">✓ 완료</span>`
    : solvedParts > 0
      ? `<span class="card-status" style="background:rgba(34,211,238,0.15);color:#22d3ee;border:1px solid rgba(34,211,238,0.3);">${solvedParts}/${totalParts} 해결</span>`
      : isIncorrect
        ? `<span class="card-status status-incorrect">✗ 오답</span>`
        : `<span class="card-status status-unsolved">미풀이</span>`;

  const conf = SUB_CONFIG[problem.id] || {};
  let teacherCardHtml = '';
  if (state.teacherMode) {
    const subDetails = Object.entries(conf).map(([k, v]) => `
      <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        <strong style="color:#4ade80">(${k})</strong> ${v.answer}
      </div>
    `).join('');

    teacherCardHtml = `
      <div style="margin-top:8px;padding:8px 10px;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);border-radius:8px;font-size:0.75rem;color:#bbf7d0;">
        <div style="font-weight:bold;color:#4ade80;margin-bottom:4px;">🟢 정답 요약</div>
        <div style="border-top:1px solid rgba(74,222,128,0.2);padding-top:4px;display:flex;flex-direction:column;gap:2px;">${subDetails}</div>
      </div>
    `;
  }

  const card = document.createElement('div');
  card.className = `problem-card${isSolved ? ' solved' : ''}${isIncorrect ? ' incorrect' : ''}`;
  card.dataset.id = problem.id;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  card.innerHTML = `
    <div class="card-top">
      <div class="card-difficulty">${renderStars(problem.difficulty)}</div>
      <span class="card-num">#${String(problem.id).padStart(2,'0')}</span>
    </div>
    <div class="card-title">${problem.title}</div>
    <div class="card-preview">${problem.preview}</div>
    ${teacherCardHtml}
    <div class="card-footer">
      <span class="card-points">🏅 ${problem.points}점</span>
      ${statusHtml}
      <span class="card-arrow">→</span>
    </div>
  `;

  card.addEventListener('click', () => openModal(problem.id));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(problem.id); });

  return card;
}

// ── 그리드 렌더 ──────────────────────────
function renderGrid() {
  const grid = document.getElementById('problemsGrid');
  if (!grid || typeof PROBLEMS === 'undefined') return;
  grid.innerHTML = '';

  PROBLEMS.forEach((problem, idx) => {
    const card = createCard(problem);
    card.style.animationDelay = `${(idx % 10) * 0.05}s`;
    grid.appendChild(card);
  });

  updateStats();
}

// ── 통계 업데이트 ─────────────────────────
function updateStats() {
  if (typeof PROBLEMS === 'undefined') return;
  const total = PROBLEMS.length;
  const solved = Object.keys(state.solved).length;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  const totalEl = document.getElementById('totalProblems');
  const solvedEl = document.getElementById('solvedCount');
  const correctEl = document.getElementById('correctCount');
  const fillEl = document.getElementById('progressBarFill');
  const pctEl = document.getElementById('progressPct');
  const scoreEl = document.getElementById('totalScore');

  if (totalEl) totalEl.textContent = total;
  if (solvedEl) solvedEl.textContent = Object.keys(state.solved).length + Object.keys(state.incorrect).length;
  if (correctEl) correctEl.textContent = solved;
  if (fillEl) fillEl.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (scoreEl) scoreEl.textContent = state.totalScore;
}

// ── 모달 열기 ─────────────────────────────
function openModal(problemId) {
  if (typeof PROBLEMS === 'undefined') return;
  const problem = PROBLEMS.find(p => p.id === problemId);
  if (!problem) return;
  state.currentProblemId = problemId;

  const overlay = document.getElementById('modalOverlay');

  document.getElementById('modalDifficulty').innerHTML = renderStars(problem.difficulty);
  document.getElementById('modalPoints').textContent = `🏅 총 ${problem.points}점`;
  document.getElementById('modalTitle').textContent = problem.title;
  document.getElementById('problemText').innerHTML = problem.problem;

  // 힌트 초기화
  const hintContent = document.getElementById('hintContent');
  const hintBtn = document.getElementById('hintBtn');
  hintContent.textContent = problem.hint;
  if (state.hintShown[problemId]) {
    hintContent.classList.add('visible');
    hintBtn.textContent = '💡 힌트 닫기';
  } else {
    hintContent.classList.remove('visible');
    hintBtn.textContent = '💡 힌트 보기';
  }

  // 안내문 숨기기
  const guideEl = document.getElementById('submitGuideText');
  if (guideEl) guideEl.style.display = 'none';

  // 소문제별 입력창 및 채점기 생성
  buildSubAnswers(problem);

  // 기본 단일제출 영역 숨기기
  const singleSubmit = document.getElementById('answerInput');
  if (singleSubmit && singleSubmit.parentElement) {
    singleSubmit.parentElement.style.display = 'none';
  }
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) submitBtn.style.display = 'none';

  const feedback = document.getElementById('feedback');
  if (feedback) feedback.style.display = 'none';

  const solutionSection = document.getElementById('solutionSection');
  const existingGameBtn = document.getElementById('marioGameBtn');
  if (existingGameBtn) existingGameBtn.remove();

  // 이미 완료되었거나 선생님 모드인 경우 해설 표시
  if (state.teacherMode || state.solved[problemId]) {
    solutionSection.classList.add('visible');
    document.getElementById('solutionText').innerHTML = problem.solution;
    addMarioGameButton();
  } else {
    solutionSection.classList.remove('visible');
    document.getElementById('solutionText').innerHTML = '';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function addMarioGameButton() {
  if (document.getElementById('marioGameBtn')) return;
  const gameBtn = document.createElement('button');
  gameBtn.className = 'mario-unlock-btn';
  gameBtn.id = 'marioGameBtn';
  gameBtn.innerHTML = '🎮 마리오 미니 게임 플레이!';
  gameBtn.addEventListener('click', openMarioGame);
  document.getElementById('solutionSection').after(gameBtn);
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  state.currentProblemId = null;
  renderGrid();
}

// ── 선생님 모드 ───────────────────────────
function openTeacherModal() {
  const overlay = document.getElementById('teacherModalOverlay');
  overlay.classList.add('open');
  const pwInput = document.getElementById('teacherPwInput');
  if (pwInput) {
    pwInput.value = '';
    setTimeout(() => pwInput.focus(), 150);
  }
}

function closeTeacherModal() {
  const overlay = document.getElementById('teacherModalOverlay');
  if (overlay) overlay.classList.remove('open');
}

function activateTeacherMode() {
  state.teacherMode = true;
  closeTeacherModal();

  const banner = document.getElementById('teacherBanner');
  if (banner) banner.classList.add('visible');

  const lockBtn = document.getElementById('teacherLockBtn');
  if (lockBtn) {
    lockBtn.classList.add('active');
    lockBtn.textContent = '🔓';
  }

  if (state.currentProblemId) openModal(state.currentProblemId);
  renderGrid();
}

function deactivateTeacherMode() {
  state.teacherMode = false;

  const banner = document.getElementById('teacherBanner');
  if (banner) banner.classList.remove('visible');

  const lockBtn = document.getElementById('teacherLockBtn');
  if (lockBtn) {
    lockBtn.classList.remove('active');
    lockBtn.textContent = '🔒';
  }

  if (state.currentProblemId) openModal(state.currentProblemId);
  renderGrid();
}

// ── 마리오 게임 ────────────────────────────
function openMarioGame() {
  const overlay = document.getElementById('marioOverlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  const canvas = document.getElementById('marioCanvas');
  if (window.MarioGame) window.MarioGame.init(canvas);
}

function closeMarioGame() {
  const overlay = document.getElementById('marioOverlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (window.MarioGame) window.MarioGame.destroy();
}

// ── 컨페티 효과 ──────────────────────────
function launchConfetti() {
  const overlay = document.getElementById('confettiOverlay');
  if (!overlay) return;
  overlay.innerHTML = '';
  const colors = ['#7c5cfc', '#22d3ee', '#f472b6', '#fb923c', '#4ade80', '#fbbf24'];

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = Math.random() * 10 + 6;
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size * (Math.random() > 0.5 ? 1 : 0.4)}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 2 + 1.5}s;
      animation-delay: ${Math.random() * 0.5}s;
      border-radius: ${Math.random() > 0.3 ? '50%' : '2px'};
    `;
    overlay.appendChild(piece);
  }

  setTimeout(() => { overlay.innerHTML = ''; }, 3500);
}

function createParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;
  container.innerHTML = '';
  const symbols = ['∑', 'π', '∞', '√', '∫', 'Δ', '≈', '≠', '±'];
  const colors = ['rgba(124,92,252,0.15)', 'rgba(34,211,238,0.12)', 'rgba(244,114,182,0.1)', 'rgba(251,191,36,0.1)'];

  for (let i = 0; i < 16; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size = Math.random() * 20 + 10;
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 8}s;
      font-size: ${size * 0.7}px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(124,92,252,0.3);
      border-radius: ${Math.random() > 0.5 ? '50%' : '4px'};
    `;
    el.textContent = Math.random() > 0.5 ? symbols[Math.floor(Math.random() * symbols.length)] : '';
    container.appendChild(el);
  }
}

function _on(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

// ── DOM 초기화 ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  try { createParticles(); } catch (e) {}
  try { renderGrid(); } catch (e) {}

  _on('modalClose', 'click', closeModal);
  _on('modalOverlay', 'click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeTeacherModal();
      closeMarioGame();
    }
  });

  _on('hintBtn', 'click', () => {
    const hintContent = document.getElementById('hintContent');
    const hintBtn = document.getElementById('hintBtn');
    const pid = state.currentProblemId;
    if (hintContent.classList.contains('visible')) {
      hintContent.classList.remove('visible');
      hintBtn.textContent = '💡 힌트 보기';
      if (pid) delete state.hintShown[pid];
    } else {
      hintContent.classList.add('visible');
      hintBtn.textContent = '💡 힌트 닫기';
      if (pid) state.hintShown[pid] = true;
    }
  });

  _on('marioClose', 'click', closeMarioGame);
  _on('marioOverlay', 'click', e => {
    if (e.target === document.getElementById('marioOverlay')) closeMarioGame();
  });

  _on('teacherLockBtn', 'click', () => {
    if (state.teacherMode) deactivateTeacherMode();
    else openTeacherModal();
  });

  _on('teacherModalClose', 'click', closeTeacherModal);
  _on('teacherModalOverlay', 'click', e => {
    if (e.target === document.getElementById('teacherModalOverlay')) closeTeacherModal();
  });

  _on('teacherPwSubmit', 'click', () => {
    const pwInput = document.getElementById('teacherPwInput');
    const pw = pwInput ? pwInput.value : '';
    if (_verifyTeacher(pw)) {
      activateTeacherMode();
    } else {
      const errEl = document.getElementById('teacherPwError');
      if (errEl) {
        errEl.textContent = '❌ 비밀번호가 올바르지 않습니다.';
        if (pwInput) pwInput.value = '';
        setTimeout(() => { errEl.textContent = ''; }, 2500);
      }
    }
  });

  _on('teacherPwInput', 'keydown', e => {
    if (e.key === 'Enter') {
      const submit = document.getElementById('teacherPwSubmit');
      if (submit) submit.click();
    }
  });

  _on('teacherModeOff', 'click', deactivateTeacherMode);
});
