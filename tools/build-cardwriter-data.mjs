// 从「RUBY条目」源目录生成 src/cardwriter-data.js（内置写卡步骤数据模块）
// 用法: node tools/build-cardwriter-data.mjs [RUBY条目目录]
// 默认目录: ../世界书/通用分析器/RUBY条目（相对本仓库根）
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = resolve(process.argv[2] || join(repoRoot, '..', '世界书', '通用分析器', 'RUBY条目'));

const read = (name) => {
    const p = join(srcDir, name);
    if (!existsSync(p)) throw new Error(`source file missing: ${p}`);
    return readFileSync(p, 'utf8').replace(/\r\n/g, '\n').trim();
};

// RUBY 写卡模式说明：追加到每个步骤指令末尾
const MODE_NOTE = `

【RUBY写卡模式·运行说明】
当前处于RUBY写卡模式的对话中：RUBY会维护三条常驻注入——流程路线图、编号知识（已入库记录清单）、当前步骤指令。
步骤切换有两种方式：创作者在RUBY面板手动切换，或在创作者明确表示可以进入下一步时，由你在本楼输出切换标记（见下），RUBY自动切换。
每个步骤都可以反复工作：产出按记录入库，记录与切换可在同一楼共存（先输出记录标记，再输出切换标记）。
当创作者认可一份产出时，你必须严格按照下方【记录输出协议】的完整格式输出——这是入库的唯一依据。`;

// 记录输出协议：所有步骤统一的新条目/更新条目标记 + 切换标记。
// 只有带标记的楼才被RUBY捕捉入库；同步骤多轮产出各自编号，
// 更新按编号精确落点（硬编码另有相似度兜底）。
function recordProtocolNote() {
    return `

【记录输出协议（RUBY自动识别依赖，最高优先级）】
本步骤的产出以"记录"为单位入库——只有带标记的输出才会被RUBY捕捉记录：

新记录（本步骤首次产出该交付物，或拿不准归属时）：

<ruby新条目>
\`\`\`yaml
[完整yaml内容]
\`\`\`
</ruby新条目>

更新记录（重做/修改已有编号X的那条记录）：

<ruby更新条目 编号="X">
\`\`\`yaml
[完整yaml内容]
\`\`\`
</ruby更新条目>

切换标记（创作者明确表示"可以进入下一步/切换吧"时，在本楼末尾输出；与记录标记可同楼共存，顺序：先记录后切换）：

<ruby切换/>

或指定目标步骤（回退/跳步时用）：

<ruby切换 步骤="Step3"/>

格式硬性要求：
1. 标签必须成对出现（切换标记自闭合也算成对）、各占一行，记录标签内有且仅有一个 \`\`\`yaml 代码块（首行 \`\`\`yaml，末行 \`\`\`）
2. 编号从【编号知识】清单里选；不确定该更新哪条，就输出新条目
3. yaml内容完整填写真实内容——禁止"..."、"省略"占位；代码块内禁止嵌套代码块
4. 一次回复最多输出一个记录（Step7：一次只允许定稿一个任务，这是铁律）

⚠️ 平时讨论、展示草稿、中途预览严禁使用这些标记——它们是机器信号，只在创作者认可定稿/同意切换时输出。
⚠️ 记录之后RUBY不会自动切换：留在本步骤继续，除非你输出了切换标记或创作者自己切换。
⚠️ 输出的yaml必须完整，但不必完美，创作者仍可要求你修改后重新定稿（用更新条目）。`;
}

const steps = [
    { id: 'StepW', name: '世界观讨论', optional: false, tool: false, file: '01a_StepW：世界观讨论.txt', guide: '00_StepW说明_世界观讨论.txt' },
    { id: 'Step0', name: '美学思考', optional: false, tool: false, file: '02_Step0：美学思考.txt', guide: '00_Step0说明_美学思考.txt' },
    { id: 'Step1', name: '角色经历讨论', optional: false, tool: false, file: '03_Step1：角色经历讨论.txt', guide: '00_Step1说明_角色经历讨论.txt' },
    { id: 'StepL', name: '活人感设计', optional: false, tool: false, file: '03b_StepL：活人感设计.txt', guide: '00_StepL说明_活人感设计.txt' },
    { id: 'Step2', name: '角色核心讨论', optional: false, tool: false, file: '04_Step2：角色核心讨论.txt', guide: '00_Step2说明_角色核心讨论.txt' },
    { id: 'Step3', name: '构建角色卡', optional: false, tool: false, file: '05_Step3：构建角色卡.txt', guide: '00_Step3说明_构建角色卡.txt' },
    { id: 'Step4', name: 'NSFW档案写作', optional: true, tool: false, file: '06_可选_Step4：进阶角色拆分.txt', guide: '00_Step4说明_进阶角色拆分.txt' },
    { id: 'Step5', name: 'NPC设计', optional: false, tool: false, file: '07_Step5：NPC设计.txt', guide: '' },
    { id: 'Step6', name: '人物速览与关系网', optional: false, tool: false, file: '08_Step6：人物速览与关系网.txt', guide: '' },
    { id: 'Step7', name: '动态任务设计', optional: false, tool: false, file: '09_Step7：动态任务设计.txt', guide: '' },
    { id: 'StepX', name: '自检任务', optional: true, tool: true, file: '16_StepX：自检任务.txt', guide: '' },
].map((s) => ({
    id: s.id,
    name: s.name,
    optional: s.optional,
    tool: s.tool,
    instruction: read(s.file) + MODE_NOTE + recordProtocolNote(),
    guide: s.guide ? read(s.guide) : '',
}));

// 路线图简述：每步一句话，注入常驻「写卡路线图」条目
const ROADMAP_BRIEFS = {
    StepW: '搭世界观地基：架空聊政治与合理化，现实忠实记录',
    Step0: '还原创作者的故事想法，确定基调与世界概念',
    Step1: '自然语言讲角色故事，产出背景与关键经历',
    StepL: '攒活人感素材：语料语感、轶事、生活细节',
    Step2: '重难点：讨论打磨角色核心切面',
    Step3: '整合全部记录，产出完整主角卡',
    Step4: '为主角另出NSFW补充档案（可选）',
    Step5: '简化模板逐个写NPC（可多轮产出）',
    Step6: '浓缩人物速览与关系条目',
    Step7: '聊方向+逐个写分析提示词，一次只定稿一个任务',
    StepX: '检查既有产出的一致性与质量（工具步骤，按需使用）',
    Overview: '汇总合成清单，创作者确认后合成角色卡并下载JSON',
};
for (const step of steps) {
    step.brief = ROADMAP_BRIEFS[step.id] || step.name;
}

// 总览（合成角色卡）：汇总全部记录输出合成清单JSON，创作者确认后RUBY执行合成与下载
steps.push({
    id: 'Overview',
    name: '合成角色卡',
    optional: false,
    tool: true,
    brief: ROADMAP_BRIEFS.Overview,
    instruction: [
        '创作者已明确表示：全部写卡想法已经完成，进入合成阶段。',
        '',
        '你的任务：汇总本次写卡的全部记录，先跟创作者逐项确认合成清单，确认完毕后输出最终清单（JSON格式）。',
        '',
        '第一步·汇总讨论：',
        '根据【编号知识】里全部步骤的记录清单，整理出：',
        '- 这张卡叫什么名字',
        '- 角色描述（description）取自哪条记录',
        '- 有哪些世界书条目：各叫什么名字、关键词是什么、放哪、什么灯',
        '- 有哪些分析任务：各叫什么、捕捉什么关键词、参考哪些条目',
        '以清晰的清单形式呈现给创作者，逐项跟TA确认；创作者可以随时增删改，改完更新清单再确认。',
        '',
        '第二步·最终输出（创作者说"合成吧/可以合成了"之后才输出）：',
        '',
        '<ruby合成>',
        '```json',
        '{',
        '  "卡名": "角色卡名",',
        '  "角色描述来源": "Step3_001",',
        '  "开场白来源": "Step0_002",',
        '  "条目": [',
        '    {"记录": "StepW_001", "条目名": "设定名", "关键词": ["设定名"], "位置": "角色前", "顺序": 1, "灯位": "蓝灯", "深度": 4, "副关键词": [], "启用": true}',
        '  ],',
        '  "分析任务": [',
        '    {"任务名": "某某内心", "记录": "Step7_001", "提示词条目名": "某某的【内心状态分析】", "输出条目名": "某某内心", "捕捉关键词": ["某某"], "参考条目": ["某某", "人物速览"], "周期位置": 2}',
        '  ]',
        '}',
        '```',
        '</ruby合成>',
        '',
        '字段说明：',
        '- 记录：编号知识清单里的"步骤_编号"，指明该条目/任务的内容来自哪条记录（必填）',
        '- 位置：角色前 / 角色后 / D0；顺序：数字编号；深度：数字（默认4，D0填0）',
        '- 灯位：蓝灯=常驻注入 / 绿灯=关键词触发 / 关闭=不注入（分析提示词条目用关闭）',
        '- 副关键词：绿灯条目的AND二级关键词（如nsfw条目：关键词=角色名，副关键词=[nsfw]），没有就空数组',
        '- 分析任务的"提示词条目名"必须与"条目"清单里那条分析提示词条目的关键词一致；漏了RUBY会自动补挂',
        '- 捕捉关键词：正文出现该词时任务运行；参考条目：分析时读取的世界书条目关键词',
        '- 周期位置：任务在周期里的排位，错开排（2,4,6…），不要全挤同一个位置',
        '',
        '严格要求：',
        '- JSON必须语法合法（可被JSON.parse），键名与示例完全一致',
        '- 所有记录编号必须真实存在于编号知识清单里，禁止编造',
        '- 平时讨论中严禁使用<ruby合成>标记，它只在最终确认后输出一次',
        '- 输出标记后不要追加长篇告别，一两句收尾即可',
    ].join('\n'),
    guide: [
        '<details>',
        '<summary><big><b style="color:#e67e22">合成角色卡：写卡收尾</b></big></summary>',
        '',
        '```',
        '这一步把全部记录合成为成品卡。',
        '',
        'Ruby先汇总一份合成清单跟你逐项确认：',
        '  卡名、角色描述来源、全部条目（名称/关键词/位置/顺序/灯位）、',
        '  全部分析任务（名称/捕捉词/参考条目/周期位置）',
        '',
        '你说"合成吧"之后，Ruby输出 <ruby合成> 标记，',
        'RUBY弹出确认，执行合成：',
        '  ① 聊天世界书整理成干净条目（正规名称/关键词/位置/灯位）',
        '  ② RubyAnalyzer 分析方案按清单自动写入角色卡',
        '  ③ 浏览器自动下载完整 v3 角色卡 JSON',
        '```',
        '',
        '</details>',
    ].join('\n'),
});

const data = {
    version: 2,
    draftBook: 'ruby写卡初稿',
    rules: read('00_角色创作步骤辅助规则.txt'),
    persona: read('01_Ruby写卡助手.txt'),
    appendix: read('17_附录_分析器原理知识库.txt'),
    steps,
};

const out = `// 自动生成：tools/build-cardwriter-data.mjs —— 请勿手改，重新运行脚本更新
// 源目录: 世界书/通用分析器/RUBY条目
export const CARDWRITER_DATA = ${JSON.stringify(data, null, 2)};
`;

const outPath = join(repoRoot, 'src', 'cardwriter-data.js');
writeFileSync(outPath, out, 'utf8');
const kb = (out.length / 1024).toFixed(1);
console.log(`written: src/cardwriter-data.js (${kb} KB), steps: ${steps.length}`);
