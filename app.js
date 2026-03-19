const questionFlow = [
  { key: 'eventDescription', label: '어떤 일이 일어났나요?', placeholder: '예: 쉬는 시간에 친구가 내 말을 무시한 것처럼 느꼈어요.' },
  { key: 'automaticThought', label: '그때 어떤 생각이 들었나요?', placeholder: '예: 나를 싫어하나 봐.' },
  { key: 'emotion', label: '그때 어떤 감정을 느꼈나요?', placeholder: '예: 속상함, 불안, 화남' },
  { key: 'emotionIntensityBefore', label: '감정의 정도는 어느 정도였나요?', type: 'range' },
  { key: 'behavior', label: '그때 어떤 행동을 했나요?', placeholder: '예: 바로 자리를 피하고 말을 하지 않았어요.' },
  { key: 'evidenceFor', label: '그 생각을 뒷받침하는 근거가 있나요?', placeholder: '예: 인사를 했는데 대답이 없었어요.' },
  { key: 'evidenceAgainst', label: '반대로 다른 가능성은 없을까요?', placeholder: '예: 친구가 피곤하거나 다른 생각을 하고 있었을 수 있어요.' },
  { key: 'balancedThought', label: '보다 균형 잡힌 생각으로 바꿔보면 무엇인가요?', placeholder: '예: 지금은 확실하지 않으니 나중에 차분하게 물어볼 수 있어.' },
  { key: 'emotionIntensityAfter', label: '지금 감정은 얼마나 달라졌나요?', type: 'range' },
];

const evaluationQuestions = [
  { key: 'helpfulnessScore', label: '이번 기록이 도움이 되었나요?', type: 'range' },
  { key: 'emotionalChangeNote', label: '기록을 작성한 후 감정이 얼마나 달라졌나요?', placeholder: '예: 답답함이 줄고 상황을 조금 더 객관적으로 보게 되었어요.' },
  { key: 'futureResponseNote', label: '다시 비슷한 일이 생긴다면 어떻게 대처할 수 있을까요?', placeholder: '예: 바로 결론 내리지 않고 사실을 먼저 확인할 거예요.' },
  { key: 'reframingNote', label: '처음보다 상황을 다르게 볼 수 있게 되었나요?', placeholder: '예: 상대가 나를 싫어해서라기보다 피곤했을 가능성을 떠올렸어요.' },
];

const seedState = {
  users: [
    { id: 'teacher-kim', name: '김교사', role: 'teacher', className: '상담실', loginId: 'teacher', password: 'teacher123', managedStudentIds: ['student-minji', 'student-jun'] },
    { id: 'student-minji', name: '김민지', role: 'student', className: '2-3', loginId: 'minji', password: 'student123' },
    { id: 'student-jun', name: '이준', role: 'student', className: '1-2', loginId: 'jun', password: 'student123' },
  ],
  records: [
    {
      id: 'record-1',
      userId: 'student-minji',
      eventDescription: '모둠 발표에서 준비한 말을 중간에 잊어버렸어요.',
      automaticThought: '친구들이 내가 못한다고 생각할 거야.',
      emotion: '불안, 창피함',
      emotionIntensityBefore: 82,
      behavior: '목소리가 작아지고 발표를 빨리 끝냈어요.',
      evidenceFor: '말을 멈춘 순간 친구들이 나를 쳐다봤어요.',
      evidenceAgainst: '발표가 끝난 후 친구가 수고했다고 말해줬어요.',
      balancedThought: '실수는 있었지만 준비를 많이 했고 다음에는 천천히 말하면 돼.',
      emotionIntensityAfter: 44,
      status: 'completed',
      createdAt: '2026-03-15T09:00:00.000Z',
      updatedAt: '2026-03-15T09:20:00.000Z',
    },
  ],
  evaluations: [
    {
      id: 'evaluation-1',
      recordId: 'record-1',
      userId: 'student-minji',
      helpfulnessScore: 78,
      emotionalChangeNote: '창피함이 조금 줄었고 다음 발표를 준비할 용기가 생겼어요.',
      futureResponseNote: '긴장되면 숨을 고르고 핵심 문장부터 말해볼 거예요.',
      reframingNote: '한 번의 실수가 전체를 망친 건 아니라는 점을 생각하게 되었어요.',
      createdAt: '2026-03-15T09:35:00.000Z',
    },
  ],
};

const storageKey = 'extraCBT-demo';
const ui = {
  currentUser: null,
  studentTab: 'home',
  teacherTab: 'overview',
  selectedStudentId: 'student-minji',
  selectedRecordId: null,
  step: 0,
  loginError: '',
  loginForm: { loginId: 'minji', password: 'student123' },
  draft: createEmptyDraft(),
  evaluationDraft: createEmptyEvaluation(),
};

let appState = loadState();
const app = document.getElementById('app');

function loadState() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : structuredClone(seedState);
}

function persistState() {
  localStorage.setItem(storageKey, JSON.stringify(appState));
}

function createEmptyDraft() {
  return {
    eventDescription: '', automaticThought: '', emotion: '', emotionIntensityBefore: 50,
    behavior: '', evidenceFor: '', evidenceAgainst: '', balancedThought: '', emotionIntensityAfter: 50, status: 'draft'
  };
}

function createEmptyEvaluation() {
  return { helpfulnessScore: 50, emotionalChangeNote: '', futureResponseNote: '', reframingNote: '' };
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function statusLabel(status) { return status === 'completed' ? '완료' : '임시저장'; }
function escapeHtml(value = '') { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }

function getStudents() { return appState.users.filter((user) => user.role === 'student'); }
function getVisibleRecords() {
  if (!ui.currentUser) return [];
  return ui.currentUser.role === 'teacher'
    ? appState.records.filter((record) => ui.currentUser.managedStudentIds.includes(record.userId))
    : appState.records.filter((record) => record.userId === ui.currentUser.id);
}
function getVisibleEvaluations() {
  if (!ui.currentUser) return [];
  return ui.currentUser.role === 'teacher'
    ? appState.evaluations.filter((evaluation) => ui.currentUser.managedStudentIds.includes(evaluation.userId))
    : appState.evaluations.filter((evaluation) => evaluation.userId === ui.currentUser.id);
}

function render() {
  app.innerHTML = ui.currentUser ? renderDashboard() : renderLogin();
  bindEvents();
}

function renderLogin() {
  return `
    <div class="app-shell login-shell">
      <section class="hero-card">
        <p class="eyebrow">중고등학생용 CBT 사고기록지</p>
        <h1>질문에 답하며 마음을 정리하는 반응형 웹앱</h1>
        <p class="hero-copy">학생은 스마트폰에서 짧게 기록을 시작하고, 교사는 학생별 작성 현황과 감정 변화를 한눈에 확인할 수 있습니다.</p>
        <div class="feature-grid">
          ${infoCard('학생 경험', '한 번에 한 질문씩 답하는 단계형 기록 흐름')}
          ${infoCard('교사 기능', '학생별 기록 열람, 작성 상태 확인, 상담 참고')}
          ${infoCard('보안', '역할 기반 접근 제어와 학생 간 기록 비공개 구조')}
        </div>
      </section>
      <section class="login-card">
        <h2>로그인</h2>
        <form id="login-form" class="stack-lg">
          <label>아이디<input name="loginId" value="${escapeHtml(ui.loginForm.loginId)}" placeholder="아이디" /></label>
          <label>비밀번호<input name="password" type="password" value="${escapeHtml(ui.loginForm.password)}" placeholder="비밀번호" /></label>
          ${ui.loginError ? `<p class="error-text">${escapeHtml(ui.loginError)}</p>` : ''}
          <button type="submit" class="primary-btn">시작하기</button>
        </form>
        <div class="demo-accounts">
          <strong>데모 계정</strong>
          <p>학생: minji / student123</p>
          <p>학생: jun / student123</p>
          <p>교사: teacher / teacher123</p>
        </div>
      </section>
    </div>`;
}

function renderDashboard() {
  return `
    <div class="app-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">extraCBT</p>
          <h1>${ui.currentUser.role === 'student' ? '나의 사고기록지' : '교사용 대시보드'}</h1>
        </div>
        <div class="topbar-actions">
          <span class="user-pill">${escapeHtml(ui.currentUser.name)} · ${ui.currentUser.role === 'student' ? escapeHtml(ui.currentUser.className) : '교사'}</span>
          <button class="ghost-btn" data-action="logout">로그아웃</button>
        </div>
      </header>
      ${ui.currentUser.role === 'student' ? renderStudent() : renderTeacher()}
    </div>`;
}

function renderStudent() {
  const visibleRecords = getVisibleRecords();
  const visibleEvaluations = getVisibleEvaluations();
  const selectedRecord = visibleRecords.find((record) => record.id === ui.selectedRecordId) || visibleRecords[0] || null;
  return `
    <main class="mobile-first-layout">
      <nav class="tabbar">
        ${tabBtn('student-tab', 'home', 'Home', ui.studentTab)}
        ${tabBtn('student-tab', 'records', '기록 확인', ui.studentTab)}
        ${tabBtn('student-tab', 'evaluation', '사후 평가', ui.studentTab)}
      </nav>
      ${ui.studentTab === 'home' ? renderStudentHome() : ''}
      ${ui.studentTab === 'records' ? `
        <section class="responsive-grid">
          <div class="panel stack-md">
            <div class="section-header"><div><p class="eyebrow">내 기록</p><h2>작성 목록</h2></div></div>
            ${visibleRecords.map((record) => `
              <button class="list-card ${selectedRecord && selectedRecord.id === record.id ? 'selected' : ''}" data-record-id="${record.id}">
                <strong>${escapeHtml(record.eventDescription.slice(0, 32))}</strong>
                <span>${escapeHtml(record.emotion || '감정 미입력')} · ${statusLabel(record.status)}</span>
                <span>${formatDate(record.updatedAt)}</span>
              </button>`).join('') || '<div class="empty-state"><p>아직 기록이 없습니다.</p></div>'}
          </div>
          <div class="panel stack-md">
            ${selectedRecord ? `<div class="section-header"><div><p class="eyebrow">기록 상세</p><h2>${escapeHtml(selectedRecord.eventDescription)}</h2></div><span class="status-pill">${statusLabel(selectedRecord.status)}</span></div>${recordDetail(selectedRecord)}` : '<div class="empty-state"><p>Home에서 첫 기록을 시작해 보세요.</p></div>'}
          </div>
        </section>` : ''}
      ${ui.studentTab === 'evaluation' ? `
        <section class="responsive-grid">
          <div class="panel stack-md">
            <div class="section-header"><div><p class="eyebrow">사후 평가</p><h2>기록 후 상태 점검</h2></div></div>
            <label>연결할 기록
              <select id="evaluation-record-select">${visibleRecords.map((record) => `<option value="${record.id}" ${selectedRecord && selectedRecord.id === record.id ? 'selected' : ''}>${escapeHtml(record.eventDescription.slice(0, 40))}</option>`).join('')}</select>
            </label>
            ${evaluationQuestions.map((question) => renderField(question, ui.evaluationDraft[question.key], 'evaluation')).join('')}
            <button class="primary-btn" data-action="save-evaluation" ${selectedRecord ? '' : 'disabled'}>사후 평가 저장</button>
          </div>
          <div class="panel stack-md">
            <div class="section-header"><div><p class="eyebrow">이전 응답</p><h2>나의 변화 기록</h2></div></div>
            ${visibleEvaluations.map((evaluation) => `<article class="detail-card"><strong>${formatDate(evaluation.createdAt)}</strong><p>도움 점수: ${evaluation.helpfulnessScore}/100</p><p>${escapeHtml(evaluation.emotionalChangeNote)}</p><p>${escapeHtml(evaluation.futureResponseNote)}</p></article>`).join('') || '<div class="empty-state"><p>아직 작성한 사후 평가가 없습니다.</p></div>'}
          </div>
        </section>` : ''}
    </main>`;
}

function renderStudentHome() {
  const question = questionFlow[ui.step];
  const width = ((ui.step + 1) / questionFlow.length) * 100;
  return `
    <section class="panel stack-lg">
      <div>
        <p class="eyebrow">질문 ${ui.step + 1} / ${questionFlow.length}</p>
        <h2>${question.label}</h2>
        <div class="progress-track"><div class="progress-fill" style="width:${width}%"></div></div>
      </div>
      ${renderField(question, ui.draft[question.key], 'draft')}
      <div class="button-row">
        <button class="ghost-btn" data-action="save-draft">임시저장</button>
        <button class="ghost-btn" data-action="prev-step" ${ui.step === 0 ? 'disabled' : ''}>이전</button>
        ${ui.step < questionFlow.length - 1 ? '<button class="primary-btn" data-action="next-step">다음</button>' : '<button class="primary-btn" data-action="complete-record">기록 완료</button>'}
      </div>
    </section>`;
}

function renderTeacher() {
  const students = getStudents().filter((student) => ui.currentUser.managedStudentIds.includes(student.id));
  const visibleRecords = getVisibleRecords();
  const visibleEvaluations = getVisibleEvaluations();
  const selectedRecord = visibleRecords.find((record) => record.id === ui.selectedRecordId) || visibleRecords.find((record) => record.userId === ui.selectedStudentId) || null;
  return `
    <main class="teacher-layout">
      <nav class="tabbar teacher-tabs">
        ${tabBtn('teacher-tab', 'overview', '개요', ui.teacherTab)}
        ${tabBtn('teacher-tab', 'records', '학생 기록 조회', ui.teacherTab)}
        ${tabBtn('teacher-tab', 'accounts', '학생 관리', ui.teacherTab)}
      </nav>
      ${ui.teacherTab === 'overview' ? `
        <section class="metric-grid">
          ${metricCard('관리 학생 수', ui.currentUser.managedStudentIds.length, '학생 계정 기반 권한 분리')}
          ${metricCard('전체 기록 수', visibleRecords.length, '교사가 열람 가능한 기록')}
          ${metricCard('완료 기록', visibleRecords.filter((record) => record.status === 'completed').length, '상담에 활용 가능한 항목')}
          ${metricCard('사후 평가 수', visibleEvaluations.length, '효과 확인 및 자기 점검')}
        </section>` : ''}
      ${ui.teacherTab === 'records' ? `
        <section class="responsive-grid teacher-records">
          <div class="panel stack-md">
            <div class="section-header"><div><p class="eyebrow">학생 필터</p><h2>학생별 기록</h2></div></div>
            <label>학생 선택<select id="teacher-student-select">${students.map((student) => `<option value="${student.id}" ${student.id === ui.selectedStudentId ? 'selected' : ''}>${escapeHtml(student.name)} · ${escapeHtml(student.className)}</option>`).join('')}</select></label>
            ${visibleRecords.filter((record) => record.userId === ui.selectedStudentId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((record) => `
              <button class="list-card ${selectedRecord && selectedRecord.id === record.id ? 'selected' : ''}" data-record-id="${record.id}">
                <strong>${escapeHtml(record.eventDescription)}</strong>
                <span>${escapeHtml(record.emotion)}</span>
                <span>${formatDate(record.updatedAt)}</span>
              </button>`).join('') || '<div class="empty-state"><p>선택한 학생의 기록이 아직 없습니다.</p></div>'}
          </div>
          <div class="panel stack-md">
            ${selectedRecord ? `<div class="section-header"><div><p class="eyebrow">상세 보기</p><h2>${escapeHtml((students.find((student) => student.id === selectedRecord.userId) || {}).name || '')} 학생 기록</h2></div></div>${recordDetail(selectedRecord)}<h3>연결된 사후 평가</h3>${visibleEvaluations.filter((evaluation) => evaluation.recordId === selectedRecord.id).map((evaluation) => `<article class="detail-card"><p>도움 점수: ${evaluation.helpfulnessScore}/100</p><p>${escapeHtml(evaluation.emotionalChangeNote)}</p><p>${escapeHtml(evaluation.futureResponseNote)}</p><p>${escapeHtml(evaluation.reframingNote)}</p></article>`).join('') || '<p>아직 사후 평가가 없습니다.</p>'}` : '<div class="empty-state"><p>선택한 학생의 기록이 아직 없습니다.</p></div>'}
          </div>
        </section>` : ''}
      ${ui.teacherTab === 'accounts' ? `
        <section class="responsive-grid">
          <div class="panel stack-md">
            <div class="section-header"><div><p class="eyebrow">계정 관리</p><h2>학생 목록</h2></div><button class="primary-btn" data-action="create-student">학생 계정 추가</button></div>
            ${students.map((student) => {
              const count = visibleRecords.filter((record) => record.userId === student.id).length;
              return `<article class="detail-card"><strong>${escapeHtml(student.name)}</strong><p>${escapeHtml(student.className)}</p><p>아이디: ${escapeHtml(student.loginId)}</p><p>작성 현황: ${count}건</p></article>`;
            }).join('')}
          </div>
          <div class="panel stack-md">
            <div class="section-header"><div><p class="eyebrow">운영 메모</p><h2>배포 권장 사항</h2></div></div>
            <ul class="bullet-list">
              <li>교사 PC 서버 운영 시 DDNS 또는 터널링 서비스와 HTTPS를 함께 구성하세요.</li>
              <li>실서비스에서는 비밀번호 해시, 서버 세션/JWT, 데이터베이스 RBAC를 적용해야 합니다.</li>
              <li>향후 학교 서버 또는 클라우드 이전을 고려해 프론트/백엔드 분리를 유지하세요.</li>
            </ul>
          </div>
        </section>` : ''}
    </main>`;
}

function recordDetail(record) {
  return [['사건', record.eventDescription], ['자동적 생각', record.automaticThought], ['감정', record.emotion], ['감정 강도(전)', `${record.emotionIntensityBefore}/100`], ['행동', record.behavior], ['근거', record.evidenceFor], ['다른 가능성', record.evidenceAgainst], ['균형 잡힌 생각', record.balancedThought], ['감정 강도(후)', `${record.emotionIntensityAfter}/100`]].map(([label, value]) => `<article class="detail-card"><strong>${label}</strong><p>${escapeHtml(value || '')}</p></article>`).join('');
}
function infoCard(title, text) { return `<article class="info-card"><strong>${title}</strong><p>${text}</p></article>`; }
function metricCard(label, value, helper) { return `<article class="metric-card"><p>${label}</p><strong>${value}</strong><span>${helper}</span></article>`; }
function tabBtn(group, value, label, current) { return `<button class="${current === value ? 'active' : ''}" data-tab-group="${group}" data-tab-value="${value}">${label}</button>`; }
function renderField(question, value, mode) {
  if (question.type === 'range') {
    return `<label class="stack-sm"><span>${question.label}</span><input type="range" min="0" max="100" value="${value}" data-field-mode="${mode}" data-field-key="${question.key}" /><strong>${value}/100</strong></label>`;
  }
  return `<label class="stack-sm"><span>${question.label}</span><textarea rows="4" data-field-mode="${mode}" data-field-key="${question.key}" placeholder="${escapeHtml(question.placeholder || '')}">${escapeHtml(value || '')}</textarea></label>`;
}

function bindEvents() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    loginForm.loginId.addEventListener('input', (event) => { ui.loginForm.loginId = event.target.value; });
    loginForm.password.addEventListener('input', (event) => { ui.loginForm.password = event.target.value; });
  }

  document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', handleAction));
  document.querySelectorAll('[data-tab-group]').forEach((button) => button.addEventListener('click', handleTabChange));
  document.querySelectorAll('[data-record-id]').forEach((button) => button.addEventListener('click', () => { ui.selectedRecordId = button.dataset.recordId; render(); }));
  document.querySelectorAll('[data-field-key]').forEach((field) => field.addEventListener('input', handleFieldChange));

  const teacherSelect = document.getElementById('teacher-student-select');
  if (teacherSelect) teacherSelect.addEventListener('change', (event) => { ui.selectedStudentId = event.target.value; ui.selectedRecordId = null; render(); });
  const evalSelect = document.getElementById('evaluation-record-select');
  if (evalSelect) evalSelect.addEventListener('change', (event) => { ui.selectedRecordId = event.target.value; render(); });
}

function handleLogin(event) {
  event.preventDefault();
  const found = appState.users.find((user) => user.loginId === ui.loginForm.loginId && user.password === ui.loginForm.password);
  if (!found) {
    ui.loginError = '로그인 정보를 다시 확인해 주세요. 데모 계정은 화면 아래에 안내되어 있어요.';
    render();
    return;
  }
  ui.currentUser = found;
  ui.studentTab = 'home';
  ui.teacherTab = 'overview';
  ui.selectedStudentId = found.role === 'teacher' ? found.managedStudentIds[0] : found.id;
  ui.selectedRecordId = null;
  ui.loginError = '';
  render();
}

function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  if (action === 'logout') {
    ui.currentUser = null;
  } else if (action === 'next-step') {
    ui.step = Math.min(ui.step + 1, questionFlow.length - 1);
  } else if (action === 'prev-step') {
    ui.step = Math.max(ui.step - 1, 0);
  } else if (action === 'save-draft') {
    persistRecord('draft');
  } else if (action === 'complete-record') {
    persistRecord('completed');
  } else if (action === 'save-evaluation') {
    saveEvaluation();
  } else if (action === 'create-student') {
    createDemoStudent();
  }
  render();
}

function handleTabChange(event) {
  const { tabGroup, tabValue } = event.currentTarget.dataset;
  if (tabGroup === 'student-tab') ui.studentTab = tabValue;
  if (tabGroup === 'teacher-tab') ui.teacherTab = tabValue;
  render();
}

function handleFieldChange(event) {
  const { fieldMode, fieldKey } = event.target.dataset;
  const value = event.target.type === 'range' ? Number(event.target.value) : event.target.value;
  if (fieldMode === 'draft') ui.draft[fieldKey] = value;
  if (fieldMode === 'evaluation') ui.evaluationDraft[fieldKey] = value;
  if (event.target.type === 'range') render();
}

function persistRecord(status) {
  if (!ui.currentUser || ui.currentUser.role !== 'student') return;
  const now = new Date().toISOString();
  const id = ui.draft.id || `record-${Date.now()}`;
  const record = { ...ui.draft, id, userId: ui.currentUser.id, status, createdAt: ui.draft.createdAt || now, updatedAt: now };
  appState.records = [record, ...appState.records.filter((item) => item.id !== id)];
  ui.selectedRecordId = id;
  ui.draft = createEmptyDraft();
  ui.step = 0;
  ui.studentTab = 'records';
  persistState();
}

function saveEvaluation() {
  const visibleRecords = getVisibleRecords();
  const selectedRecord = visibleRecords.find((record) => record.id === ui.selectedRecordId) || visibleRecords[0];
  if (!ui.currentUser || ui.currentUser.role !== 'student' || !selectedRecord) return;
  const evaluation = { ...ui.evaluationDraft, id: `evaluation-${Date.now()}`, recordId: selectedRecord.id, userId: ui.currentUser.id, createdAt: new Date().toISOString() };
  appState.evaluations = [evaluation, ...appState.evaluations];
  ui.evaluationDraft = createEmptyEvaluation();
  persistState();
}

function createDemoStudent() {
  const stamp = Date.now().toString().slice(-4);
  const student = { id: `student-${stamp}`, name: `새학생${stamp}`, role: 'student', className: '신규 학급', loginId: `student${stamp}`, password: 'welcome123' };
  appState.users.push(student);
  const teacher = appState.users.find((user) => user.id === ui.currentUser.id);
  teacher.managedStudentIds = [...new Set([...teacher.managedStudentIds, student.id])];
  ui.selectedStudentId = student.id;
  persistState();
}

render();
