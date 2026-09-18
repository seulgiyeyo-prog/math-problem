// ============================================================
//  창의 수학 문제집 — 메인 앱 (app.js)
//  - 자물쇠(선생님 모드) 클릭 이벤트 오류 해결 (안전한 이벤트 위임)
//  - 모든 소문제((1), (2), (3)) 교사용 정답 모달 및 카드 표시
// ============================================================

// ── 소문제별 선생님 정답 데이터베이스 ────────────────────────
const SUB_ANSWERS_DATA = {
  1: {
    1: "15 (1+2+...+9 = 45, 45÷3 = 15)",
    2: "5 (가로, 세로, 대각선 총 4줄에 포함되므로 가운데는 5)",
    3: "2, 7, 6 / 9, 5, 1 / 4, 3, 8"
  },
  2: {
    1: "A 거짓말 가정 시 모순, C 거짓말 가정 시 모순, B 거짓말 가정 시 모든 조건 성립",
    2: "B"
  },
  3: {
    1: "1 (1개), 4 (3개), 9 (3개)",
    2: "10개 (1², 2², 3², ..., 10²)",
    3: "약수는 보통 a와 n/a의 쌍(짝수 개)이지만 a=n/a인 완전제곱수만 단독 약수를 가져 홀수 개가 됨"
  },
  4: {
    1: "72개 (LCM(18, 24) = 72)",
    2: "A: 4바퀴, B: 3바퀴",
    3: "360개 (LCM(18, 24, 30) = 360)"
  },
  5: {
    1: "2.4초 (12/5초)",
    2: "-2.2 (또는 -11/5)",
    3: "-11/12"
  },
  6: {
    1: "가운데 p에 따라 2+p, p+5, 2p+7이 모두 소수가 되는 수 탐색 (맨 위 최소 소수는 19)",
    2: "19",
    3: "p=2이면 2+p=4(합성수)가 되므로 불가"
  },
  7: {
    1: "1275 (50×51÷2)",
    2: "47 (1275 - 1228)",
    3: "23과 24 (n + (n+1) = 47 → 2n = 46 → n = 23)"
  },
  8: {
    1: "n=2: 1개, n=3: 3개, n=4: 6개, n=5: 10개",
    2: "n(n-1)/2",
    3: "15 (15×14/2 = 105 > 100)"
  },
  9: {
    1: "x = 8 또는 x = -2",
    2: "x = -5 또는 x = 1",
    3: "x = -1 또는 x = 5 (음수 해: -1)"
  },
  10: {
    1: "3개 (AB, BC, AC)",
    2: "n(n-1)/2",
    3: "15개 (전체 서로 다른 점 4+3-1=6개 → 6×5/2 = 15)"
  },
  11: {
    1: "110880 (32 × 9 × 5 × 7 × 11)",
    2: "6자리 수이므로 8자리 YYYYMMDD 날짜가 될 수 없음",
    3: "개인 생일/기념일 소인수분해 확인"
  },
  12: {
    1: "95° (점 B를 지나는 평행선을 그어 엇각의 합 55° + 40° = 95°)"
  },
  13: {
    1: "-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7 (총 11개)",
    2: "-5, -4, -3, -2, -1, 0, 1, 2, 3 (총 9개)",
    3: "-3, -2, -1, 0, 1, 2, 3 (총 7개)"
  },
  14: {
    1: "A = 4kg, B = 10kg, C = 7kg",
    2: "2(A+B+C) = 42 → A+B+C = 21kg 활용",
    3: "18kg (D = 2A = 8kg이므로 B+D = 10+8 = 18kg)"
  },
  15: {
    1: "5/1 (1+2+3+4+5=15항, 분자+분모=6 그룹의 마지막)",
    2: "24번째 (분자+분모=8 그룹, 21+3=24)",
    3: "모든 양의 유리수 p/q는 p+q=k인 군에 반드시 속해 유한한 번호가 매겨짐"
  },
  16: {
    1: "f(0)=15, f(1)=12, f(3)=10, f(5)=8, f(7)=10, f(9)=12, f(10)=15",
    2: "x = 5일 때 최솟값 8",
    3: "수직선 위 1, 5, 9 세 점으로부터의 거리 합이며 중앙값 5에서 최소"
  },
  17: {
    1: "P = 0 (-3 + 12×1/4)",
    2: "M = 3 ((-3+9)/2)",
    3: "Q = 5 (-3 + 12×2/3)",
    4: "P(0), M(3), Q(5) 순서로 위치하며 PM=3, MQ=2"
  },
  18: {
    1: "n(n-1)/2 + 1",
    2: "175 (22부터 28까지 7개의 합)",
    3: "8번째 줄 (29~36 합 = 260 > 200)"
  },
  19: {
    1: "180°",
    2: "36° (180° ÷ 5)",
    3: "180° (삼각형의 외각 성질에 의해 별 꼭짓점 각의 합은 180°)"
  },
  20: {
    1: "N을 2,3,5,7로 나눈 나머지가 1이므로 N-1은 2,3,5,7의 공배수",
    2: "211, 421, 631, 841 (LCM=210)",
    3: "2104 (211 + 421 + 631 + 841)"
  }
};

// ── 상태 관리 ──────────────────────────────
const state = {
  solved: {},
  incorrect: {},
  hintShown: {},
  subAnswers: {},   // 학생 메모 답안
  totalScore: 0,
  currentFilter: 'all',
  currentProblemId: null,
  teacherMode: false,
};

// 로컬 스토리지 불러오기
try {
  const s = localStorage.getItem('math_solved');
  if (s) state.solved = JSON.parse(s);
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
    localStorage.setItem('math_incorrect', JSON.stringify(state.incorrect));
    localStorage.setItem('math_score', state.totalScore.toString());
    localStorage.setItem('math_sub_answers', JSON.stringify(state.subAnswers));
  } catch (e) {}
}

// 비밀번호 검증 (0730)
function _verifyTeacher(input) {
  try { return btoa(input.trim()) === 'MDczMA=='; } catch(e) { return false; }
}

// ── 난이도 별 렌더링 ──────────────────────
function renderStars(difficulty) {
  const colors = ['', '#4ade80', '#22d3ee', '#fb923c', '#f472b6'];
  const labels = ['', '기본', '중급', '심화', '도전'];
  let stars = '';
  for (let i = 1; i <= 4; i++) {
    stars += `<span class="diff-star" style="color:${i <= difficulty ? colors[difficulty] : '#333'}">${i <= difficulty ? '★' : '☆'}</span>`;
  }
  return `<span title="${labels[difficulty]}">${stars}</span>`;
}

// ── 소문제(서브문제) 파싱 ──────────────────────
function getSubPartCount(problem) {
  const matches = problem.problem.match(/<strong>\(\d+\)<\/strong>/g);
  return matches ? matches.length : 0;
}

const GRADED_PART_OVERRIDE = { 16: 2, 18: 3 };
function getGradedPart(problem) {
  const subCount = getSubPartCount(problem);
  if (subCount === 0) return null;
  if (GRADED_PART_OVERRIDE[problem.id]) return GRADED_PART_OVERRIDE[problem.id];
  const m = problem.submitGuide && problem.submitGuide.match(/\((\d+)\)번의?\s*답만/);
  if (m) return parseInt(m[1], 10);
  return subCount;
}

// 문제 모달의 소문제별 입력창 및 선생님 모드 정답 렌더링
function buildSubAnswers(problem) {
  const container = document.getElementById('subAnswersContainer');
  container.innerHTML = '';

  const subCount = getSubPartCount(problem);
  const gradedPart = getGradedPart(problem);
  const savedNotes = state.subAnswers[problem.id] || {};
  const teacherSubAnswers = SUB_ANSWERS_DATA[problem.id] || problem.subAnswers || {};

  if (subCount === 0) {
    const row = document.createElement('div');
    row.className = 'sub-answer-row graded';
    row.innerHTML = `
      <label class="answer-label" for="answerInput">내 답안</label>
      <input class="answer-input" type="text" id="answerInput" placeholder="답을 입력하세요..." autocomplete="off" />
      ${state.teacherMode ? `
        <div style="margin-top:6px;padding:6px 10px;border-radius:6px;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);color:#4ade80;font-size:0.8rem;font-weight:bold;">
          🟢 교사용 정답: ${problem.answer}
        </div>` : ''}
    `;
    container.appendChild(row);
    return;
  }

  for (let i = 1; i <= subCount; i++) {
    const isGraded = i === gradedPart;
    const row = document.createElement('div');
    row.className = `sub-answer-row${isGraded ? ' graded' : ''}`;

    const subAnsText = teacherSubAnswers[i] || (isGraded ? problem.answer : '');

    if (isGraded) {
      row.innerHTML = `
        <label class="answer-label" for="answerInput">
          <span class="sub-num">(${i})</span> 답안
          <span class="graded-badge">✅ 최종 채점 대상</span>
        </label>
        <input class="answer-input" type="text" id="answerInput" placeholder="답을 입력하세요..." autocomplete="off" />
        ${state.teacherMode && subAnsText ? `
          <div style="margin-top:6px;padding:6px 10px;border-radius:6px;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);color:#4ade80;font-size:0.8rem;font-weight:bold;">
            🟢 (${i})번 교사용 정답: ${subAnsText}
          </div>` : ''}
      `;
    } else {
      row.innerHTML = `
        <label class="answer-label" for="subAnswer-${i}">
          <span class="sub-num">(${i})</span> 답안 / 풀이 메모
        </label>
        <textarea class="answer-input sub-answer-textarea" id="subAnswer-${i}" rows="2" placeholder="이 소문제의 답이나 풀이 과정을 적어보세요 (채점되지 않아요)"></textarea>
        ${state.teacherMode && subAnsText ? `
          <div style="margin-top:6px;padding:6px 10px;border-radius:6px;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);color:#4ade80;font-size:0.8rem;font-weight:bold;">
            🟢 (${i})번 교사용 정답: ${subAnsText}
          </div>` : ''}
      `;
    }
    container.appendChild(row);

    if (!isGraded) {
      const ta = row.querySelector('textarea');
      if (ta) {
        ta.value = savedNotes[i] || '';
        ta.addEventListener('input', () => {
          if (!state.subAnswers[problem.id]) state.subAnswers[problem.id] = {};
          state.subAnswers[problem.id][i] = ta.value;
          saveState();
        });
      }
    }
  }
}

// ── 카드 생성 ──────────────────────────────
function createCard(problem) {
  const isSolved = state.solved[problem.id];
  const isIncorrect = state.incorrect[problem.id] && !isSolved;

  const statusHtml = isSolved
    ? `<span class="card-status status-solved">✓ 정답</span>`
    : isIncorrect
      ? `<span class="card-status status-incorrect">✗ 오답</span>`
      : `<span class="card-status status-unsolved">미풀이</span>`;

  const teacherSub = SUB_ANSWERS_DATA[problem.id] || problem.subAnswers || {};
  const hasSub = Object.keys(teacherSub).length > 1;

  let teacherCardHtml = '';
  if (state.teacherMode) {
    let subDetails = '';
    if (hasSub) {
      subDetails = Object.entries(teacherSub).map(([k, v]) => `
        <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          <strong style="color:#4ade80">(${k})</strong> ${v}
        </div>
      `).join('');
    }

    teacherCardHtml = `
      <div style="margin-top:8px;padding:8px 10px;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);border-radius:8px;font-size:0.75rem;color:#bbf7d0;">
        <div style="font-weight:bold;color:#4ade80;margin-bottom:${hasSub ? '4px' : '0'};">🟢 최종 정답: ${problem.answer}</div>
        ${hasSub ? `<div style="border-top:1px solid rgba(74,222,128,0.2);padding-top:4px;display:flex;flex-direction:column;gap:2px;">${subDetails}</div>` : ''}
      </div>
    `;
  }

  const card = document.createElement('div');
  card.className = `problem-card${isSolved ? ' solved' : ''}${isIncorrect ? ' incorrect' : ''}`;
  card.dataset.id = problem.id;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `문제 ${problem.id}: ${problem.title}`);

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
  document.getElementById('modalPoints').textContent = `🏅 ${problem.points}점`;
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

  // submitGuide 표시
  const guideEl = document.getElementById('submitGuideText');
  if (guideEl) {
    if (problem.submitGuide) {
      guideEl.textContent = '📌 ' + problem.submitGuide;
      guideEl.style.display = 'block';
    } else {
      guideEl.style.display = 'none';
    }
  }

  // 소문제별 답안 칸 및 선생님 정답 생성
  buildSubAnswers(problem);

  // 답안 입력 초기화
  const answerInput = document.getElementById('answerInput');
  const submitBtn = document.getElementById('submitBtn');
  const feedback = document.getElementById('feedback');
  const solutionSection = document.getElementById('solutionSection');

  if (answerInput) answerInput.value = '';
  feedback.className = 'feedback';
  feedback.textContent = '';
  solutionSection.classList.remove('visible');
  document.getElementById('solutionText').innerHTML = '';

  const existingGameBtn = document.getElementById('marioGameBtn');
  if (existingGameBtn) existingGameBtn.remove();

  // 선생님 모드: 정답 및 풀이 즉시 공개
  if (state.teacherMode) {
    if (answerInput) {
      answerInput.disabled = true;
      answerInput.value = '👨‍🏫 선생님 모드 활성 중';
    }
    if (submitBtn) submitBtn.disabled = true;

    feedback.className = 'feedback correct';
    feedback.innerHTML = `🎓 선생님 모드 &mdash; 최종 정답: <strong style="color:var(--green);font-size:1.15em">${problem.answer}</strong>`;

    solutionSection.classList.add('visible');
    document.getElementById('solutionText').innerHTML = problem.solution;

    // 선생님 모드에서도 마리오 게임 버튼 제공
    addMarioGameButton();

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    return;
  }

  // 이미 푼 문제
  if (state.solved[problemId]) {
    if (answerInput) {
      answerInput.disabled = true;
      answerInput.value = '✅ 이미 정답을 맞혔습니다!';
    }
    if (submitBtn) submitBtn.disabled = true;

    feedback.className = 'feedback correct';
    feedback.textContent = '🎉 정답입니다! 훌륭해요!';
    solutionSection.classList.add('visible');
    document.getElementById('solutionText').innerHTML = problem.solution;
    addMarioGameButton();
  } else {
    if (answerInput) {
      answerInput.disabled = false;
      setTimeout(() => answerInput.focus(), 150);
    }
    if (submitBtn) submitBtn.disabled = false;
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

// ── 모달 닫기 ─────────────────────────────
function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  state.currentProblemId = null;
  renderGrid();
}

// ── 답안 제출 ─────────────────────────────
function submitAnswer() {
  const problemId = state.currentProblemId;
  if (!problemId || typeof PROBLEMS === 'undefined') return;

  const problem = PROBLEMS.find(p => p.id === problemId);
  const answerInput = document.getElementById('answerInput');
  if (!answerInput) return;

  const userAnswer = answerInput.value.trim();

  if (!userAnswer) {
    answerInput.focus();
    answerInput.style.borderColor = 'var(--pink)';
    setTimeout(() => { answerInput.style.borderColor = ''; }, 1000);
    return;
  }

  const feedback = document.getElementById('feedback');
  const solutionSection = document.getElementById('solutionSection');
  const submitBtn = document.getElementById('submitBtn');

  const normalize = s => s.toLowerCase().replace(/\s/g, '').replace(/,/g, '');
  const isCorrect = problem.answers.some(ans => normalize(userAnswer) === normalize(ans));

  if (isCorrect) {
    if (!state.solved[problemId]) {
      state.solved[problemId] = true;
      state.totalScore += problem.points;
      delete state.incorrect[problemId];
      saveState();
    }
    feedback.className = 'feedback correct';
    feedback.textContent = `🎉 정답입니다! +${problem.points}점 획득!`;
    solutionSection.classList.add('visible');
    document.getElementById('solutionText').innerHTML = problem.solution;
    answerInput.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    launchConfetti();
    addMarioGameButton();
  } else {
    state.incorrect[problemId] = true;
    saveState();
    feedback.className = 'feedback wrong';
    feedback.textContent = `❌ 오답입니다. 다시 한번 생각해보세요! (힌트를 활용해보세요 💡)`;
  }

  updateStats();
}

// ── 선생님 모드 관리 ────────────────────────
function openTeacherModal() {
  const overlay = document.getElementById('teacherModalOverlay');
  overlay.classList.add('open');
  const pwInput = document.getElementById('teacherPwInput');
  if (pwInput) {
    pwInput.value = '';
    setTimeout(() => pwInput.focus(), 150);
  }
  const err = document.getElementById('teacherPwError');
  if (err) err.textContent = '';
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

  // 현재 모달이 열려있다면 즉시 답안 공개 갱신
  if (state.currentProblemId) {
    openModal(state.currentProblemId);
  }
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

  if (state.currentProblemId) {
    openModal(state.currentProblemId);
  }
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

// ── 배경 파티클 생성 ──────────────────────
function createParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;
  container.innerHTML = '';
  const symbols = ['∑', 'π', '∞', '√', '∫', 'Δ', '≈', '≠', '±'];
  const colors = [
    'rgba(124,92,252,0.15)',
    'rgba(34,211,238,0.12)',
    'rgba(244,114,182,0.1)',
    'rgba(251,191,36,0.1)',
  ];

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

// ── 안전한 이벤트 헬퍼 함수 ────────────────
function _on(id, event, handler) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener(event, handler);
  }
}

// ── DOM 초기화 ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  try { createParticles(); } catch (e) {}
  try { renderGrid(); } catch (e) {}

  // 모달 닫기
  _on('modalClose', 'click', closeModal);
  _on('modalOverlay', 'click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // ESC 키 닫기
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeTeacherModal();
      closeMarioGame();
    }
  });

  // 힌트 토글
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

  // 제출 버튼
  _on('submitBtn', 'click', submitAnswer);

  // Enter 키 제출: #answerInput이 동적 생성되므로 document에 위임 (핵심 수정!)
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target && e.target.id === 'answerInput') {
      submitAnswer();
    }
  });

  // 마리오 게임 창 닫기
  _on('marioClose', 'click', closeMarioGame);
  _on('marioOverlay', 'click', e => {
    if (e.target === document.getElementById('marioOverlay')) closeMarioGame();
  });

  // 🔒 자물쇠(선생님 모드) 버튼 이벤트
  _on('teacherLockBtn', 'click', () => {
    if (state.teacherMode) deactivateTeacherMode();
    else openTeacherModal();
  });

  // 선생님 비밀번호 모달 닫기
  _on('teacherModalClose', 'click', closeTeacherModal);
  _on('teacherModalOverlay', 'click', e => {
    if (e.target === document.getElementById('teacherModalOverlay')) closeTeacherModal();
  });

  // 비밀번호 확인
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
        if (pwInput) pwInput.focus();
        setTimeout(() => { errEl.textContent = ''; }, 2500);
      }
    }
  });

  // 비밀번호 입력란 Enter 키
  _on('teacherPwInput', 'keydown', e => {
    if (e.key === 'Enter') {
      const submit = document.getElementById('teacherPwSubmit');
      if (submit) submit.click();
    }
  });

  // 선생님 모드 해제 배너 버튼
  _on('teacherModeOff', 'click', deactivateTeacherMode);
});
