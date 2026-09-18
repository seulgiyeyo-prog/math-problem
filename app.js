// ===========================
//  창의 수학 문제집 — 메인 앱
// ===========================

// ── 상태 관리 ──────────────────────────────
const state = {
  solved: {},
  incorrect: {},
  hintShown: {},
  subAnswers: {},   // { problemId: { 소문제번호: 입력값 } } — 채점되지 않는 메모용 답안
  totalScore: 0,
  currentFilter: 'all',
  currentProblemId: null,
  teacherMode: false,
};

// 비밀번호 검증 (평문 노출 안함)
function _verifyTeacher(input) {
  // 'MDczMA==' = btoa('0730')
  try { return btoa(input) === 'MDczMA=='; } catch(e) { return false; }
}

// ── 카테고리 클래스 맵 ──────────────────────
const categoryClassMap = {
  number:     'cat-number',
  algebra:    'cat-algebra',
  function:   'cat-function',
  geometry:   'cat-geometry',
  statistics: 'cat-statistics',
};

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
// 문제 본문의 "<strong>(1)</strong>" 같은 표시 개수를 세어 소문제 개수를 구합니다.
function getSubPartCount(problem) {
  const matches = problem.problem.match(/<strong>\(\d+\)<\/strong>/g);
  return matches ? matches.length : 0;
}

// submitGuide 문구("(n)번의 답만 입력하세요")에서 채점 대상 소문제 번호를 찾습니다.
// 문구에 번호가 명시되지 않은 예외 문제는 수동으로 지정합니다.
const GRADED_PART_OVERRIDE = { 16: 2, 18: 3 };
function getGradedPart(problem) {
  const subCount = getSubPartCount(problem);
  if (subCount === 0) return null;
  if (GRADED_PART_OVERRIDE[problem.id]) return GRADED_PART_OVERRIDE[problem.id];
  const m = problem.submitGuide && problem.submitGuide.match(/\((\d+)\)번의?\s*답만/);
  if (m) return parseInt(m[1], 10);
  return subCount; // 패턴을 못 찾으면 마지막 소문제를 채점 대상으로 간주
}

// 문제마다 소문제 개수만큼 답안 칸을 만들어 줍니다.
// 채점 대상 소문제는 실제 채점되는 input(#answerInput)으로, 나머지는 채점되지 않는
// 메모용 textarea로 렌더링해 학생이 모든 소문제의 답/풀이를 적어볼 수 있게 합니다.
function buildSubAnswers(problem) {
  const container = document.getElementById('subAnswersContainer');
  container.innerHTML = '';

  const subCount = getSubPartCount(problem);
  const gradedPart = getGradedPart(problem);
  const savedNotes = state.subAnswers[problem.id] || {};

  if (subCount === 0) {
    const row = document.createElement('div');
    row.className = 'sub-answer-row graded';
    row.innerHTML = `
      <label class="answer-label" for="answerInput">내 답안</label>
      <input class="answer-input" type="text" id="answerInput" placeholder="답을 입력하세요..." autocomplete="off" />
    `;
    container.appendChild(row);
    return;
  }

  for (let i = 1; i <= subCount; i++) {
    const isGraded = i === gradedPart;
    const row = document.createElement('div');
    row.className = `sub-answer-row${isGraded ? ' graded' : ''}`;

    if (isGraded) {
      row.innerHTML = `
        <label class="answer-label" for="answerInput"><span class="sub-num">(${i})</span> 답안<span class="graded-badge">✅ 채점 대상</span></label>
        <input class="answer-input" type="text" id="answerInput" placeholder="답을 입력하세요..." autocomplete="off" />
      `;
    } else {
      row.innerHTML = `
        <label class="answer-label" for="subAnswer-${i}"><span class="sub-num">(${i})</span> 답안 / 풀이 메모</label>
        <textarea class="answer-input sub-answer-textarea" id="subAnswer-${i}" rows="2" placeholder="이 소문제의 답이나 풀이 과정을 적어보세요 (채점되지 않아요)"></textarea>
      `;
    }
    container.appendChild(row);

    if (!isGraded) {
      const ta = row.querySelector('textarea');
      ta.value = savedNotes[i] || '';
      ta.addEventListener('input', () => {
        if (!state.subAnswers[problem.id]) state.subAnswers[problem.id] = {};
        state.subAnswers[problem.id][i] = ta.value;
      });
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

  const card = document.createElement('div');
  card.className = `problem-card${isSolved ? ' solved' : ''}${isIncorrect ? ' incorrect' : ''}`;
  card.dataset.id = problem.id;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `문제 ${problem.id}: ${problem.title}`);
  card.style.animationDelay = `${(problem.id % 8) * 0.07}s`;

  card.innerHTML = `
    <div class="card-top">
      <div class="card-difficulty">${renderStars(problem.difficulty)}</div>
      <span class="card-num">#${String(problem.id).padStart(2,'0')}</span>
    </div>
    <div class="card-title">${problem.title}</div>
    <div class="card-preview">${problem.preview}</div>
    ${state.teacherMode ? `<div><span class="teacher-answer-badge">🟢 정답: ${problem.answer}</span></div>` : ''}
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
  grid.innerHTML = '';

  PROBLEMS.forEach((problem, idx) => {
    const card = createCard(problem);
    card.style.animationDelay = `${idx * 0.06}s`;
    grid.appendChild(card);
  });

  updateStats();
}

// ── 통계 업데이트 ─────────────────────────
function updateStats() {
  const total = PROBLEMS.length;
  const solved = Object.keys(state.solved).length;
  const correct = solved;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  document.getElementById('totalProblems').textContent = total;
  document.getElementById('solvedCount').textContent = Object.keys(state.solved).length + Object.keys(state.incorrect).length;
  document.getElementById('correctCount').textContent = correct;
  document.getElementById('progressBarFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('totalScore').textContent = state.totalScore;
}

// ── 모달 열기 ─────────────────────────────
function openModal(problemId) {
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

  // 소문제별 답안 칸 생성 (채점 대상 input + 메모용 textarea들)
  buildSubAnswers(problem);

  // 답안 입력 초기화
  const answerInput = document.getElementById('answerInput');
  const submitBtn = document.getElementById('submitBtn');
  const feedback = document.getElementById('feedback');
  const solutionSection = document.getElementById('solutionSection');

  answerInput.value = '';
  feedback.className = 'feedback';
  feedback.textContent = '';
  solutionSection.classList.remove('visible');
  document.getElementById('solutionText').innerHTML = '';
  const existingGameBtn = document.getElementById('marioGameBtn');
  if (existingGameBtn) existingGameBtn.remove();

  // 선생님 모드: 정답+풀이 즉시 공개
  if (state.teacherMode) {
    answerInput.disabled = true;
    answerInput.value = '👨‍🏫 선생님 모드 활성 중';
    submitBtn.disabled = true;
    feedback.className = 'feedback correct';
    feedback.innerHTML = `🎓 선생님 모드 &mdash; 정답: <strong style="color:var(--green);font-size:1.1em">${problem.answer}</strong>`;
    solutionSection.classList.add('visible');
    document.getElementById('solutionText').innerHTML = problem.solution;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    return;
  }

  if (state.solved[problemId]) {
    answerInput.disabled = true;
    answerInput.value = '✅ 이미 정답을 맞혔습니다!';
    submitBtn.disabled = true;
    feedback.className = 'feedback correct';
    feedback.textContent = '🎉 정답입니다! 훌륭해요!';
    solutionSection.classList.add('visible');
    document.getElementById('solutionText').innerHTML = problem.solution;
  } else {
    answerInput.disabled = false;
    submitBtn.disabled = false;
    answerInput.focus();
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── 모달 닫기 ─────────────────────────────
function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  state.currentProblemId = null;

  // 카드 재렌더
  renderGrid();
}

// ── 답안 제출 ─────────────────────────────
function submitAnswer() {
  const problemId = state.currentProblemId;
  if (!problemId) return;

  const problem = PROBLEMS.find(p => p.id === problemId);
  const answerInput = document.getElementById('answerInput');
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

  // 정답 체크 (대소문자 무시, 공백 무시)
  const normalize = s => s.toLowerCase().replace(/\s/g, '').replace(/,/g, '');
  const isCorrect = problem.answers.some(ans => normalize(userAnswer) === normalize(ans));

  if (isCorrect) {
    if (!state.solved[problemId]) {
      state.solved[problemId] = true;
      state.totalScore += problem.points;
      delete state.incorrect[problemId];
    }
    feedback.className = 'feedback correct';
    feedback.textContent = `🎉 정답입니다! +${problem.points}점 획득!`;
    solutionSection.classList.add('visible');
    document.getElementById('solutionText').innerHTML = problem.solution;
    answerInput.disabled = true;
    submitBtn.disabled = true;
    launchConfetti();

    // 마리오 게임 잠금 해제 버튼 표시
    const existingBtn = document.getElementById('marioGameBtn');
    if (!existingBtn) {
      const gameBtn = document.createElement('button');
      gameBtn.className = 'mario-unlock-btn';
      gameBtn.id = 'marioGameBtn';
      gameBtn.innerHTML = '🎮 마리오 미니 게임 잠금 해제! 클릭하여 플레이!';
      gameBtn.addEventListener('click', openMarioGame);
      document.getElementById('solutionSection').after(gameBtn);
    }
  } else {
    state.incorrect[problemId] = true;
    feedback.className = 'feedback wrong';
    feedback.textContent = `❌ 오답입니다. 다시 한번 생각해보세요! (힌트를 활용해보세요 💡)`;
  }

  updateStats();
  document.getElementById('totalScore').textContent = state.totalScore;
}

// ── 선생님 모드 함수 ────────────────────────
function openTeacherModal() {
  const overlay = document.getElementById('teacherModalOverlay');
  overlay.classList.add('open');
  document.getElementById('teacherPwInput').value = '';
  document.getElementById('teacherPwError').textContent = '';
  setTimeout(() => document.getElementById('teacherPwInput').focus(), 100);
}

function closeTeacherModal() {
  document.getElementById('teacherModalOverlay').classList.remove('open');
}

function activateTeacherMode() {
  state.teacherMode = true;
  closeTeacherModal();
  document.getElementById('teacherBanner').classList.add('visible');
  document.getElementById('teacherLockBtn').classList.add('active');
  document.getElementById('teacherLockBtn').textContent = '🔓';
  renderGrid();
}

function deactivateTeacherMode() {
  state.teacherMode = false;
  document.getElementById('teacherBanner').classList.remove('visible');
  document.getElementById('teacherLockBtn').classList.remove('active');
  document.getElementById('teacherLockBtn').textContent = '🔒';
  renderGrid();
}

// ── 마리오 게임 열기/닫기 ────────────────────────
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
  overlay.innerHTML = '';
  const colors = ['#7c5cfc', '#22d3ee', '#f472b6', '#fb923c', '#4ade80', '#fbbf24'];

  for (let i = 0; i < 60; i++) {
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
  const symbols = ['∑', 'π', '∞', '√', '∫', 'Δ', '≈', '≠', '±'];
  const colors = [
    'rgba(124,92,252,0.15)',
    'rgba(34,211,238,0.12)',
    'rgba(244,114,182,0.1)',
    'rgba(251,191,36,0.1)',
  ];

  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size = Math.random() * 20 + 10;
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
      font-size: ${size * 0.7}px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(124,92,252,0.3);
      border-radius: ${Math.random() > 0.5 ? '50%' : '4px'};
    `;
    el.textContent = Math.random() > 0.5 ? symbols[Math.floor(Math.random() * symbols.length)] : '';
    container.appendChild(el);
  }
}

// ── 이벤트 리스너 ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 파티클 생성
  createParticles();

  // 초기 그리드 렌더
  renderGrid();

  // 필터 버튼 — 제거됨

  // 모달 닫기 버튼
  document.getElementById('modalClose').addEventListener('click', closeModal);

  // 오버레이 클릭으로 닫기
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // ESC 키로 닫기
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // 힌트 버튼
  document.getElementById('hintBtn').addEventListener('click', () => {
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
  document.getElementById('submitBtn').addEventListener('click', submitAnswer);

  // Enter 키로 제출
  document.getElementById('answerInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitAnswer();
  });

  // 마리오 게임 닫기 버튼
  document.getElementById('marioClose').addEventListener('click', closeMarioGame);

  // 마리오 오버레이 바깥 클릭으로 닫기
  document.getElementById('marioOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('marioOverlay')) closeMarioGame();
  });

  // ── 선생님 모드 이벤트 ──
  // 🔒 버튼 클릭 → 모드 ON이면 해제, OFF이면 비번 모달
  document.getElementById('teacherLockBtn').addEventListener('click', () => {
    if (state.teacherMode) deactivateTeacherMode();
    else openTeacherModal();
  });

  // 비번 모달 닫기
  document.getElementById('teacherModalClose').addEventListener('click', closeTeacherModal);
  document.getElementById('teacherModalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('teacherModalOverlay')) closeTeacherModal();
  });

  // 비번 확인 버튼
  document.getElementById('teacherPwSubmit').addEventListener('click', () => {
    const pw = document.getElementById('teacherPwInput').value;
    if (_verifyTeacher(pw)) {
      activateTeacherMode();
    } else {
      const errEl = document.getElementById('teacherPwError');
      errEl.textContent = '❌ 비밀번호가 올바르지 않습니다.';
      document.getElementById('teacherPwInput').value = '';
      document.getElementById('teacherPwInput').focus();
      setTimeout(() => { errEl.textContent = ''; }, 2500);
    }
  });

  // 비번 입력 Enter 키
  document.getElementById('teacherPwInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('teacherPwSubmit').click();
  });

  // 선생님 모드 해제 배너 버튼
  document.getElementById('teacherModeOff').addEventListener('click', deactivateTeacherMode);
});
