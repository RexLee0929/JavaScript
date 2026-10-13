/**
 * Sub-Store 规则文件 —— 规则留在文件里，脚本只做格式转换
 * =========================================================
 * 适用：前端 v2.34.0 / 后端 v2.41.2（Node 后端）
 *
 * 【配置步骤】
 * 1. Sub-Store → 文件 → 新建文件
 * 2. 【类型】保持默认（普通文本文件，不要选 Mihomo 配置）
 * 3. 【源】本地内容，填你的裸规则行，一行一条：
 *
 *      DOMAIN,mail.rxxx.com
 *      DOMAIN,imap.rxxx.com
 *
 * 4. 【脚本】把下方「===== 脚本开始 =====」到「===== 脚本结束 =====」
 *    之间的代码粘进去（内联脚本）
 * 5. 访问：
 *
 *      Clash :  https://你的域名/api/file/<文件名>?$options=fmt%3Dclash&noCache=true
 *      Surge :  https://你的域名/api/file/<文件名>?$options=fmt%3Dsurge&noCache=true
 *
 * 【为什么之前写什么都"输出原文件" —— 已实测确认的根因】
 *
 * Sub-Store 的 nodeFunc 把脚本【直接内联插入】到一个名为 operator 的
 * 包装函数体内，而不是调用你定义的函数：
 *
 *   async function operator(input = [], targetPlatform, context) {
 *       if (input && (input.$files || input.$content)) {
 *           let { $content, $files, $options, $file } = input
 *           if (['mihomoConfig','mihomoProfile'].includes($file?.type)) {
 *               ... mihomo 分支 ...
 *           } else {
 *               <你的脚本原样插入到这里>     // ← 不是 function 调用！
 *           }
 *           return { $content, $files, $options, $file }
 *       } else {
 *           ... 节点模式 ...
 *       }
 *   }
 *
 * 由此推出两条必须遵守的规则：
 *
 *   A. 千万不要在脚本里定义 function operator() / function main()。
 *      同名函数声明会被提升，直接覆盖/遮蔽外层的 operator，
 *      而外层那个 operator 才是真正被调用、真正 return 的那个。
 *      结果就是：你的代码从未执行，内容原样输出。 ← 你遇到的现象
 *
 *   B. 脚本要写成【直接的语句】：读取 $content、加工、赋值回 $content。
 *      因为外层已经 `let { $content, ... } = input` 解构好了，
 *      你直接给 $content 赋值即可，最后包装器会 return 出去。
 *      同样地，不要再声明 const/let $content，否则报
 *      "Identifier '$content' has already been declared"。
 *
 * 本文件下方即符合上述契约的写法。
 */

/* ===== 脚本开始（复制以下内容到 Sub-Store 的脚本栏）===== */

// 取原始规则文本：优先 $content，回退 $files 数组
var __raw = ($content != null && String($content).trim() !== '')
  ? String($content)
  : ($files || []).join('\n');

// 解析参数：优先 $options.fmt（访问链接传入），其次 $arguments.fmt，默认 clash
var __fmt = String(
  ($options && $options.fmt) || ($arguments && $arguments.fmt) || 'surge'
).toLowerCase();

var __text = [
  'surge', 'loon', 'stash', 'qx', 'quantumult',
  'shadowrocket', 'text', 'plain',
].some(function (k) { return __fmt.indexOf(k) !== -1; });

// 清洗规则行：去空行/注释、去已有策略名、去重
var __lines = __raw
  .split('\n')
  .map(function (l) { return l.trim(); })
  .filter(function (l) {
    return l !== '' && l.indexOf('#') !== 0 && l.indexOf('//') !== 0;
  })
  .map(function (l) {
    var parts = l.split(',');
    if (parts.length < 3) return l;
    var type = (parts[0] || '').trim();
    if (!/^[A-Z0-9-]+$/i.test(type)) return l;
    var third = (parts[2] || '').trim();
    // 第三个字段是 no-resolve 这类【选项】时必须保留，不能当策略名剥掉
    if (/^(no-resolve|resolve|extended-matching|force-remote-dns)$/i.test(third)) {
      return l;
    }
    // 其余情况视为策略名，剥掉（策略组由主配置指定）
    return parts.slice(0, 2).join(',').trim();
  })
  .filter(function (l, i, arr) { return arr.indexOf(l) === i; });

// 按平台包装：
//   Surge / Loon / Stash / QX → 裸行（策略组由主配置 RULE-SET 指定）
//   Clash / Mihomo            → payload: 包装（供 rule-providers 使用）
var __out = __text
  ? __lines.join('\n')
  : 'payload:\n' + __lines.map(function (l) { return '  - ' + l; }).join('\n');

// 调试头（改的是已存在对象的内部属性，安全）
if ($options) {
  $options._res = $options._res || {};
  $options._res.headers = Object.assign({}, $options._res.headers, {
    'x-rules-format': __text ? 'plain' : 'clash',
    'x-rules-count': String(__lines.length),
  });
}

// 关键：直接给外层解构出的 $content 赋值
$content = __out;

/* ===== 脚本结束 ===== */
