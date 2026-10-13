/* ============================================================================
 *  Sub-Store  ·  文件(mihomo 配置)  ·  「脚本操作」→「快捷脚本」
 *  ────────────────────────────────────────────────────────────────────────────
 *  ① 节点与策略组   → 见同目录 1-节点与策略组.js
 *  ② 规则与规则集   ← 本文件
 * ----------------------------------------------------------------------------
 *  【本文件干什么】只做两件事，覆盖式写入：
 *      config.rules           = RULES（下面的规则列表）
 *      config['rule-providers'] = RULE_PROVIDER_LIST 展开的规则集
 *  不碰 proxies，也不碰 proxy-groups —— 那是 ① 脚本的活，各管一块、互不干扰。
 *
 *  【Sub-Store 里的操作顺序】
 *      「从订阅添加节点」  →  ① 节点与策略组  →  ② 规则与规则集（本文件）
 *  两个都是【生成器】（每次全量覆盖自己那部分），所以：
 *      · 想只换规则、不动策略组 → 把 ① 的 GEN_GROUPS 关掉即可；
 *      · 本文件的 GEN_RULES / GEN_RULE_PROVIDERS 也可以单独开关。
 *
 *  ❗前提：文件类型必须是 Mihomo 配置（mihomoConfig），否则 Sub-Store 根本不会
 *    调用 main()，你会看到"什么都没生成"。自检：日志里有没有 [规则生成器] 开头的行。
 *
 *  ⚠️ 重要：rules 里引用的策略名（第 3 个字段）必须真实存在，否则 mihomo 启动报错。
 *     本文件默认开了 CHECK_TARGETS，生成时会核对一遍并在日志里报警告：
 *        · 规则指向的策略组，在 config['proxy-groups'] / config.proxies 里找不到
 *        · RULE-SET 引用的规则集名，在 RULE_PROVIDER_LIST 里没有
 *        · 规则集里有定义、但没有任何规则引用（只提示，不算错）
 *     出现在日志里的 WARN 就说明 ① 和 ② 对不上了，去改 ① 的 GROUP_TEMPLATE。
 * ==========================================================================*/


/* ==========================================================================
 *  ★★★★★  配置区（你要手动改的只有这一段）  ★★★★★
 * ========================================================================*/

/** true = 生成 rules（覆盖文件原有的 rules） */
const GEN_RULES = true;
/** true = 生成 rule-providers（覆盖文件原有的 rule-providers） */
const GEN_RULE_PROVIDERS = true;
/** true = 打印日志 */
const LOG = true;
/**
 * true = 生成时核对"规则指向的策略/规则集是否存在"，只打 WARN 不阻断。
 * 拆成两个脚本后，这个自检比原来更有用（能看到 ① 生成的组名对不对得上）。
 */
const CHECK_TARGETS = true;

/** 日志前缀，方便在 Sub-Store 日志页里搜（和 ① 的 [生成器] 区分开）。 */
const SCOPE = '[规则生成器]';


/* ==========================================================================
 *  模板区：以下数据 = v2board.yaml 展开锚点后的最终配置，一般不用改
 * ========================================================================*/

/* 规则（顺序即匹配优先级，与原文件一致） */
var RULES = [
  'RULE-SET,MyDirect,Direct',
  'RULE-SET,ASUSDriveHub,Direct',
  'RULE-SET,Media,Media',
  'RULE-SET,MyGames,RiotGames',
  'RULE-SET,Downloads,Download',
  'RULE-SET,Email,SSH',
  'RULE-SET,SSH,SSH',
  'RULE-SET,MyProxy,PROXY',
  'RULE-SET,MyDomain,PROXY',
  'RULE-SET,Bybit,United States',
  'RULE-SET,Binance,United States',
  'RULE-SET,Steam,Steam',
  'RULE-SET,Game,Game',
  'RULE-SET,GameDownload,Download',
  'RULE-SET,GameDownloadCN,Direct',
  'RULE-SET,DNS,PROXY',
  'DOMAIN-SUFFIX,oaistatic.com,OpenAI',
  'DOMAIN-SUFFIX,oaiusercontent.com,OpenAI',
  'DOMAIN-SUFFIX,webpubsub.azure.com,OpenAI',
  'DOMAIN-SUFFIX,chatgpt.com,OpenAI',
  'DOMAIN-SUFFIX,claudeusercontent.com,OpenAI',
  'RULE-SET,OpenAI,OpenAI',
  'RULE-SET,Gemini,OpenAI',
  'RULE-SET,Claude,OpenAI',
  'IP-CIDR,17.0.0.0/8,Apple',
  'RULE-SET,iCloud,Apple',
  'RULE-SET,Apple,Apple',
  'RULE-SET,Apple_Domain,Apple',
  'RULE-SET,Netflix,Netflix',
  'RULE-SET,Disney Plus,Disney Plus',
  'RULE-SET,YouTube,YouTube',
  'RULE-SET,PayPal,PayPal',
  'RULE-SET,OneDrive,OneDrive',
  'RULE-SET,Microsoft,Microsoft',
  'RULE-SET,TikTok,United States',
  'RULE-SET,WeChat,WeChat',
  'RULE-SET,BiliBili,Bilibili',
  'RULE-SET,Telegram,Telegram',
  'RULE-SET,Spotify,Media',
  'RULE-SET,Razer,PROXY',
  'RULE-SET,Google,PROXY',
  'RULE-SET,Global,PROXY',
  'IP-CIDR,192.168.0.0/16,DIRECT',
  'IP-CIDR,10.0.0.0/8,DIRECT',
  'IP-CIDR,172.16.0.0/12,DIRECT',
  'IP-CIDR,127.0.0.0/8,DIRECT',
  'IP-CIDR,100.64.0.0/10,DIRECT',
  'IP-CIDR,224.0.0.0/4,DIRECT',
  'GEOIP,CN,Direct,no-resolve',
  'MATCH,PROXY',
];


/* 规则集（rule-providers）。behavior 省略 = classical。顺序与原文件一致。 */
var RULE_PROVIDER_LIST = [
  { name: 'Email', url: 'https://substore.com/api/file/Email?$options=fmt%3Dclash', path: './Rules/Email.yaml' },
  { name: 'MyGames', url: 'https://substore.com/api/file/MyGames?$options=fmt%3Dclash', path: './Rules/MyGames.yaml' },
  { name: 'Downloads', url: 'https://substore.com/api/file/Downloads?$options=fmt%3Dclash', path: './Rules/Downloads.yaml' },
  { name: 'MyDirect', url: 'https://substore.com/api/file/MyDirect?$options=fmt%3Dclash', path: './Rules/MyDirect.yaml' },
  { name: 'ASUSDriveHub', url: 'https://substore.com/api/file/ASUSDriveHub?$options=fmt%3Dclash', path: './Rules/ASUSDriveHub.yaml' },
  { name: 'MyProxy', url: 'https://substore.com/api/file/MyProxy?$options=fmt%3Dclash', path: './Rules/MyProxy.yaml' },
  { name: 'Media', url: 'https://substore.com/api/file/Media?$options=fmt%3Dclash', path: './Rules/Media.yaml' },
  { name: 'SSH', url: 'https://substore.com/api/file/SSH?$options=fmt%3Dclash', path: './Rules/SSH.yaml' },
  { name: 'MyDomain', url: 'https://substore.com/api/file/MyDomain?$options=fmt%3Dclash', path: './Rules/MyDomain.yaml' },
  { name: 'Bybit', url: 'https://substore.com/api/file/Bybit?$options=fmt%3Dclash', path: './Rules/Bybit.yaml' },
  { name: 'Binance', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Binance/Binance_No_Resolve.yaml', path: './Rules/Binance_No_Resolve.yaml' },
  { name: 'Game', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Game/Game_No_Resolve.yaml', path: './Rules/Game_No_Resolve.yaml' },
  { name: 'GameDownload', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Game/GameDownload/GameDownload_No_Resolve.yaml', path: './Rules/GameDownload_No_Resolve.yaml' },
  { name: 'GameDownloadCN', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Game/GameDownloadCN/GameDownloadCN_No_Resolve.yaml', path: './Rules/GameDownloadCN_No_Resolve.yaml' },
  { name: 'DNS', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/DNS/DNS_No_Resolve.yaml', path: './Rules/DNS_No_Resolve.yaml' },
  { name: 'OpenAI', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/OpenAI/OpenAI_No_Resolve.yaml', path: './Rules/OpenAI_No_Resolve.yaml' },
  { name: 'Claude', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Claude/Claude_No_Resolve.yaml', path: './Rules/Claude_No_Resolve.yaml' },
  { name: 'iCloud', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/iCloud/iCloud_No_Resolve.yaml', path: './Rules/iCloud.yaml' },
  { name: 'Apple', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Apple/Apple_No_Resolve.yaml', path: './Rules/Apple_No_Resolve.yaml' },
  { name: 'Apple_Domain', behavior: 'domain', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Apple/Apple_Domain.yaml', path: './Rules/Apple_Domain.yaml' },
  { name: 'Netflix', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Netflix/Netflix_Classical_No_Resolve.yaml', path: './Rules/Netflix_Classical_No_Resolve.yaml' },
  { name: 'Disney Plus', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Disney/Disney_No_Resolve.yaml', path: './Rules/Disney_Plus_No_Resolve.yaml' },
  { name: 'YouTube', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/YouTube/YouTube_No_Resolve.yaml', path: './Rules/Media/YouTube_No_Resolve.yaml' },
  { name: 'PayPal', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/PayPal/PayPal_No_Resolve.yaml', path: './Rules/PayPal_No_Resolve.yaml' },
  { name: 'OneDrive', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/OneDrive/OneDrive_No_Resolve.yaml', path: './Rules/OneDrive_No_Resolve.yaml' },
  { name: 'Microsoft', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Microsoft/Microsoft_No_Resolve.yaml', path: './Rules/Microsoft_No_Resolve.yaml' },
  { name: 'TikTok', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/TikTok/TikTok_No_Resolve.yaml', path: './Rules/TikTok_No_Resolve.yaml' },
  { name: 'WeChat', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/WeChat/WeChat_No_Resolve.yaml', path: './Rules/WeChat_No_Resolve.yaml' },
  { name: 'BiliBili', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/BiliBili/BiliBili_No_Resolve.yaml', path: './Rules/BiliBili_No_Resolve.yaml' },
  { name: 'Telegram', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Telegram/Telegram_No_Resolve.yaml', path: './Rules/Telegram_No_Resolve.yaml' },
  { name: 'Google', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Google/Google_No_Resolve.yaml', path: './Rules/Google_No_Resolve.yaml' },
  { name: 'Steam', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Steam/Steam_No_Resolve.yaml', path: './Rules/Steam_No_Resolve.yaml' },
  { name: 'Gemini', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Gemini/Gemini_No_Resolve.yaml', path: './Rules/Gemini_No_Resolve.yaml' },
  { name: 'Global', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Global/Global_Classical_No_Resolve.yaml', path: './Rules/Global_Classical_No_Resolve.yaml' },
  { name: 'ChinaMax', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/ChinaMax/ChinaMax_Classical_No_Resolve.yaml', path: './Rules/ChinaMax_Classical_No_Resolve.yaml' },
  { name: 'Advertising', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Advertising/Advertising_Classical_No_Resolve.yaml', path: './Rules/Advertising_Classical_No_Resolve.yaml' },
  { name: 'Spotify', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Spotify/Spotify_No_Resolve.yaml', path: './Rules/Spotify_No_Resolve.yaml' },
  { name: 'Cloudflare', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Cloudflare/Cloudflare_No_Resolve.yaml', path: './Rules/Cloudflare_No_Resolve.yaml' },
  { name: 'Razer', url: 'https://raw.githubusercontent.com/ericz15/ios_rule_script/master/rule/Clash/Razer/Razer_No_Resolve.yaml', path: './Rules/Razer_No_Resolve.yaml' },
];



/* ==========================================================================
 *  实现区：正常使用不用改
 * ========================================================================*/

/** 规则集：behavior 省略 = classical */
function buildRuleProviders() {
  var out = {};
  for (var i = 0; i < RULE_PROVIDER_LIST.length; i++) {
    var p = RULE_PROVIDER_LIST[i];
    out[p.name] = {
      type: 'http',
      interval: 86400,
      behavior: p.behavior || 'classical',
      // format: 'text',
      url: p.url,
      path: p.path,
    };
  }
  return out;
}

/** 取节点名（节点可能是对象，也可能是纯字符串） */
function nodeNameOf(p) {
  if (typeof p === 'string') return p;
  if (p && typeof p.name === 'string') return p.name;
  return '';
}

/**
 * 从一条规则里取出「策略目标」。
 *   MATCH,PROXY                     → 第 2 段
 *   RULE-SET,X,PROXY                → 第 3 段
 *   DOMAIN-SUFFIX,a.com,PROXY       → 第 3 段
 *   IP-CIDR,1.2.3.4/8,DIRECT,no-resolve → 第 3 段（末尾的选项段不算）
 *   GEOIP,CN,Direct,no-resolve      → 第 3 段
 * 认不出来就返回空串（不报警，避免误伤新规则类型）。
 */
function ruleTargetOf(rule) {
  var parts = String(rule).split(',');
  var type = (parts[0] || '').trim().toUpperCase();
  if (!type) return '';
  if (type === 'MATCH' || type === 'FINAL') return (parts[1] || '').trim();
  if (parts.length >= 3) return (parts[2] || '').trim();
  return '';
}

/** 规则第 2 段（RULE-SET / GEOSITE / DOMAIN-SET 时是规则集名） */
function ruleSetNameOf(rule) {
  var parts = String(rule).split(',');
  return (parts[1] || '').trim();
}

/** 内建策略目标：不算"缺组" */
function isBuiltinTarget(t) {
  return /^(DIRECT|REJECT|REJECT-DROP|PASS|COMPATIBLE|GLOBAL|PROXY|DIRECT-PROXY)$/i.test(t);
}

/** 核对 rules 指向的策略/规则集是否存在（只打 WARN，不阻断、不改内容） */
function checkTargets(config) {
  var providers = buildRuleProviders();
  var known = {};
  var i, k;

  /* 现存组名 + 顶层节点名 + 内建名，都算"存在" */
  var groups = Array.isArray(config['proxy-groups']) ? config['proxy-groups'] : [];
  for (i = 0; i < groups.length; i++) {
    var gn = nodeNameOf(groups[i]);
    if (gn) known[gn] = true;
  }
  var proxies = Array.isArray(config.proxies) ? config.proxies : [];
  for (i = 0; i < proxies.length; i++) {
    var pn = nodeNameOf(proxies[i]);
    if (pn) known[pn] = true;
  }

  var missingGroups = [];
  var usedSets = {};

  for (i = 0; i < RULES.length; i++) {
    var rule = RULES[i];
    var type = (String(rule).split(',')[0] || '').trim().toUpperCase();

    var t = ruleTargetOf(rule);
    if (t && !isBuiltinTarget(t) && !known[t] && missingGroups.indexOf(t) === -1) {
      missingGroups.push(t);
    }

    if (type === 'RULE-SET' || type === 'GEOSITE' || type === 'DOMAIN-SET') {
      var sn = ruleSetNameOf(rule);
      if (sn) {
        usedSets[sn] = true;
        if (!Object.prototype.hasOwnProperty.call(providers, sn)) {
          if (LOG) console.log(SCOPE + ' WARN 规则 "' + rule + '" 引用的规则集 "' + sn + '" 不在 RULE_PROVIDER_LIST 里');
        }
      }
    }
  }

  if (missingGroups.length) {
    if (LOG) {
      console.log(SCOPE + ' WARN 这些策略目标在 proxy-groups / proxies 里不存在（会让 mihomo 启动失败）：' + missingGroups.join(' | '));
      console.log(SCOPE + '      解决办法：改 ① 节点与策略组脚本的 GROUP_TEMPLATE，或把本文件 RULES 里的目标名改成 ① 里真实存在的组名');
    }
  }

  var unusedSets = [];
  for (k in providers) {
    if (!Object.prototype.hasOwnProperty.call(providers, k)) continue;
    if (!usedSets[k]) unusedSets.push(k);
  }
  if (unusedSets.length && LOG) {
    console.log(SCOPE + ' 提示 有规则集定义了但没被任何规则引用（正常，留着备用）：' + unusedSets.join(' | '));
  }

  var last = RULES.length ? String(RULES[RULES.length - 1]).trim().toUpperCase() : '';
  if (last.indexOf('MATCH,') !== 0 && last.indexOf('FINAL,') !== 0) {
    if (LOG) console.log(SCOPE + ' WARN 最后一条规则不是 MATCH —— 没命中任何规则的流量会走不出策略');
  }

  return { missingGroups: missingGroups, unusedSets: unusedSets };
}

/**
 * Sub-Store 会调用这个函数：传入解析好的 config 对象，把返回值写回文件。
 * 【不要改函数名】必须是 main。
 *
 * 本文件（②）只写 rules 和 rule-providers，不动 proxies / proxy-groups。
 */
async function main(config) {
  if (!config || typeof config !== 'object') {
    if (LOG) console.log(SCOPE + ' config 不是对象（文件类型可能不是 Mihomo 配置），跳过');
    return config;
  }

  /* ---- 生成规则集（先写，checkTargets 要用它的名单） ---- */
  if (GEN_RULE_PROVIDERS) {
    config['rule-providers'] = buildRuleProviders();
    if (LOG) {
      var cnt = 0;
      for (var k in config['rule-providers']) {
        if (Object.prototype.hasOwnProperty.call(config['rule-providers'], k)) cnt++;
      }
      console.log(SCOPE + ' 已生成规则集 ' + cnt + ' 个');
    }
  }

  /* ---- 生成规则 ---- */
  if (GEN_RULES) {
    config.rules = RULES.slice();
    if (LOG) console.log(SCOPE + ' 已生成规则 ' + config.rules.length + ' 条');
  }

  /* ---- 自检：规则引用的策略/规则集是否真的存在 ---- */
  if (CHECK_TARGETS && GEN_RULES && LOG) {
    checkTargets(config);
  }

  return config;
}
