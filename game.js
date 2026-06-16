const clues = {
"查看裂隙灯记录": {
  text: "角膜轻度水肿，前房浅，瞳孔中等散大，直接对光反应迟钝。晶状体轻度膨隆。记录者写下：疑似急性闭角。",
  tags: ["角膜水肿", "浅前房", "中等散大瞳孔"]
},
"查看眼压记录": {
  text: "右眼眼压 54 mmHg，左眼 19 mmHg。右眼眼压在扩瞳前没有测量。急诊记录提示右眼明显高眼压。",
  tags: ["眼压 54 mmHg", "单眼急性高眼压"]
},
"查看验光资料": {
  text: "右眼 +4.50D，左眼 +4.25D，属于明显远视。高度远视常见短眼轴、前房浅，是闭角风险因素之一。",
  tags: ["高度远视", "短眼轴风险"]
},
"查看 OCT 和眼底照相": {
  text: "眼底图像质量很差，OCT 无法成像。系统提示屈光间质混浊，可能来自角膜水肿。没有明确视网膜裂孔证据。",
  tags: ["角膜水肿影响成像", "视网膜脱离证据不足"]
},
"查看用药单": {
  text: "患者检查前被滴用了复方托吡卡胺滴眼液。该药有散瞳作用，可能在房角狭窄人群中诱发急性闭角。",
  tags: ["散瞳药", "诱发房角关闭"]
},
"询问护士小林": {
  text: "小林说：我只是按术前检查流程滴散瞳药。患者说以前看灯有彩虹圈，但我没有特别记录。",
  tags: ["虹视未记录", "流程执行者"]
},
"询问验光师阿泽": {
  text: "阿泽说：她远视度数高，前房看起来有点浅。我提醒过今天人多，先别扩瞳，但没有形成书面阻断。",
  tags: ["曾提醒浅前房", "未完成闭环"]
},
"询问医生高桥": {
  text: "高桥说：我没让人马上扩瞳。她是白内障术前评估，应该先排除窄房角风险。",
  tags: ["医生管理责任", "应先评估房角"]
},
"询问患者家属": {
  text: "家属说：她以前晚上眼胀、头痛，以为是血压问题。今晚滴眼药后约半小时开始眼痛、恶心、视力下降。",
  tags: ["夜间眼胀", "滴药后半小时发作"]
},
"检查房角镜记录": {
  text: "没有房角镜检查记录。术前单上“房角评估”一栏为空。",
  tags: ["房角评估缺失", "流程漏洞"]
},
"检查前房深度数据": {
  text: "右眼中央前房深度偏浅，周边前房更浅。报告系统标注：浅前房，建议房角评估。",
  tags: ["周边前房浅", "系统预警"]
},
"查看监控": {
  text: "监控显示：小林在 20:12 给患者滴散瞳药；20:45 患者开始捂眼；21:02 被送急诊。",
  tags: ["时间线吻合", "散瞳后发作"]
}
};

const suspects = ["护士小林", "验光师阿泽", "医生高桥", "患者家属"];
const diagnoses = ["急性闭角型青光眼发作", "视网膜脱离", "角膜异物", "普通偏头痛"];
const culprit = "护士小林";
const correctDiagnosis = "急性闭角型青光眼发作";
const maxTurns = 6;

let count = 0, chosenCulprit = "", log = [], unlocked = new Set();

const $ = id => document.getElementById(id);
const actionsDiv = $("actions"), logDiv = $("log"), counter = $("counter");
const knowledgePanel = $("knowledgePanel"), knowledgeDiv = $("knowledge");
const guessArea = $("guessArea"), suspectsDiv = $("suspects");
const diagnosisArea = $("diagnosisArea"), diagnosesDiv = $("diagnoses");
const resultDiv = $("result");

$("startBtn").onclick = () => {
  document.querySelector(".hero").classList.add("hidden");
  $("game").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
};

function init(){
  actionsDiv.innerHTML = "";
  Object.keys(clues).forEach(action => {
    const btn = document.createElement("button");
    btn.textContent = action;
    btn.onclick = () => investigate(action, btn);
    actionsDiv.appendChild(btn);
  });
}
init();

function investigate(action, btn){
  if(count >= maxTurns) return;
  count++;
  btn.disabled = true;
  const clue = clues[action];
  log.push(`<div class="entry"><strong>${count}. ${action}</strong><br>${clue.text}</div>`);
  clue.tags.forEach(t => unlocked.add(t));
  logDiv.classList.remove("empty");
  logDiv.innerHTML = log.join("");
  updateKnowledge();
  counter.textContent = `剩余 ${maxTurns-count} 次`;
  if(count === maxTurns){
    document.querySelectorAll("#actions button").forEach(b => b.disabled = true);
    showGuess();
  }
}

function updateKnowledge(){
  knowledgePanel.classList.remove("hidden");
  knowledgeDiv.innerHTML = [...unlocked].map(t => `<span class="tag">${t}</span>`).join("");
}

function showGuess(){
  guessArea.classList.remove("hidden");
  suspectsDiv.innerHTML = "";
  suspects.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => {
      chosenCulprit = name;
      guessArea.classList.add("hidden");
      showDiagnosis();
    };
    suspectsDiv.appendChild(btn);
  });
  guessArea.scrollIntoView({behavior:"smooth",block:"start"});
}

function showDiagnosis(){
  diagnosisArea.classList.remove("hidden");
  diagnosesDiv.innerHTML = "";
  diagnoses.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => finish(name);
    diagnosesDiv.appendChild(btn);
  });
  diagnosisArea.scrollIntoView({behavior:"smooth",block:"start"});
}

function finish(dx){
  diagnosisArea.classList.add("hidden");
  resultDiv.classList.remove("hidden");

  let score = 0;
  if(chosenCulprit === culprit) score += 4;
  if(dx === correctDiagnosis) score += 4;
  const keyTags = ["眼压 54 mmHg","散瞳药","房角评估缺失","高度远视","时间线吻合","浅前房"];
  score += Math.min(2, [...unlocked].filter(t => keyTags.some(k => t.includes(k) || k.includes(t))).length >= 3 ? 2 : 1);

  const cls = score >= 8 ? "good" : score >= 5 ? "warn" : "bad";
  const title = score >= 8 ? "推理成功" : score >= 5 ? "部分正确" : "推理失败";

  resultDiv.innerHTML = `
    <h2 class="${cls}">${title}</h2>
    <p class="score">${score}/10</p>
    <div class="answer">你的判断：责任人是 <strong>${chosenCulprit}</strong>；诊断是 <strong>${dx}</strong>。</div>
    <div class="answer">标准答案：直接触发者是 <strong>护士小林</strong>；患者最可能为 <strong>急性闭角型青光眼发作</strong>。</div>
    <h2>核心医学推理</h2>
    <ul>
      <li>高度远视提示短眼轴、浅前房风险，属于闭角高危因素。</li>
      <li>夜间虹视、眼胀、头痛，提示既往可能有间歇性房角关闭。</li>
      <li>散瞳药可使瞳孔处于中等散大状态，诱发房角狭窄者急性闭角。</li>
      <li>急性眼痛、恶心、视力下降、角膜水肿、眼压 54 mmHg，符合急性闭角发作。</li>
      <li>房角评估为空，说明流程没有在扩瞳前拦截高危患者。</li>
    </ul>
    <h2>责任判断</h2>
    <p>小林是直接执行散瞳的人，且未记录“虹视”这个关键症状，因此最接近“直接触发者”。但医生高桥和机构流程也有管理责任；阿泽虽有提醒，但没有完成有效阻断。</p>
    <small>本游戏仅用于医学科普和推理娱乐，不构成诊断或治疗建议。真实眼痛、虹视、恶心、视力下降应立即就医。</small>
  `;
  resultDiv.scrollIntoView({behavior:"smooth",block:"start"});
}

$("restartBtn").onclick = () => location.reload();
$("copyBtn").onclick = async () => {
  const text = "我在玩《虹膜暗影》眼科医学推理小游戏：6次调查机会，找出急性眼痛事件的真相。";
  try{ await navigator.clipboard.writeText(text); alert("分享文案已复制"); }
  catch(e){ alert(text); }
};
