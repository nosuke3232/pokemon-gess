const API_ROOT = "https://pokeapi.co/api/v2";
const MAX_SPECIES_ID = 1025;
const MAX_CONDITIONS = 6;
const MAX_DISTINCT_FIELDS = 3;
const MAX_SAME_FIELD = 2;
const RULES_SEEN_KEY = "pokemonGuessRulesSeenV6";
const GAME_HISTORY_KEY = "pokemonGuessGameHistoryV3";
const DAILY_RECORDS_KEY = "pokemonGuessDailyRecordsV1";
const DAILY_EPOCH = "2026-01-01";

const INPUT_SELECTABLE_FIELDS = ["generation", "stat", "nameLength", "height", "weight", "ability", "move"];

const NORMAL_DIFFICULTIES = {
  free:   { key: "free", label: "フリー", questionLimit: null, hintLimit: null, fieldUseLimit: null, scoreMultiplier: 1.0 },
  easy:   { key: "easy", label: "かんたん", questionLimit: 20, hintLimit: 3, fieldUseLimit: null, scoreMultiplier: 1.0 },
  normal: { key: "normal", label: "ふつう", questionLimit: 15, hintLimit: 2, fieldUseLimit: null, scoreMultiplier: 1.2 },
  hard:   { key: "hard", label: "むずかしい", questionLimit: 12, hintLimit: 1, fieldUseLimit: 3, scoreMultiplier: 1.5 },
  expert: { key: "expert", label: "エキスパート", questionLimit: 10, hintLimit: 0, fieldUseLimit: 3, scoreMultiplier: 2.0 }
};

const AUTOCOMPLETE_SOURCES = {
  pokemon: [
    "https://cdn.jsdelivr.net/gh/PokeAPI/pokeapi@master/data/v2/csv/pokemon_species_names.csv",
    "https://raw.githubusercontent.com/PokeAPI/pokeapi/refs/heads/master/data/v2/csv/pokemon_species_names.csv"
  ],
  move: [
    "https://cdn.jsdelivr.net/gh/PokeAPI/pokeapi@master/data/v2/csv/move_names.csv",
    "https://raw.githubusercontent.com/PokeAPI/pokeapi/refs/heads/master/data/v2/csv/move_names.csv"
  ],
  ability: [
    "https://cdn.jsdelivr.net/gh/PokeAPI/pokeapi@master/data/v2/csv/ability_names.csv",
    "https://raw.githubusercontent.com/PokeAPI/pokeapi/refs/heads/master/data/v2/csv/ability_names.csv"
  ]
};

const TYPE_LABELS = {
  normal: "ノーマル", fire: "ほのお", water: "みず", electric: "でんき", grass: "くさ",
  ice: "こおり", fighting: "かくとう", poison: "どく", ground: "じめん", flying: "ひこう",
  psychic: "エスパー", bug: "むし", rock: "いわ", ghost: "ゴースト", dragon: "ドラゴン",
  dark: "あく", steel: "はがね", fairy: "フェアリー"
};

const TYPE_EFFECTIVENESS = {
  normal:   { double: [], half: ["rock", "steel"], zero: ["ghost"] },
  fire:     { double: ["grass", "ice", "bug", "steel"], half: ["fire", "water", "rock", "dragon"], zero: [] },
  water:    { double: ["fire", "ground", "rock"], half: ["water", "grass", "dragon"], zero: [] },
  electric: { double: ["water", "flying"], half: ["electric", "grass", "dragon"], zero: ["ground"] },
  grass:    { double: ["water", "ground", "rock"], half: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], zero: [] },
  ice:      { double: ["grass", "ground", "flying", "dragon"], half: ["fire", "water", "ice", "steel"], zero: [] },
  fighting: { double: ["normal", "ice", "rock", "dark", "steel"], half: ["poison", "flying", "psychic", "bug", "fairy"], zero: ["ghost"] },
  poison:   { double: ["grass", "fairy"], half: ["poison", "ground", "rock", "ghost"], zero: ["steel"] },
  ground:   { double: ["fire", "electric", "poison", "rock", "steel"], half: ["grass", "bug"], zero: ["flying"] },
  flying:   { double: ["grass", "fighting", "bug"], half: ["electric", "rock", "steel"], zero: [] },
  psychic:  { double: ["fighting", "poison"], half: ["psychic", "steel"], zero: ["dark"] },
  bug:      { double: ["grass", "psychic", "dark"], half: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], zero: [] },
  rock:     { double: ["fire", "ice", "flying", "bug"], half: ["fighting", "ground", "steel"], zero: [] },
  ghost:    { double: ["psychic", "ghost"], half: ["dark"], zero: ["normal"] },
  dragon:   { double: ["dragon"], half: ["steel"], zero: ["fairy"] },
  dark:     { double: ["psychic", "ghost"], half: ["fighting", "dark", "fairy"], zero: [] },
  steel:    { double: ["ice", "rock", "fairy"], half: ["fire", "water", "electric", "steel"], zero: [] },
  fairy:    { double: ["fighting", "dragon", "dark"], half: ["fire", "poison", "steel"], zero: [] }
};

const EGG_LABELS = {
  monster: "かいじゅう", "water1": "すいちゅう1", bug: "むし", flying: "ひこう", field: "りくじょう",
  fairy: "ようせい", grass: "しょくぶつ", "human-like": "ひとがた", "water3": "すいちゅう3",
  mineral: "こうぶつ", amorphous: "ふていけい", "water2": "すいちゅう2", ditto: "メタモン",
  dragon: "ドラゴン", undiscovered: "みはっけん"
};

const STAT_LABELS = {
  hp: "HP", attack: "こうげき", defense: "ぼうぎょ", "special-attack": "とくこう",
  "special-defense": "とくぼう", speed: "すばやさ", total: "合計種族値"
};

const FIELD_LABELS = {
  generation: "登場した世代", stat: "種族値", evolutionStage: "進化の段階",
  nameLength: "名前の文字数", height: "高さ", weight: "重さ", type: "タイプ", weakness: "弱点", ability: "特性", move: "覚える技",
  egg: "タマゴグループ", mega: "メガシンカ", special: "特殊な項目"
};

const STARTER_FAMILY_IDS = new Set([
  1,2,3,4,5,6,7,8,9, 152,153,154,155,156,157,158,159,160,
  252,253,254,255,256,257,258,259,260, 387,388,389,390,391,392,393,394,395,
  495,496,497,498,499,500,501,502,503, 650,651,652,653,654,655,656,657,658,
  722,723,724,725,726,727,728,729,730, 810,811,812,813,814,815,816,817,818,
  906,907,908,909,910,911,912,913,914
]);

const PSEUDO_LEGENDARY_FAMILY_IDS = new Set([
  147,148,149, 246,247,248, 371,372,373, 374,375,376, 443,444,445,
  633,634,635, 704,705,706, 782,783,784, 885,886,887, 996,997,998
]);
const ULTRA_BEAST_IDS = new Set([793,794,795,796,797,798,799,803,804,805,806]);
const SUB_LEGENDARY_IDS = new Set([
  144,145,146, 243,244,245, 377,378,379, 380,381, 480,481,482, 485,486,488,
  638,639,640, 641,642,645, 772,773, 785,786,787,788, 891,892, 894,895,896,897,898,
  1001,1002,1003,1004, 1014,1015,1016
]);
const CLASSIC_MEGA_IDS = new Set([
  3,6,9,15,18,65,80,94,115,127,130,142,150,181,208,212,214,229,248,254,257,260,
  282,302,303,306,308,310,319,323,334,354,359,362,373,376,380,381,384,428,445,448,
  460,475,531,719
]);
const ZA_NEW_MEGA_IDS = new Set([71,149,154,160,500,604,652,655,658,687,701,358,807,998]);
const MEGA_IDS = new Set([...CLASSIC_MEGA_IDS, ...ZA_NEW_MEGA_IDS]);


const HINTABLE_FIELDS = [
  "generation", "stat", "evolutionStage", "nameLength", "height", "weight",
  "type", "weakness", "ability", "move", "egg", "mega"
];

const autocompleteCache = { pokemon: null, move: null, ability: null };
const autocompletePromises = { pokemon: null, move: null, ability: null };

const ui = {
  loadingPanel: document.querySelector("#loading-panel"),
  loadingMessage: document.querySelector("#loading-message"),
  gamePanel: document.querySelector("#game-panel"),
  resultPanel: document.querySelector("#result-panel"),
  newGameButton: document.querySelector("#new-game-button"),
  playAgainButton: document.querySelector("#play-again-button"),
  rulesButton: document.querySelector("#rules-button"),
  gameHistoryButton: document.querySelector("#game-history-button"),
  rulesModal: document.querySelector("#rules-modal"),
  gameHistoryModal: document.querySelector("#game-history-modal"),
  rulesConfirmButton: document.querySelector("#rules-confirm-button"),
  savedGamesList: document.querySelector("#saved-games-list"),
  clearGameHistoryButton: document.querySelector("#clear-game-history-button"),
  addConditionButton: document.querySelector("#add-condition-button"),
  hintButton: document.querySelector("#hint-button"),
  hintPanel: document.querySelector("#hint-panel"),
  hintText: document.querySelector("#hint-text"),
  askButton: document.querySelector("#ask-button"),
  conditions: document.querySelector("#conditions"),
  conditionTemplate: document.querySelector("#condition-template"),
  questionFeedback: document.querySelector("#question-feedback"),
  questionCountBadge: document.querySelector("#question-count-badge"),
  historyList: document.querySelector("#history-list"),
  historyContent: document.querySelector("#history-content"),
  historyToggleButton: document.querySelector("#history-toggle-button"),
  guessInput: document.querySelector("#guess-input"),
  guessSuggestions: document.querySelector("#guess-suggestions"),
  guessButton: document.querySelector("#guess-button"),
  surrenderButton: document.querySelector("#surrender-button"),
  guessFeedback: document.querySelector("#guess-feedback"),
  resultKicker: document.querySelector("#result-kicker"),
  resultName: document.querySelector("#result-name"),
  resultSummary: document.querySelector("#result-summary"),
  resultArt: document.querySelector("#result-art"),
  resultDetails: document.querySelector("#result-details"),
  resultDetailsList: document.querySelector("#result-details-list")
};

Object.assign(ui, {
  modePanel: document.querySelector("#mode-panel"),
  normalSettingsPanel: document.querySelector("#normal-settings-panel"),
  dailySettingsPanel: document.querySelector("#daily-settings-panel"),
  inputSettingsPanel: document.querySelector("#input-settings-panel"),
  customSettingsPanel: document.querySelector("#custom-settings-panel"),
  startNormalButton: document.querySelector("#start-normal-button"),
  startDailyButton: document.querySelector("#start-daily-button"),
  startInputButton: document.querySelector("#start-input-button"),
  startCustomButton: document.querySelector("#start-custom-button"),
  dailyStatus: document.querySelector("#daily-status"),
  dailyNumber: document.querySelector("#daily-number"),
  currentModeLabel: document.querySelector("#current-mode-label"),
  questionLimitChip: document.querySelector("#question-limit-chip"),
  hintLimitChip: document.querySelector("#hint-limit-chip"),
  fieldLimitChip: document.querySelector("#field-limit-chip"),
  hintCountBadge: document.querySelector("#hint-count-badge"),
  conditionRuleNote: document.querySelector("#condition-rule-note"),
  logicRow: document.querySelector("#logic-row"),
  resultScoreBox: document.querySelector("#result-score-box"),
  shareDailyButton: document.querySelector("#share-daily-button"),
  resultModeButton: document.querySelector("#result-mode-button"),
  customQuestionLimit: document.querySelector("#custom-question-limit"),
  customHintLimit: document.querySelector("#custom-hint-limit"),
  customFieldLimit: document.querySelector("#custom-field-limit"),
  customConditionLimit: document.querySelector("#custom-condition-limit"),
  customGuessLimit: document.querySelector("#custom-guess-limit"),
  customHistoryVisible: document.querySelector("#custom-history-visible"),
  customLogicEnabled: document.querySelector("#custom-logic-enabled"),
  inputFieldOptions: document.querySelector("#input-field-options"),
  inputSelectedCount: document.querySelector("#input-selected-count"),
  inputSettingsFeedback: document.querySelector("#input-settings-feedback"),
  customFieldOptions: document.querySelector("#custom-field-options"),
  customSelectedCount: document.querySelector("#custom-selected-count"),
  customSettingsFeedback: document.querySelector("#custom-settings-feedback"),
  customSelectAll: document.querySelector("#custom-select-all"),
  customClearAll: document.querySelector("#custom-clear-all")
});

let state = freshState();
let lastConfig = null;

function freshState() {
  return {
    targetPokemon: null,
    targetSpecies: null,
    targetNameJa: "",
    generation: null,
    evolutionStage: null,
    commitmentRaw: "",
    commitmentHash: "",
    questionCount: 0,
    hintCount: 0,
    wrongGuesses: 0,
    guessAttempts: 0,
    totalConditionsUsed: 0,
    fieldUseCounts: {},
    history: [],
    askedDetails: [],
    hintedFields: [],
    startedAt: new Date().toISOString(),
    ended: false,
    saved: false,
    outcome: null,
    config: null,
    mode: null,
    dailyKey: null
  };
}

function baseGameConfig() {
  return {
    mode: "normal",
    modeLabel: "通常モード",
    difficulty: "free",
    difficultyLabel: "フリー",
    questionLimit: null,
    hintLimit: null,
    fieldUseLimit: null,
    maxConditions: 6,
    guessLimit: null,
    historyVisible: true,
    specialEnabled: true,
    logicEnabled: true,
    allowedFields: null,
    scoreMultiplier: 1.0
  };
}

function normalConfig(difficultyKey) {
  const difficulty = NORMAL_DIFFICULTIES[difficultyKey] ?? NORMAL_DIFFICULTIES.free;
  return {
    ...baseGameConfig(),
    mode: "normal",
    modeLabel: "通常モード",
    difficulty: difficulty.key,
    difficultyLabel: difficulty.label,
    questionLimit: difficulty.questionLimit,
    hintLimit: difficulty.hintLimit,
    fieldUseLimit: difficulty.fieldUseLimit,
    scoreMultiplier: difficulty.scoreMultiplier
  };
}

function dailyConfig() {
  return {
    ...baseGameConfig(),
    mode: "daily",
    modeLabel: "デイリーチャレンジ",
    difficulty: "daily",
    difficultyLabel: "デイリー",
    questionLimit: 15,
    hintLimit: 1,
    fieldUseLimit: null,
    scoreMultiplier: 1.0
  };
}

function inputConfig(selectedFields) {
  return {
    ...baseGameConfig(),
    mode: "input",
    modeLabel: "入力制限モード",
    difficulty: "input",
    difficultyLabel: "制限なし",
    allowedFields: [...selectedFields],
    specialEnabled: false,
    scoreMultiplier: 1.0
  };
}

function checkedFieldValues(container) {
  if (!container) return [];
  return [...container.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value);
}

function updateInputFieldSelection() {
  const selected = checkedFieldValues(ui.inputFieldOptions);
  if (ui.inputSelectedCount) ui.inputSelectedCount.textContent = `${selected.length}項目選択`;
  if (ui.startInputButton) ui.startInputButton.disabled = selected.length === 0;
  if (ui.inputSettingsFeedback) {
    ui.inputSettingsFeedback.textContent = selected.length === 0 ? "使用する質問項目を1つ以上選択してください。" : "";
    ui.inputSettingsFeedback.className = selected.length === 0 ? "inline-feedback feedback-no" : "inline-feedback";
  }
}

function updateCustomFieldSelection() {
  const selected = checkedFieldValues(ui.customFieldOptions);
  if (ui.customSelectedCount) ui.customSelectedCount.textContent = `${selected.length}項目選択`;
  if (ui.startCustomButton) ui.startCustomButton.disabled = selected.length === 0;
  if (ui.customSettingsFeedback) {
    ui.customSettingsFeedback.textContent = selected.length === 0 ? "使用できる質問項目を1つ以上選択してください。" : "";
    ui.customSettingsFeedback.className = selected.length === 0 ? "inline-feedback feedback-no" : "inline-feedback";
  }
}

function zeroMeansUnlimited(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function customConfigFromUi() {
  const allowedFields = checkedFieldValues(ui.customFieldOptions);
  return {
    ...baseGameConfig(),
    mode: "custom",
    modeLabel: "カスタムモード",
    difficulty: "custom",
    difficultyLabel: "カスタム",
    questionLimit: zeroMeansUnlimited(ui.customQuestionLimit.value),
    hintLimit: zeroMeansUnlimited(ui.customHintLimit.value),
    fieldUseLimit: zeroMeansUnlimited(ui.customFieldLimit.value),
    maxConditions: Math.max(1, Math.min(6, Number(ui.customConditionLimit.value) || 1)),
    guessLimit: zeroMeansUnlimited(ui.customGuessLimit.value),
    historyVisible: ui.customHistoryVisible.checked,
    specialEnabled: allowedFields.includes("special"),
    logicEnabled: ui.customLogicEnabled.checked,
    allowedFields,
    scoreMultiplier: 1.0
  };
}

function allSetupPanels() {
  return [ui.normalSettingsPanel, ui.dailySettingsPanel, ui.inputSettingsPanel, ui.customSettingsPanel];
}

function hideMainPanels() {
  ui.modePanel.classList.add("hidden");
  allSetupPanels().forEach(panel => panel.classList.add("hidden"));
  ui.loadingPanel.classList.add("hidden");
  ui.gamePanel.classList.add("hidden");
  ui.resultPanel.classList.add("hidden");
}

function showModeSelection() {
  hideMainPanels();
  ui.modePanel.classList.remove("hidden");
  refreshDailySetup();
}

function showSetupPanel(panel) {
  hideMainPanels();
  panel.classList.remove("hidden");
  if (panel === ui.dailySettingsPanel) refreshDailySetup();
}

function jstDateKey(date = new Date()) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function dailyNumberForKey(key) {
  const start = Date.parse(`${DAILY_EPOCH}T00:00:00Z`);
  const current = Date.parse(`${key}T00:00:00Z`);
  return Math.max(1, Math.floor((current - start) / 86400000) + 1);
}

function stableHash32(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function dailySpeciesId(key) {
  return (stableHash32(`PokemonGuessDaily|${key}`) % MAX_SPECIES_ID) + 1;
}

function readDailyRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DAILY_RECORDS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function dailyRecordForToday() {
  const key = jstDateKey();
  return readDailyRecords().find(record => record.date === key) ?? null;
}

function refreshDailySetup() {
  if (!ui.dailyStatus || !ui.dailyNumber) return;
  const key = jstDateKey();
  const number = dailyNumberForKey(key);
  ui.dailyNumber.textContent = `Pokémon Guess Daily #${number}`;
  const record = dailyRecordForToday();
  if (record) {
    ui.dailyStatus.textContent = record.outcome === "win"
      ? `今日はクリア済みです。${record.questionCount}/15問で正解しました。`
      : "今日はプレイ済みです。次の問題は明日0:00に更新されます。";
    ui.dailyStatus.className = `inline-feedback ${record.outcome === "win" ? "feedback-yes" : "feedback-no"}`;
    ui.startDailyButton.disabled = true;
    ui.startDailyButton.textContent = "今日はプレイ済み";
  } else {
    ui.dailyStatus.textContent = "まだ今日の問題には挑戦していません。";
    ui.dailyStatus.className = "inline-feedback";
    ui.startDailyButton.disabled = false;
    ui.startDailyButton.textContent = "今日の問題を始める";
  }
}

function randomSpeciesId() {
  return Math.floor(Math.random() * MAX_SPECIES_ID) + 1;
}

function randomSalt() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`通信エラー: ${response.status}`);
  return response.json();
}

async function fetchTextWithFallback(urls) {
  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`通信エラー: ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("候補データを取得できませんでした。");
}

function japaneseName(names, fallback) {
  return names?.find(item => item.language?.name === "ja-Hrkt")?.name
    ?? names?.find(item => item.language?.name === "ja")?.name
    ?? fallback;
}

function parseGeneration(generationName) {
  const roman = generationName?.replace("generation-", "") ?? "";
  const map = { i:1, ii:2, iii:3, iv:4, v:5, vi:6, vii:7, viii:8, ix:9 };
  return map[roman] ?? null;
}

function getEvolutionStage(chain, targetSpeciesName) {
  let found = null;
  function walk(node, depth) {
    if (!node || found) return;
    if (node.species?.name === targetSpeciesName) {
      if (depth === 0 && (node.evolves_to?.length ?? 0) === 0) found = "none";
      else if (depth === 0) found = "base";
      else if (depth === 1) found = "first";
      else found = "second";
      return;
    }
    for (const child of node.evolves_to ?? []) walk(child, depth + 1);
  }
  walk(chain, 0);
  return found;
}

function totalBaseStat() {
  return state.targetPokemon.stats.reduce((sum, item) => sum + Number(item.base_stat || 0), 0);
}

function japaneseNameLength() {
  return Array.from(state.targetNameJa || "").length;
}

function regionalFormGenerations() {
  const generations = new Set();
  for (const variety of state.targetSpecies?.varieties ?? []) {
    const name = variety.pokemon?.name ?? "";
    if (name.includes("-alola")) generations.add(7);
    if (name.includes("-galar")) generations.add(8);
    if (name.includes("-hisui")) generations.add(8);
    if (name.includes("-paldea")) generations.add(9);
  }
  return [...generations].sort((a, b) => a - b);
}

function extractResourceId(url) {
  const match = String(url ?? "").match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function katakanaToHiragana(text) {
  return String(text ?? "").replace(/[ァ-ヶ]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60));
}

function normalizeText(text) {
  return String(text ?? "").trim().replace(/[　\s]+/g, "").toLowerCase();
}

function normalizeKanaSearch(text) {
  return katakanaToHiragana(normalizeText(text))
    .replace(/[・･]/g, "")
    .replace(/[‐‑‒–—―ー]/g, "ー");
}

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

async function loadAutocompleteIndex(kind) {
  if (autocompleteCache[kind]) return autocompleteCache[kind];
  if (autocompletePromises[kind]) return autocompletePromises[kind];

  autocompletePromises[kind] = (async () => {
    const text = await fetchTextWithFallback(AUTOCOMPLETE_SOURCES[kind]);
    const lines = text.split(/\r?\n/).filter(Boolean);
    const items = [];
    for (let i = 1; i < lines.length; i += 1) {
      const cells = parseCsvLine(lines[i]);
      const id = Number(cells[0]);
      const languageId = Number(cells[1]);
      const name = cells[2] ?? "";
      if (languageId !== 1 || !id || !name) continue;
      if (kind === "pokemon" && id > MAX_SPECIES_ID) continue;
      items.push({ id, name, searchKey: normalizeKanaSearch(name) });
    }
    items.sort((a, b) => a.id - b.id);
    autocompleteCache[kind] = items;
    return items;
  })().finally(() => {
    autocompletePromises[kind] = null;
  });

  return autocompletePromises[kind];
}

function findSuggestions(items, query, limit = 12) {
  const key = normalizeKanaSearch(query);
  if (!key) return [];
  const starts = [];
  const contains = [];
  for (const item of items) {
    if (item.searchKey.startsWith(key)) starts.push(item);
    else if (item.searchKey.includes(key)) contains.push(item);
    if (starts.length >= limit) break;
  }
  if (starts.length < limit) {
    for (const item of contains) {
      starts.push(item);
      if (starts.length >= limit) break;
    }
  }
  return starts;
}

function hideSuggestionList(list) {
  list.classList.add("hidden");
  list.innerHTML = "";
}

function selectAutocompleteItem(input, list, item) {
  input.value = item.name;
  input.dataset.selectedId = String(item.id);
  input.dataset.selectedName = item.name;
  hideSuggestionList(list);
  input.dispatchEvent(new CustomEvent("autocomplete-selected", { bubbles: true, detail: item }));
}

function renderSuggestions(input, list, items, kind) {
  list.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "suggestion-empty";
    empty.textContent = "候補が見つかりません。";
    list.appendChild(empty);
    list.classList.remove("hidden");
    return;
  }
  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestion-item";
    button.dataset.index = String(index);
    button.textContent = item.name;
    button.addEventListener("mousedown", event => {
      event.preventDefault();
      selectAutocompleteItem(input, list, item);
    });
    list.appendChild(button);
  });
  list.dataset.kind = kind;
  list.classList.remove("hidden");
}

function setupAutocomplete(input, list, kind) {
  let activeIndex = -1;
  let requestToken = 0;

  const refresh = async () => {
    const value = input.value.trim();
    if (input.dataset.selectedName && normalizeKanaSearch(value) !== normalizeKanaSearch(input.dataset.selectedName)) {
      delete input.dataset.selectedId;
      delete input.dataset.selectedName;
    }
    if (!value) {
      hideSuggestionList(list);
      return;
    }
    const token = ++requestToken;
    list.innerHTML = '<div class="suggestion-empty">候補を準備しています…</div>';
    list.classList.remove("hidden");
    try {
      const items = await loadAutocompleteIndex(kind);
      if (token !== requestToken) return;
      const suggestions = findSuggestions(items, value);
      activeIndex = -1;
      renderSuggestions(input, list, suggestions, kind);
    } catch (error) {
      console.error(error);
      list.innerHTML = '<div class="suggestion-empty">候補データを取得できませんでした。</div>';
      list.classList.remove("hidden");
    }
  };

  input.addEventListener("input", refresh);
  input.addEventListener("focus", () => {
    if (input.value.trim()) refresh();
  });
  input.addEventListener("blur", () => setTimeout(() => hideSuggestionList(list), 120));
  input.addEventListener("keydown", event => {
    const buttons = [...list.querySelectorAll(".suggestion-item")];
    if (list.classList.contains("hidden") || !buttons.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % buttons.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + buttons.length) % buttons.length;
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      buttons[activeIndex].dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      return;
    } else {
      return;
    }
    buttons.forEach((button, index) => button.classList.toggle("active", index === activeIndex));
  });
}

async function resolveAutocompleteItem(input, kind) {
  const value = input.value.trim();
  if (!value) return null;
  if (input.dataset.selectedId && input.dataset.selectedName
      && normalizeKanaSearch(value) === normalizeKanaSearch(input.dataset.selectedName)) {
    return { id: Number(input.dataset.selectedId), name: input.dataset.selectedName };
  }
  const items = await loadAutocompleteIndex(kind);
  const key = normalizeKanaSearch(value);
  const exact = items.find(item => item.searchKey === key);
  if (!exact) return null;
  input.dataset.selectedId = String(exact.id);
  input.dataset.selectedName = exact.name;
  input.value = exact.name;
  return exact;
}

function availableFieldNames() {
  const config = state.config ?? baseGameConfig();
  let fields = Object.keys(FIELD_LABELS);
  if (config.allowedFields) fields = fields.filter(field => config.allowedFields.includes(field));
  if (!config.specialEnabled) fields = fields.filter(field => field !== "special");
  return fields;
}

function applyFieldOptions(select) {
  const allowed = new Set(availableFieldNames());
  [...select.options].forEach(option => {
    option.hidden = !allowed.has(option.value);
    option.disabled = !allowed.has(option.value);
  });
}

function firstAllowedField() {
  return availableFieldNames()[0] ?? "generation";
}

function currentQuestionField() {
  return ui.conditions.querySelector(".condition-card .field-select")?.value ?? null;
}

function formatLimit(value, unit) {
  return value == null ? `${unit} 制限なし` : `${unit} ${value}回`;
}

function updateRuleStatus() {
  const config = state.config ?? baseGameConfig();
  ui.currentModeLabel.textContent = config.mode === "normal"
    ? `${config.modeLabel}・${config.difficultyLabel}`
    : config.modeLabel;
  ui.questionLimitChip.textContent = formatLimit(config.questionLimit, "質問");
  ui.hintLimitChip.textContent = formatLimit(config.hintLimit, "ヒント");
  ui.fieldLimitChip.textContent = config.fieldUseLimit == null
    ? "同じ項目 制限なし"
    : `同じ項目 ${config.fieldUseLimit}回まで`;
  ui.conditionRuleNote.textContent = `1回の質問では同じ質問項目だけを最大${config.maxConditions}条件まで追加できます。`;
  ui.logicRow.classList.toggle("hidden", !config.logicEnabled);
  if (!config.logicEnabled) document.querySelector('input[name="logic"][value="and"]').checked = true;
  if (config.historyVisible) {
    ui.historyContent.classList.remove("hidden");
    ui.historyToggleButton.textContent = "履歴を非表示";
    ui.historyToggleButton.setAttribute("aria-expanded", "true");
  } else {
    ui.historyContent.classList.add("hidden");
    ui.historyToggleButton.textContent = "履歴を表示";
    ui.historyToggleButton.setAttribute("aria-expanded", "false");
  }
}

function questionCapacityRemaining() {
  const limit = state.config?.questionLimit;
  return limit == null ? Infinity : Math.max(0, limit - state.questionCount);
}

function hintCapacityRemaining() {
  const limit = state.config?.hintLimit;
  return limit == null ? Infinity : Math.max(0, limit - state.hintCount);
}

function guessCapacityRemaining() {
  const limit = state.config?.guessLimit;
  return limit == null ? Infinity : Math.max(0, limit - state.guessAttempts);
}

function fieldUseRemaining(field) {
  const limit = state.config?.fieldUseLimit;
  if (limit == null) return Infinity;
  return Math.max(0, limit - (state.fieldUseCounts[field] ?? 0));
}

function availableHintFields() {
  const allowed = new Set(availableFieldNames());
  return HINTABLE_FIELDS.filter(field => allowed.has(field));
}

function updateGameControls() {
  updateCount();
  updateConditionLimitUI();
  const noQuestionCapacity = questionCapacityRemaining() <= 0;
  ui.askButton.disabled = state.ended || noQuestionCapacity;
  const remainingHints = availableHintFields().filter(field => !usedQuestionFields().has(field) && !state.hintedFields.includes(field));
  const noHintCapacity = hintCapacityRemaining() <= 0;
  ui.hintButton.disabled = state.ended || noHintCapacity || remainingHints.length === 0;
  if (state.config?.hintLimit === 0) ui.hintButton.textContent = "ヒントなし";
  else if (state.config?.hintLimit == null) ui.hintButton.textContent = "ヒントを表示";
  else ui.hintButton.textContent = `ヒントを表示（残り${hintCapacityRemaining()}回）`;
  ui.guessButton.disabled = state.ended || guessCapacityRemaining() <= 0;
}

async function startGame(config = normalConfig("free")) {
  state = freshState();
  state.config = { ...config };
  state.mode = config.mode;
  lastConfig = { ...config, allowedFields: config.allowedFields ? [...config.allowedFields] : null };
  if (config.mode === "daily") state.dailyKey = jstDateKey();

  hideMainPanels();
  ui.loadingPanel.classList.remove("hidden");
  ui.loadingMessage.textContent = config.mode === "daily" ? "今日のポケモンを準備しています。" : "ランダムに1匹選んでいます。";
  ui.newGameButton.disabled = true;
  ui.guessFeedback.textContent = "";
  ui.questionFeedback.textContent = "";
  ui.hintPanel.classList.add("hidden");
  ui.hintText.textContent = "";
  ui.guessInput.value = "";
  delete ui.guessInput.dataset.selectedId;
  delete ui.guessInput.dataset.selectedName;
  hideSuggestionList(ui.guessSuggestions);
  ui.shareDailyButton.classList.add("hidden");
  ui.resultScoreBox.innerHTML = "";

  try {
    const id = config.mode === "daily" ? dailySpeciesId(state.dailyKey) : randomSpeciesId();
    const [pokemon, species] = await Promise.all([
      fetchJson(`${API_ROOT}/pokemon/${id}/`),
      fetchJson(`${API_ROOT}/pokemon-species/${id}/`)
    ]);

    state.targetPokemon = pokemon;
    state.targetSpecies = species;
    state.targetNameJa = japaneseName(species.names, pokemon.name);
    state.generation = parseGeneration(species.generation?.name);

    ui.loadingMessage.textContent = "進化情報を確認しています。";
    const evolutionChain = await fetchJson(species.evolution_chain.url);
    state.evolutionStage = getEvolutionStage(evolutionChain.chain, species.name);

    const salt = randomSalt();
    state.commitmentRaw = `図鑑番号:${id}|乱数:${salt}`;
    state.commitmentHash = await sha256(state.commitmentRaw);

    resetBuilder();
    renderHistory();
    updateRuleStatus();
    updateGameControls();
    ui.loadingPanel.classList.add("hidden");
    ui.gamePanel.classList.remove("hidden");
    ui.guessInput.focus();
  } catch (error) {
    console.error(error);
    ui.loadingMessage.textContent = "データの取得に失敗しました。通信状態を確認して、モード選択からもう一度始めてください。";
  } finally {
    ui.newGameButton.disabled = false;
  }
}

function setQuestionFeedback(message, type = "") {
  ui.questionFeedback.textContent = message;
  ui.questionFeedback.className = `inline-feedback${type ? ` ${type}` : ""}`;
}

function syncConditionSelectors(field) {
  const cards = [...ui.conditions.querySelectorAll(".condition-card")];
  cards.forEach((card, index) => {
    const select = card.querySelector(".field-select");
    applyFieldOptions(select);
    select.value = field;
    select.disabled = index > 0;
    renderConditionFields(card);
  });
}

function promoteFirstCondition() {
  const cards = [...ui.conditions.querySelectorAll(".condition-card")];
  cards.forEach((card, index) => {
    const select = card.querySelector(".field-select");
    select.disabled = index > 0;
  });
}

function updateConditionLimitUI() {
  const count = ui.conditions.querySelectorAll(".condition-card").length;
  const limit = state.config?.maxConditions ?? MAX_CONDITIONS;
  ui.addConditionButton.disabled = state.ended || count >= limit;
}

function addCondition(initialField = null) {
  const cards = [...ui.conditions.querySelectorAll(".condition-card")];
  const limit = state.config?.maxConditions ?? MAX_CONDITIONS;
  if (cards.length >= limit) {
    setQuestionFeedback(`1回の質問に設定できる条件は最大${limit}個です。`, "feedback-error");
    return;
  }

  const field = cards.length ? currentQuestionField() : (initialField && availableFieldNames().includes(initialField) ? initialField : firstAllowedField());
  const node = ui.conditionTemplate.content.firstElementChild.cloneNode(true);
  const select = node.querySelector(".field-select");
  applyFieldOptions(select);
  select.value = field;
  select.disabled = cards.length > 0;

  select.addEventListener("change", () => {
    const nextField = select.value;
    if (!availableFieldNames().includes(nextField)) {
      select.value = currentQuestionField() || firstAllowedField();
      return;
    }
    syncConditionSelectors(nextField);
    setQuestionFeedback("");
    updateConditionLimitUI();
  });

  node.querySelector(".remove-condition-button").addEventListener("click", () => {
    node.remove();
    if (!ui.conditions.children.length) addCondition(firstAllowedField());
    promoteFirstCondition();
    updateConditionLimitUI();
  });

  ui.conditions.appendChild(node);
  renderConditionFields(node);
  promoteFirstCondition();
  updateConditionLimitUI();
}

function renderConditionFields(card) {
  const field = card.querySelector(".field-select").value;
  const box = card.querySelector(".condition-fields");
  box.innerHTML = "";

  if (field === "generation") {
    box.appendChild(generationOperatorControl());
    box.appendChild(numberControl("世代", "", 1));
    return;
  }

  if (["height", "weight", "nameLength"].includes(field)) {
    box.appendChild(operatorControl());
    const unit = field === "height" ? "メートル" : field === "weight" ? "キログラム" : "文字";
    const step = field === "nameLength" ? 1 : 0.1;
    box.appendChild(numberControl("数値", unit, step));
    return;
  }

  if (field === "stat") {
    box.appendChild(selectControl("能力", "stat-name", Object.entries(STAT_LABELS)));
    box.appendChild(operatorControl());
    box.appendChild(numberControl("数値", "", 1));
    return;
  }

  if (field === "evolutionStage") {
    box.appendChild(selectControl("進化の段階", "evolution-stage-value", [
      ["none", "進化しない"], ["base", "進化前"], ["first", "1回進化した姿"], ["second", "2回進化した姿"]
    ]));
    return;
  }

  if (field === "type") {
    box.appendChild(selectControl("タイプ", "type-value", Object.entries(TYPE_LABELS)));
    box.appendChild(booleanControl("そのタイプを含む"));
    return;
  }

  if (field === "weakness") {
    box.appendChild(selectControl("攻撃するタイプ", "weakness-type-value", Object.entries(TYPE_LABELS)));
    box.appendChild(booleanControl("そのタイプの攻撃が弱点"));
    return;
  }

  if (field === "ability") {
    box.appendChild(autocompleteControl("特性名", "例：いかく", "ability-name", "ability"));
    box.appendChild(booleanControl("その特性を持つ"));
    return;
  }

  if (field === "move") {
    box.appendChild(autocompleteControl("技名", "例：10まんぼると", "move-name", "move"));
    box.appendChild(booleanControl("その技を覚える"));
    return;
  }

  if (field === "egg") {
    box.appendChild(selectControl("タマゴグループ", "egg-value", Object.entries(EGG_LABELS)));
    box.appendChild(booleanControl("そのグループを含む"));
    return;
  }

  if (field === "mega") {
    box.appendChild(booleanControl("メガシンカできる"));
    return;
  }

  if (field === "special") {
    const choices = [
      ["starter", "御三家の系統"], ["legendary", "伝説のポケモン"], ["mythical", "幻のポケモン"],
      ["sublegendary", "準伝説として扱われるポケモン"], ["pseudo", "いわゆる600族の系統"],
      ["ultrabeast", "ウルトラビースト"], ["regional", "リージョンフォームがある"],
      ["regionalGeneration", "指定した世代のリージョンフォームがある"]
    ];
    const categoryControl = selectControl("特殊な条件", "special-value", choices);
    box.appendChild(categoryControl);
    const categorySelect = categoryControl.querySelector(".special-value");
    const renderSpecialDynamic = () => {
      box.querySelectorAll(".special-dynamic").forEach(node => node.remove());
      if (categorySelect.value === "regionalGeneration") {
        const generationControl = selectControl("リージョンフォームの世代", "regional-generation-value", [
          ["7", "第7世代"], ["8", "第8世代"], ["9", "第9世代"]
        ]);
        generationControl.classList.add("special-dynamic");
        box.appendChild(generationControl);
      }
      const bool = booleanControl("この条件に当てはまる");
      bool.classList.add("special-dynamic");
      box.appendChild(bool);
    };
    categorySelect.addEventListener("change", renderSpecialDynamic);
    renderSpecialDynamic();
    return;
  }
}

function selectControl(label, className, options) {
  const wrap = document.createElement("label");
  wrap.innerHTML = `<span>${label}</span>`;
  const select = document.createElement("select");
  select.className = `select-input ${className}`;
  for (const [value, text] of options) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
  }
  wrap.appendChild(select);
  return wrap;
}

function operatorControl() {
  return selectControl("比べ方", "operator-value", [
    ["eq", "同じ"], ["gte", "以上"], ["lte", "以下"], ["lt", "未満"], ["gt", "より大きい"]
  ]);
}

function generationOperatorControl() {
  return selectControl("比べ方", "operator-value", [
    ["eq", "同じ世代"], ["gte", "その世代以降"], ["lte", "その世代まで"],
    ["lt", "その世代より前"], ["gt", "その世代より後"]
  ]);
}

function numberControl(label, unit, step) {
  const wrap = document.createElement("label");
  wrap.innerHTML = `<span>${label}${unit ? `（${unit}）` : ""}</span>`;
  const input = document.createElement("input");
  input.type = "number";
  input.className = "number-input number-value";
  input.step = String(step);
  input.placeholder = "キーボードで入力";
  wrap.appendChild(input);
  return wrap;
}

function autocompleteControl(label, placeholder, className, kind) {
  const labelWrap = document.createElement("label");
  labelWrap.className = "autocomplete-label";
  const title = document.createElement("span");
  title.textContent = label;
  const wrap = document.createElement("div");
  wrap.className = "autocomplete-wrap";
  const input = document.createElement("input");
  input.type = "text";
  input.className = `text-input ${className}`;
  input.placeholder = placeholder;
  input.autocomplete = "off";
  input.setAttribute("aria-autocomplete", "list");
  const list = document.createElement("div");
  list.className = "suggestion-list hidden";
  list.setAttribute("role", "listbox");
  wrap.append(input, list);
  labelWrap.append(title, wrap);
  setupAutocomplete(input, list, kind);
  return labelWrap;
}

function booleanControl(label) {
  return selectControl(label, "boolean-value", [["yes", "はい"], ["no", "いいえ"]]);
}

function resetBuilder() {
  ui.conditions.innerHTML = "";
  document.querySelector('input[name="logic"][value="and"]').checked = true;
  addCondition(firstAllowedField());
  setQuestionFeedback("");
  updateConditionLimitUI();
}

function compareNumber(actual, op, expected) {
  if (Number.isNaN(expected)) return false;
  if (op === "eq") return actual === expected;
  if (op === "gte") return actual >= expected;
  if (op === "lte") return actual <= expected;
  if (op === "lt") return actual < expected;
  if (op === "gt") return actual > expected;
  return false;
}

function naturalNumberQuestion(subject, number, op, unit = "") {
  const value = `${number}${unit}`;
  if (op === "eq") return `${subject}は${value}と同じ`;
  if (op === "gte") return `${subject}は${value}以上`;
  if (op === "lte") return `${subject}は${value}以下`;
  if (op === "lt") return `${subject}は${value}未満`;
  if (op === "gt") return `${subject}は${value}より大きい`;
  return `${subject}は${value}`;
}

function conditionDescriptor(card) {
  const field = card.querySelector(".field-select").value;
  const expectsYes = card.querySelector(".boolean-value")?.value !== "no";
  const op = card.querySelector(".operator-value")?.value;
  const number = card.querySelector(".number-value")?.value;

  if (field === "generation") {
    if (op === "eq") return `第${number}世代のポケモン`;
    if (op === "gte") return `第${number}世代以降のポケモン`;
    if (op === "lte") return `第${number}世代までのポケモン`;
    if (op === "lt") return `第${number}世代より前のポケモン`;
    if (op === "gt") return `第${number}世代より後のポケモン`;
  }
  if (field === "height") return naturalNumberQuestion("高さ", number, op, "m");
  if (field === "weight") return naturalNumberQuestion("重さ", number, op, "kg");
  if (field === "nameLength") {
    if (op === "eq") return `名前は${number}文字`;
    if (op === "gte") return `名前は${number}文字以上`;
    if (op === "lte") return `名前は${number}文字以下`;
    if (op === "lt") return `名前は${number}文字未満`;
    if (op === "gt") return `名前は${number}文字より多い`;
  }
  if (field === "stat") {
    const key = card.querySelector(".stat-name").value;
    const subject = key === "total" ? "合計種族値" : `${STAT_LABELS[key]}の種族値`;
    return naturalNumberQuestion(subject, number, op);
  }
  if (field === "evolutionStage") {
    const select = card.querySelector(".evolution-stage-value");
    return `進化の段階が「${select.options[select.selectedIndex].text}」`;
  }
  if (field === "type") {
    const key = card.querySelector(".type-value").value;
    return expectsYes ? `${TYPE_LABELS[key]}タイプを含む` : `${TYPE_LABELS[key]}タイプを含まない`;
  }
  if (field === "weakness") {
    const key = card.querySelector(".weakness-type-value").value;
    return expectsYes ? `${TYPE_LABELS[key]}タイプの攻撃が弱点` : `${TYPE_LABELS[key]}タイプの攻撃が弱点ではない`;
  }
  if (field === "ability") {
    const name = card.querySelector(".ability-name").value.trim();
    return expectsYes ? `特性に「${name}」がある` : `特性に「${name}」がない`;
  }
  if (field === "move") {
    const name = card.querySelector(".move-name").value.trim();
    return expectsYes ? `「${name}」を覚える` : `「${name}」を覚えない`;
  }
  if (field === "egg") {
    const key = card.querySelector(".egg-value").value;
    return expectsYes ? `タマゴグループに「${EGG_LABELS[key]}」を含む` : `タマゴグループに「${EGG_LABELS[key]}」を含まない`;
  }
  if (field === "mega") return expectsYes ? "メガシンカできる" : "メガシンカできない";
  if (field === "special") {
    const select = card.querySelector(".special-value");
    const category = select.value;
    if (category === "regional") return expectsYes ? "リージョンフォームがある" : "リージョンフォームがない";
    if (category === "regionalGeneration") {
      const generation = card.querySelector(".regional-generation-value").value;
      return expectsYes
        ? `第${generation}世代のリージョンフォームがある`
        : `第${generation}世代のリージョンフォームがない`;
    }
    const text = select.options[select.selectedIndex].text;
    return expectsYes ? `「${text}」に当てはまる` : `「${text}」に当てはまらない`;
  }
  return "この条件に当てはまる";
}


function askedDetailFromCard(card) {
  const field = card.querySelector(".field-select").value;
  if (field === "stat") {
    const stat = card.querySelector(".stat-name").value;
    return { key: `stat:${stat}`, field, stat };
  }
  if (field === "weakness") {
    const attackType = card.querySelector(".weakness-type-value").value;
    return { key: `weakness:${attackType}`, field, attackType };
  }
  if (field === "move") {
    const input = card.querySelector(".move-name");
    const moveId = Number(input.dataset.selectedId || 0) || null;
    const moveName = input.dataset.selectedName || input.value.trim();
    return { key: `move:${moveId ?? normalizeKanaSearch(moveName)}`, field, moveId, moveName };
  }
  if (field === "special") {
    const category = card.querySelector(".special-value").value;
    const select = card.querySelector(".special-value");
    const regionalGeneration = category === "regionalGeneration"
      ? Number(card.querySelector(".regional-generation-value").value)
      : null;
    return {
      key: `special:${category}${regionalGeneration ? `:${regionalGeneration}` : ""}`,
      field, category, regionalGeneration, categoryLabel: select.options[select.selectedIndex].text
    };
  }
  return { key: field, field };
}

function rememberAskedDetails(cards) {
  const known = new Set(state.askedDetails.map(item => item.key));
  for (const card of cards) {
    const detail = askedDetailFromCard(card);
    if (known.has(detail.key)) continue;
    state.askedDetails.push(detail);
    known.add(detail.key);
  }
}

function evolutionStageLabel(stage) {
  return ({
    none: "進化しない",
    base: "進化前",
    first: "1回進化した姿",
    second: "2回進化した姿"
  })[stage] ?? "不明";
}

function specialCategoryMatches(category) {
  const id = state.targetSpecies.id;
  if (category === "starter") return STARTER_FAMILY_IDS.has(id);
  if (category === "legendary") return Boolean(state.targetSpecies.is_legendary);
  if (category === "mythical") return Boolean(state.targetSpecies.is_mythical);
  if (category === "sublegendary") return SUB_LEGENDARY_IDS.has(id);
  if (category === "pseudo") return PSEUDO_LEGENDARY_FAMILY_IDS.has(id);
  if (category === "ultrabeast") return ULTRA_BEAST_IDS.has(id);
  if (category === "regional") return regionalFormGenerations().length > 0;
  return false;
}

function addResultDetail(label, value) {
  const item = document.createElement("div");
  item.className = "result-detail-item";
  const labelEl = document.createElement("span");
  labelEl.className = "result-detail-label";
  labelEl.textContent = label;
  const valueEl = document.createElement("strong");
  valueEl.className = "result-detail-value";
  valueEl.textContent = value;
  item.append(labelEl, valueEl);
  ui.resultDetailsList.appendChild(item);
}

async function japaneseAbilityNames() {
  const entries = state.targetPokemon.abilities ?? [];
  try {
    const index = await loadAutocompleteIndex("ability");
    const byId = new Map(index.map(item => [item.id, item.name]));
    return entries.map(entry => {
      const id = extractResourceId(entry.ability.url);
      const name = byId.get(id) ?? entry.ability.name;
      return entry.is_hidden ? `${name}（隠れ特性）` : name;
    });
  } catch (_) {
    return entries.map(entry => entry.is_hidden ? `${entry.ability.name}（隠れ特性）` : entry.ability.name);
  }
}

function weaknessDescription(attackType) {
  const defenderTypes = state.targetPokemon.types.map(entry => entry.type.name);
  const multiplier = damageMultiplier(attackType, defenderTypes);
  if (multiplier === 0) return "無効（0倍）";
  if (multiplier > 1) return `弱点（${multiplier}倍）`;
  if (multiplier < 1) return `半減（${multiplier}倍）`;
  return "等倍（1倍）";
}

async function renderResultDetails() {
  ui.resultDetailsList.innerHTML = "";
  if (!state.askedDetails.length) {
    ui.resultDetails.classList.add("hidden");
    return;
  }

  let abilityNames = null;
  const targetMoveIds = new Set(state.targetPokemon.moves.map(entry => extractResourceId(entry.move.url)));

  for (const detail of state.askedDetails) {
    if (detail.field === "generation") {
      addResultDetail("登場した世代", `第${state.generation}世代`);
    } else if (detail.field === "stat") {
      if (detail.stat === "total") {
        addResultDetail("合計種族値", String(totalBaseStat()));
      } else {
        const value = state.targetPokemon.stats.find(item => item.stat.name === detail.stat)?.base_stat;
        addResultDetail(`${STAT_LABELS[detail.stat]}の種族値`, String(value ?? "不明"));
      }
    } else if (detail.field === "evolutionStage") {
      addResultDetail("進化の段階", evolutionStageLabel(state.evolutionStage));
    } else if (detail.field === "nameLength") {
      addResultDetail("名前の文字数", `${japaneseNameLength()}文字`);
    } else if (detail.field === "height") {
      addResultDetail("高さ", `${state.targetPokemon.height / 10}m`);
    } else if (detail.field === "weight") {
      addResultDetail("重さ", `${state.targetPokemon.weight / 10}kg`);
    } else if (detail.field === "type") {
      const types = [...state.targetPokemon.types]
        .sort((a, b) => a.slot - b.slot)
        .map(entry => TYPE_LABELS[entry.type.name] ?? entry.type.name);
      addResultDetail("タイプ", types.join("・"));
    } else if (detail.field === "weakness") {
      addResultDetail(`${TYPE_LABELS[detail.attackType]}タイプの攻撃`, weaknessDescription(detail.attackType));
    } else if (detail.field === "ability") {
      if (!abilityNames) abilityNames = await japaneseAbilityNames();
      addResultDetail("特性", abilityNames.join("・") || "不明");
    } else if (detail.field === "move") {
      const knowsMove = detail.moveId ? targetMoveIds.has(detail.moveId) : false;
      addResultDetail(`技「${detail.moveName || "指定した技"}」`, knowsMove ? "覚える" : "覚えない");
    } else if (detail.field === "egg") {
      const groups = state.targetSpecies.egg_groups.map(group => EGG_LABELS[group.name] ?? group.name);
      addResultDetail("タマゴグループ", groups.join("・") || "不明");
    } else if (detail.field === "mega") {
      addResultDetail("メガシンカ", MEGA_IDS.has(state.targetSpecies.id) ? "できる" : "できない");
    } else if (detail.field === "special") {
      if (detail.category === "regional") {
        const generations = regionalFormGenerations();
        addResultDetail("リージョンフォーム", generations.length ? `ある（第${generations.join("・第")}世代）` : "ない");
      } else if (detail.category === "regionalGeneration") {
        const has = regionalFormGenerations().includes(detail.regionalGeneration);
        addResultDetail(`第${detail.regionalGeneration}世代のリージョンフォーム`, has ? "ある" : "ない");
      } else {
        addResultDetail(detail.categoryLabel, specialCategoryMatches(detail.category) ? "当てはまる" : "当てはまらない");
      }
    }
  }

  ui.resultDetails.classList.remove("hidden");
}

function damageMultiplier(attackType, defenderTypes) {
  const chart = TYPE_EFFECTIVENESS[attackType];
  if (!chart) return 1;
  return defenderTypes.reduce((multiplier, defenderType) => {
    if (chart.zero.includes(defenderType)) return multiplier * 0;
    if (chart.double.includes(defenderType)) return multiplier * 2;
    if (chart.half.includes(defenderType)) return multiplier * 0.5;
    return multiplier;
  }, 1);
}

async function evaluateCondition(card) {
  const field = card.querySelector(".field-select").value;
  const boolExpected = card.querySelector(".boolean-value")?.value !== "no";

  if (["generation", "height", "weight", "stat", "nameLength"].includes(field)) {
    const op = card.querySelector(".operator-value").value;
    const rawNumber = card.querySelector(".number-value").value.trim();
    if (!rawNumber) throw new Error("数値を入力してください。");
    const expected = Number(rawNumber);
    if (!Number.isFinite(expected)) throw new Error("数値を入力してください。");
    let actual;
    if (field === "generation") actual = state.generation;
    if (field === "height") actual = state.targetPokemon.height / 10;
    if (field === "weight") actual = state.targetPokemon.weight / 10;
    if (field === "nameLength") actual = japaneseNameLength();
    if (field === "stat") {
      const statName = card.querySelector(".stat-name").value;
      actual = statName === "total"
        ? totalBaseStat()
        : state.targetPokemon.stats.find(s => s.stat.name === statName)?.base_stat;
    }
    return compareNumber(actual, op, expected);
  }

  if (field === "evolutionStage") {
    return state.evolutionStage === card.querySelector(".evolution-stage-value").value;
  }

  if (field === "type") {
    const type = card.querySelector(".type-value").value;
    const has = state.targetPokemon.types.some(t => t.type.name === type);
    return boolExpected ? has : !has;
  }

  if (field === "weakness") {
    const attackType = card.querySelector(".weakness-type-value").value;
    const defenderTypes = state.targetPokemon.types.map(entry => entry.type.name);
    const isWeak = damageMultiplier(attackType, defenderTypes) > 1;
    return boolExpected ? isWeak : !isWeak;
  }

  if (field === "ability") {
    const input = card.querySelector(".ability-name");
    const chosen = await resolveAutocompleteItem(input, "ability");
    if (!chosen) throw new Error("特性名は表示された候補から選んでください。");
    const abilityIds = new Set(state.targetPokemon.abilities.map(entry => extractResourceId(entry.ability.url)));
    const has = abilityIds.has(chosen.id);
    return boolExpected ? has : !has;
  }

  if (field === "move") {
    const input = card.querySelector(".move-name");
    const chosen = await resolveAutocompleteItem(input, "move");
    if (!chosen) throw new Error("技名は表示された候補から選んでください。");
    const moveIds = new Set(state.targetPokemon.moves.map(entry => extractResourceId(entry.move.url)));
    const has = moveIds.has(chosen.id);
    return boolExpected ? has : !has;
  }

  if (field === "egg") {
    const egg = card.querySelector(".egg-value").value;
    const has = state.targetSpecies.egg_groups.some(g => g.name === egg);
    return boolExpected ? has : !has;
  }

  if (field === "mega") {
    const has = MEGA_IDS.has(state.targetSpecies.id);
    return boolExpected ? has : !has;
  }

  if (field === "special") {
    const category = card.querySelector(".special-value").value;
    let has;
    if (category === "regionalGeneration") {
      const generation = Number(card.querySelector(".regional-generation-value").value);
      has = regionalFormGenerations().includes(generation);
    } else {
      has = specialCategoryMatches(category);
    }
    return boolExpected ? has : !has;
  }

  return false;
}

function usedQuestionFields() {
  return new Set(state.askedDetails.map(detail => detail.field));
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function japaneseMoveName(moveId, fallback = "") {
  try {
    const index = await loadAutocompleteIndex("move");
    return index.find(item => item.id === moveId)?.name ?? fallback;
  } catch (_) {
    return fallback;
  }
}

async function buildHintForField(field) {
  if (field === "generation") return `第${state.generation}世代で登場したポケモンです。`;
  if (field === "stat") {
    const choices = [...state.targetPokemon.stats.map(item => item.stat.name), "total"];
    const statName = randomItem(choices);
    if (statName === "total") return `合計種族値は${totalBaseStat()}です。`;
    const stat = state.targetPokemon.stats.find(item => item.stat.name === statName);
    return `${STAT_LABELS[statName]}の種族値は${stat?.base_stat ?? "不明"}です。`;
  }
  if (field === "evolutionStage") return `進化の段階は「${evolutionStageLabel(state.evolutionStage)}」です。`;
  if (field === "nameLength") return `名前は${japaneseNameLength()}文字です。`;
  if (field === "height") return `高さは${state.targetPokemon.height / 10}mです。`;
  if (field === "weight") return `重さは${state.targetPokemon.weight / 10}kgです。`;
  if (field === "type") {
    const types = [...state.targetPokemon.types]
      .sort((a, b) => a.slot - b.slot)
      .map(entry => TYPE_LABELS[entry.type.name] ?? entry.type.name);
    return `タイプは${types.join("・")}です。`;
  }
  if (field === "weakness") {
    const defenderTypes = state.targetPokemon.types.map(entry => entry.type.name);
    const weakTypes = Object.keys(TYPE_LABELS).filter(type => damageMultiplier(type, defenderTypes) > 1);
    if (!weakTypes.length) return null;
    const attackType = randomItem(weakTypes);
    return `${TYPE_LABELS[attackType]}タイプの攻撃が弱点です。`;
  }
  if (field === "ability") {
    const abilities = await japaneseAbilityNames();
    if (!abilities.length) return null;
    return `特性の1つは「${randomItem(abilities)}」です。`;
  }
  if (field === "move") {
    const moves = state.targetPokemon.moves ?? [];
    if (!moves.length) return null;
    const picked = randomItem(moves);
    const moveId = extractResourceId(picked.move.url);
    const name = await japaneseMoveName(moveId, picked.move.name);
    return `覚える技の1つは「${name}」です。`;
  }
  if (field === "egg") {
    const groups = state.targetSpecies.egg_groups.map(group => EGG_LABELS[group.name] ?? group.name);
    if (!groups.length) return null;
    return `タマゴグループは${groups.join("・")}です。`;
  }
  if (field === "mega") return MEGA_IDS.has(state.targetSpecies.id) ? "メガシンカできます。" : "メガシンカできません。";
  return null;
}

async function showHint() {
  if (!state.targetPokemon || state.ended) return;
  if (hintCapacityRemaining() <= 0) {
    ui.hintPanel.classList.remove("hidden");
    ui.hintText.textContent = "このモードでは、これ以上ヒントを使えません。";
    updateGameControls();
    return;
  }

  const unavailable = usedQuestionFields();
  state.hintedFields.forEach(field => unavailable.add(field));
  const candidates = availableHintFields().filter(field => !unavailable.has(field));
  if (!candidates.length) {
    ui.hintPanel.classList.remove("hidden");
    ui.hintText.textContent = "表示できる新しいヒントがありません。";
    updateGameControls();
    return;
  }

  ui.hintButton.disabled = true;
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  let chosenField = null;
  let hint = null;
  for (const field of shuffled) {
    try {
      hint = await buildHintForField(field);
    } catch (error) {
      console.warn("ヒント生成に失敗", field, error);
      hint = null;
    }
    if (hint) {
      chosenField = field;
      break;
    }
  }

  if (!hint || !chosenField) {
    ui.hintPanel.classList.remove("hidden");
    ui.hintText.textContent = "ヒントを作れませんでした。もう一度お試しください。";
    updateGameControls();
    return;
  }

  state.hintCount += 1;
  state.hintedFields.push(chosenField);
  ui.hintPanel.classList.remove("hidden");
  ui.hintText.textContent = hint;
  state.history.unshift({ questionText: hint, answer: null, kind: "hint" });
  renderHistory();
  updateGameControls();
}

async function askQuestion() {
  if (!state.targetPokemon || state.ended) return;
  if (questionCapacityRemaining() <= 0) {
    setQuestionFeedback("質問回数の上限に達しました。ポケモン名で最終回答してください。", "feedback-error");
    updateGameControls();
    return;
  }

  const cards = [...ui.conditions.querySelectorAll(".condition-card")];
  if (!cards.length) return;
  const field = currentQuestionField();
  if (!field) return;
  if (fieldUseRemaining(field) <= 0) {
    setQuestionFeedback(`「${FIELD_LABELS[field]}」はこのゲームで使える回数の上限に達しています。別の項目を選んでください。`, "feedback-error");
    return;
  }

  const logic = state.config?.logicEnabled
    ? document.querySelector('input[name="logic"]:checked').value
    : "and";
  ui.askButton.disabled = true;
  setQuestionFeedback("判定しています。");

  try {
    const results = [];
    const descriptors = [];
    for (const card of cards) {
      if (card.querySelector(".field-select").value !== field) throw new Error("1回の質問では同じ質問項目だけを使ってください。");
      descriptors.push(conditionDescriptor(card));
      results.push(await evaluateCondition(card));
    }
    const answer = logic === "and" ? results.every(Boolean) : results.some(Boolean);
    rememberAskedDetails(cards);
    const joiner = logic === "and" ? " かつ " : " または ";
    const questionText = `${descriptors.join(joiner)}？`;
    state.questionCount += 1;
    state.totalConditionsUsed += cards.length;
    state.fieldUseCounts[field] = (state.fieldUseCounts[field] ?? 0) + 1;
    state.history.unshift({ questionText, answer, kind: "question", field, conditionCount: cards.length });
    renderHistory();

    let message = answer ? "はい" : "いいえ";
    if (questionCapacityRemaining() <= 0) {
      message += "。質問回数の上限に達したので、あとはポケモン名で最終回答してください。";
    } else if (fieldUseRemaining(field) <= 0) {
      message += `。「${FIELD_LABELS[field]}」は使用上限に達しました。`;
    }
    setQuestionFeedback(message, answer ? "feedback-yes" : "feedback-no");
    updateGameControls();
  } catch (error) {
    setQuestionFeedback(error.message || "条件を確認してください。", "feedback-error");
    updateGameControls();
  }
}

function updateCount() {
  const qLimit = state.config?.questionLimit;
  const hLimit = state.config?.hintLimit;
  ui.questionCountBadge.textContent = qLimit == null
    ? `質問 ${state.questionCount}回`
    : `質問 ${state.questionCount}/${qLimit}回`;
  ui.hintCountBadge.textContent = hLimit == null
    ? `ヒント ${state.hintCount}回`
    : `ヒント ${state.hintCount}/${hLimit}回`;
}

function renderHistory() {
  ui.historyList.innerHTML = "";
  if (!state.history.length) {
    const li = document.createElement("li");
    li.className = "history-empty";
    li.textContent = "まだ質問やヒントはありません。";
    ui.historyList.appendChild(li);
    return;
  }
  state.history.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = `history-item${entry.kind === "hint" ? " history-hint" : ""}`;
    if (entry.kind === "hint") {
      li.innerHTML = `
        <span class="history-number hint-marker">💡</span>
        <span class="history-question"></span>
        <span class="history-answer hint">ヒント</span>
      `;
    } else if (entry.kind === "finalGuess") {
      li.innerHTML = `
        <span class="history-number">終</span>
        <span class="history-question"></span>
        <span class="history-answer no">いいえ</span>
      `;
    } else {
      const questionNumber = state.history.slice(index).filter(item => item.kind !== "hint" && item.kind !== "finalGuess").length;
      li.innerHTML = `
        <span class="history-number">${questionNumber}</span>
        <span class="history-question"></span>
        <span class="history-answer ${entry.answer ? "yes" : "no"}">${entry.answer ? "はい" : "いいえ"}</span>
      `;
    }
    li.querySelector(".history-question").textContent = entry.questionText;
    ui.historyList.appendChild(li);
  });
}

async function submitGuess() {
  if (!state.targetPokemon || state.ended) return;
  if (guessCapacityRemaining() <= 0) {
    ui.guessFeedback.textContent = "最終回答の回数上限に達しています。";
    ui.guessFeedback.className = "guess-feedback feedback-error";
    updateGameControls();
    return;
  }

  const rawGuess = ui.guessInput.value.trim();
  if (!rawGuess) {
    ui.guessFeedback.textContent = "ポケモン名を入力してください。";
    ui.guessFeedback.className = "guess-feedback feedback-error";
    return;
  }

  ui.guessButton.disabled = true;
  try {
    let chosen = null;
    try {
      chosen = await resolveAutocompleteItem(ui.guessInput, "pokemon");
    } catch (error) {
      console.warn("ポケモン候補の取得に失敗", error);
    }

    const normalizedGuess = normalizeKanaSearch(rawGuess);
    const isTargetByName = normalizedGuess === normalizeKanaSearch(state.targetNameJa);
    const isTargetById = chosen?.id === state.targetSpecies.id;

    if (!isTargetByName && !chosen) {
      ui.guessFeedback.textContent = "実在するポケモン名を候補から選んでください。";
      ui.guessFeedback.className = "guess-feedback feedback-error";
      return;
    }

    state.guessAttempts += 1;

    if (!isTargetByName && !isTargetById) {
      const displayName = chosen?.name ?? rawGuess;
      state.wrongGuesses += 1;
      const noQuestionBudgetBefore = questionCapacityRemaining() <= 0;
      state.history.unshift({ questionText: `${displayName}？`, answer: false, kind: noQuestionBudgetBefore ? "finalGuess" : "guess" });

      if (!noQuestionBudgetBefore) state.questionCount += 1;
      renderHistory();
      updateGameControls();

      const guessLimitHit = guessCapacityRemaining() <= 0;
      const questionLimitHit = state.config?.questionLimit != null && state.questionCount >= state.config.questionLimit;
      if (noQuestionBudgetBefore || guessLimitHit) {
        ui.guessFeedback.textContent = "いいえ。回答できる回数を使い切りました。";
        ui.guessFeedback.className = "guess-feedback feedback-no";
        await revealAnswer("failed");
        return;
      }

      ui.guessFeedback.textContent = questionLimitHit
        ? "いいえ。質問上限に達しました。次の最終回答が最後のチャンスです。"
        : "いいえ。続けて質問できます。";
      ui.guessFeedback.className = "guess-feedback feedback-no";
      ui.guessInput.select();
      return;
    }

    await revealAnswer("win");
  } finally {
    if (!state.ended) {
      ui.guessButton.disabled = false;
      updateGameControls();
    }
  }
}

function surrenderGame() {
  if (!state.targetPokemon || state.ended) return;
  revealAnswer("surrender");
}

function toggleHistoryVisibility() {
  const isHidden = ui.historyContent.classList.toggle("hidden");
  ui.historyToggleButton.textContent = isHidden ? "履歴を表示" : "履歴を非表示";
  ui.historyToggleButton.setAttribute("aria-expanded", String(!isHidden));
}

function readGameHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GAME_HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function calculateNumericScore(outcome = state.outcome) {
  if (outcome !== "win") return 0;
  const base = 1000
    - state.questionCount * 40
    - state.totalConditionsUsed * 10
    - state.hintCount * 100
    - state.wrongGuesses * 75;
  const multiplier = state.config?.mode === "normal" ? (state.config.scoreMultiplier ?? 1) : 1;
  return Math.max(0, Math.round(base * multiplier));
}

function saveCompletedGame(outcome) {
  if (state.saved) return;
  state.saved = true;
  const games = readGameHistory();
  const resultLabel = outcome === "win" ? "正解" : outcome === "surrender" ? "降参" : "失敗";
  games.unshift({
    playedAt: new Date().toISOString(),
    startedAt: state.startedAt,
    result: resultLabel,
    outcome,
    mode: state.config?.mode ?? "normal",
    modeLabel: state.config?.modeLabel ?? "通常モード",
    difficultyLabel: state.config?.difficultyLabel ?? "",
    targetName: state.targetNameJa,
    questionCount: state.questionCount,
    hintCount: state.hintCount,
    wrongGuesses: state.wrongGuesses,
    score: calculateNumericScore(outcome),
    questions: [...state.history].reverse().map(item => ({ questionText: item.questionText, answer: item.answer, kind: item.kind || "question" }))
  });
  try {
    localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(games.slice(0, 30)));
  } catch (error) {
    console.warn("ゲーム履歴を保存できませんでした", error);
  }
}

function writeDailyRecords(records) {
  try {
    localStorage.setItem(DAILY_RECORDS_KEY, JSON.stringify(records.slice(-400)));
  } catch (error) {
    console.warn("デイリー記録を保存できませんでした", error);
  }
}

function saveDailyRecord(outcome) {
  if (state.mode !== "daily" || !state.dailyKey) return;
  const records = readDailyRecords().filter(record => record.date !== state.dailyKey);
  records.push({
    date: state.dailyKey,
    dailyNumber: dailyNumberForKey(state.dailyKey),
    outcome,
    questionCount: state.questionCount,
    hintCount: state.hintCount,
    wrongGuesses: state.wrongGuesses,
    targetName: state.targetNameJa,
    targetId: state.targetSpecies?.id ?? null,
    playedAt: new Date().toISOString()
  });
  records.sort((a, b) => a.date.localeCompare(b.date));
  writeDailyRecords(records);
}

function dateDiffDays(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

function dailyStats() {
  const records = readDailyRecords().slice().sort((a, b) => a.date.localeCompare(b.date));
  const wins = records.filter(record => record.outcome === "win");
  const average = wins.length ? wins.reduce((sum, record) => sum + record.questionCount, 0) / wins.length : 0;
  const best = wins.length ? Math.min(...wins.map(record => record.questionCount)) : null;
  let bestStreak = 0;
  let running = 0;
  let previousWinDate = null;
  for (const record of records) {
    if (record.outcome !== "win") {
      running = 0;
      previousWinDate = null;
      continue;
    }
    if (previousWinDate && dateDiffDays(previousWinDate, record.date) === 1) running += 1;
    else running = 1;
    previousWinDate = record.date;
    bestStreak = Math.max(bestStreak, running);
  }

  let currentStreak = 0;
  let expected = jstDateKey();
  for (let i = records.length - 1; i >= 0; i -= 1) {
    const record = records[i];
    if (record.date !== expected || record.outcome !== "win") break;
    currentStreak += 1;
    const d = new Date(`${expected}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    expected = d.toISOString().slice(0, 10);
  }

  return {
    plays: records.length,
    wins: wins.length,
    winRate: records.length ? Math.round((wins.length / records.length) * 100) : 0,
    average,
    best,
    currentStreak,
    bestStreak
  };
}

function renderResultScore(outcome) {
  ui.resultScoreBox.innerHTML = "";
  if (state.mode === "daily") {
    const stats = dailyStats();
    const number = dailyNumberForKey(state.dailyKey);
    ui.resultScoreBox.innerHTML = `
      <div class="score-main"><span>Daily #${number}</span><strong>${outcome === "win" ? `${state.questionCount}/15` : "失敗"}</strong></div>
      <div class="score-metrics">
        <span>質問 <strong>${state.questionCount}/15</strong></span>
        <span>ヒント <strong>${state.hintCount}/1</strong></span>
        <span>誤答 <strong>${state.wrongGuesses}回</strong></span>
        <span>連続正解 <strong>${stats.currentStreak}日</strong></span>
      </div>
      <p class="muted compact-note">通算 ${stats.plays}日 / 正解率 ${stats.winRate}% / 最少 ${stats.best == null ? "-" : `${stats.best}問`} / 最高連続 ${stats.bestStreak}日</p>
    `;
    return;
  }

  if (state.mode === "normal") {
    const score = calculateNumericScore(outcome);
    const prefix = state.config?.difficulty === "free" ? "参考スコア" : "スコア";
    ui.resultScoreBox.innerHTML = `
      <div class="score-main"><span>${state.config.difficultyLabel}</span><strong>${outcome === "win" ? score : 0}点</strong></div>
      <div class="score-metrics">
        <span>質問 <strong>${state.questionCount}回</strong></span>
        <span>条件 <strong>${state.totalConditionsUsed}個</strong></span>
        <span>ヒント <strong>${state.hintCount}回</strong></span>
        <span>誤答 <strong>${state.wrongGuesses}回</strong></span>
      </div>
      <p class="muted compact-note">${prefix}。質問・条件・ヒント・誤答が少ないほど高くなります。</p>
    `;
    return;
  }

  ui.resultScoreBox.innerHTML = `
    <div class="score-main"><span>${state.config?.modeLabel ?? "記録"}</span><strong>${state.questionCount}問</strong></div>
    <div class="score-metrics">
      <span>ヒント <strong>${state.hintCount}回</strong></span>
      <span>誤答 <strong>${state.wrongGuesses}回</strong></span>
      <span>条件 <strong>${state.totalConditionsUsed}個</strong></span>
    </div>
  `;
}

function dailyShareText() {
  if (state.mode !== "daily") return "";
  const number = dailyNumberForKey(state.dailyKey);
  const stats = dailyStats();
  const chronological = [...state.history].reverse();
  const marks = chronological.map(item => {
    if (item.kind === "hint") return "🟨";
    if (item.kind === "guess" || item.kind === "finalGuess") return "🟥";
    return item.answer ? "🟩" : "⬛";
  }).join("") + (state.outcome === "win" ? "🎯" : "❌");
  return [
    `Pokémon Guess Daily #${number}`,
    state.outcome === "win" ? `✅ ${state.questionCount}/15` : "❌ Failed",
    `💡 ${state.hintCount}/1`,
    `🔥 ${stats.currentStreak}`,
    marks
  ].join("\n");
}

async function revealAnswer(outcome = "win") {
  state.ended = true;
  state.outcome = outcome;
  if (state.mode === "daily") saveDailyRecord(outcome);
  saveCompletedGame(outcome);
  ui.gamePanel.classList.add("hidden");
  ui.resultPanel.classList.remove("hidden");

  const labels = { win: "正解", surrender: "降参", failed: "失敗" };
  ui.resultKicker.textContent = labels[outcome] ?? "結果";
  ui.resultName.textContent = state.targetNameJa;
  if (outcome === "win") {
    ui.resultSummary.textContent = `質問${state.questionCount}回で正解しました。`;
  } else if (outcome === "surrender") {
    ui.resultSummary.textContent = `質問${state.questionCount}回で降参しました。答えはこのポケモンでした。`;
  } else {
    ui.resultSummary.textContent = `制限内に正解できませんでした。答えはこのポケモンでした。`;
  }

  const artwork = state.targetPokemon.sprites?.other?.["official-artwork"]?.front_default
    ?? state.targetPokemon.sprites?.front_default
    ?? "";
  ui.resultArt.src = artwork;
  ui.resultArt.style.display = artwork ? "block" : "none";
  renderResultScore(outcome);
  await renderResultDetails();

  const isDaily = state.mode === "daily";
  ui.shareDailyButton.classList.toggle("hidden", !isDaily);
  ui.playAgainButton.classList.toggle("hidden", isDaily);
  ui.playAgainButton.textContent = "同じモードでもう一度";
  ui.resultModeButton.classList.remove("hidden");
  refreshDailySetup();
}

function openModal(modal) {
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  modal.classList.add("hidden");
  if (![ui.rulesModal, ui.gameHistoryModal].some(item => !item.classList.contains("hidden"))) {
    document.body.classList.remove("modal-open");
  }
}

function confirmRulesSeen() {
  try { localStorage.setItem(RULES_SEEN_KEY, "1"); } catch (_) {}
  closeModal(ui.rulesModal);
}

function formatPlayedAt(iso) {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
    }).format(new Date(iso));
  } catch (_) {
    return iso;
  }
}

function renderSavedGames() {
  const games = readGameHistory();
  ui.savedGamesList.innerHTML = "";
  if (!games.length) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "まだ保存されたゲーム履歴はありません。";
    ui.savedGamesList.appendChild(empty);
    return;
  }

  games.forEach((game, index) => {
    const details = document.createElement("details");
    details.className = "saved-game-card";
    const summary = document.createElement("summary");
    const modeText = game.modeLabel ? `${game.modeLabel}${game.difficultyLabel && game.mode === "normal" ? `・${game.difficultyLabel}` : ""}` : "通常モード";
    summary.innerHTML = `<span>${formatPlayedAt(game.playedAt)}</span><strong>${game.result}</strong><span>${modeText}</span><span>${game.targetName}</span><span>質問 ${game.questionCount}回</span>`;
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = "saved-game-body";
    if (!game.questions?.length) {
      body.innerHTML = '<p class="muted">質問せずに終了しました。</p>';
    } else {
      const ol = document.createElement("ol");
      ol.className = "saved-question-list";
      game.questions.forEach(question => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        text.textContent = question.questionText;
        const answer = document.createElement("strong");
        if (question.kind === "hint") {
          answer.className = "saved-answer-hint";
          answer.textContent = "ヒント";
        } else {
          answer.className = question.answer ? "saved-answer-yes" : "saved-answer-no";
          answer.textContent = question.answer ? "はい" : "いいえ";
        }
        li.append(text, answer);
        ol.appendChild(li);
      });
      body.appendChild(ol);
    }
    details.appendChild(body);
    ui.savedGamesList.appendChild(details);
  });
}

function showGameHistory() {
  renderSavedGames();
  openModal(ui.gameHistoryModal);
}

setupAutocomplete(ui.guessInput, ui.guessSuggestions, "pokemon");

function updateNormalSummary() {
  const selected = document.querySelector('input[name="difficulty"]:checked')?.value ?? "free";
  const config = normalConfig(selected);
  const q = config.questionLimit == null ? "制限なし" : `${config.questionLimit}回`;
  const h = config.hintLimit == null ? "制限なし" : config.hintLimit === 0 ? "なし" : `${config.hintLimit}回`;
  const f = config.fieldUseLimit == null ? "制限なし" : `${config.fieldUseLimit}回まで`;
  const box = document.querySelector("#normal-summary");
  if (box) box.textContent = `質問：${q} / ヒント：${h} / 同じ項目：${f}`;
}

document.querySelectorAll("[data-open-setup]").forEach(button => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.dataset.openSetup);
    if (panel) showSetupPanel(panel);
  });
});

document.querySelectorAll(".setup-back").forEach(button => button.addEventListener("click", showModeSelection));
document.querySelectorAll('input[name="difficulty"]').forEach(input => input.addEventListener("change", updateNormalSummary));

ui.startNormalButton.addEventListener("click", () => {
  const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value ?? "free";
  startGame(normalConfig(difficulty));
});

ui.startDailyButton.addEventListener("click", () => {
  if (dailyRecordForToday()) {
    refreshDailySetup();
    return;
  }
  startGame(dailyConfig());
});

ui.startInputButton.addEventListener("click", () => {
  const selected = checkedFieldValues(ui.inputFieldOptions).filter(field => INPUT_SELECTABLE_FIELDS.includes(field));
  if (!selected.length) {
    updateInputFieldSelection();
    return;
  }
  startGame(inputConfig(selected));
});
ui.startCustomButton.addEventListener("click", () => {
  const selected = checkedFieldValues(ui.customFieldOptions);
  if (!selected.length) {
    updateCustomFieldSelection();
    return;
  }
  startGame(customConfigFromUi());
});

ui.inputFieldOptions?.querySelectorAll('input[type="checkbox"]').forEach(input => input.addEventListener("change", updateInputFieldSelection));
ui.customFieldOptions?.querySelectorAll('input[type="checkbox"]').forEach(input => input.addEventListener("change", updateCustomFieldSelection));
ui.customSelectAll?.addEventListener("click", () => {
  ui.customFieldOptions.querySelectorAll('input[type="checkbox"]').forEach(input => { input.checked = true; });
  updateCustomFieldSelection();
});
ui.customClearAll?.addEventListener("click", () => {
  ui.customFieldOptions.querySelectorAll('input[type="checkbox"]').forEach(input => { input.checked = false; });
  updateCustomFieldSelection();
});

ui.newGameButton.addEventListener("click", showModeSelection);
ui.playAgainButton.addEventListener("click", () => {
  if (!lastConfig || lastConfig.mode === "daily") showModeSelection();
  else startGame(lastConfig);
});
ui.resultModeButton.addEventListener("click", showModeSelection);
ui.shareDailyButton.addEventListener("click", async () => {
  const text = dailyShareText();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    ui.shareDailyButton.textContent = "コピーしました";
    setTimeout(() => { ui.shareDailyButton.textContent = "結果をコピー"; }, 1600);
  } catch (_) {
    window.prompt("結果をコピーしてください", text);
  }
});

ui.addConditionButton.addEventListener("click", () => addCondition());
ui.hintButton.addEventListener("click", showHint);
ui.historyToggleButton.addEventListener("click", toggleHistoryVisibility);
ui.askButton.addEventListener("click", askQuestion);
ui.guessButton.addEventListener("click", submitGuess);
ui.surrenderButton.addEventListener("click", surrenderGame);
ui.rulesButton.addEventListener("click", () => openModal(ui.rulesModal));
ui.gameHistoryButton.addEventListener("click", showGameHistory);
ui.rulesConfirmButton.addEventListener("click", confirmRulesSeen);
ui.clearGameHistoryButton.addEventListener("click", () => {
  if (!window.confirm("保存されているゲーム履歴をすべて削除しますか？")) return;
  localStorage.removeItem(GAME_HISTORY_KEY);
  renderSavedGames();
});

document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", () => {
    const modal = document.getElementById(button.dataset.closeModal);
    if (modal === ui.rulesModal) {
      confirmRulesSeen();
    } else if (modal) {
      closeModal(modal);
    }
  });
});

[ui.rulesModal, ui.gameHistoryModal].forEach(modal => {
  modal.addEventListener("mousedown", event => {
    if (event.target !== modal) return;
    if (modal === ui.rulesModal) confirmRulesSeen();
    else closeModal(modal);
  });
});

ui.guessInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && ui.guessSuggestions.classList.contains("hidden")) submitGuess();
});

updateNormalSummary();
updateInputFieldSelection();
updateCustomFieldSelection();
showModeSelection();

try {
  if (!localStorage.getItem(RULES_SEEN_KEY)) openModal(ui.rulesModal);
} catch (_) {
  openModal(ui.rulesModal);
}
