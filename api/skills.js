/**
 * Vercel Serverless Function - Skills Proxy
 * 代理 skills.sh 页面，解析 HTML 并返回结构化 JSON
 *
 * 端点: /api/skills
 *
 * 查询参数:
 *   tab:    "all-time" | "trending" | "hot" | "official" | "audits" (默认 "all-time")
 *   topic:  主题名 (如 "react", "nextjs", "design")
 *   agent:  Agent 名 (如 "claude-code", "cursor")
 *   repo:   仓库路径 (如 "anthropics/skills")
 *   q:      搜索关键字
 */

export default async function handler(req, res) {
  // CORS & Cache headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { tab = "all-time", topic, agent, repo, q } = req.query;

  try {
    // ===== If search query is provided, use the official search API =====
    if (q && q.trim()) {
      const searchUrl = `https://skills.sh/api/search?q=${encodeURIComponent(q.trim())}&limit=50`;
      const searchResp = await fetch(searchUrl, {
        headers: { "User-Agent": UA },
      });
      if (!searchResp.ok) {
        return res.status(searchResp.status).json({ error: "搜索失败", skills: [] });
      }
      const searchData = await searchResp.json();
      const skills = (searchData.skills || []).map((s, i) => ({
        rank: i + 1,
        name: s.name || s.skillId,
        author: s.source,
        installs: formatNumber(s.installs),
        path: s.id,
      }));
      return res.status(200).json({ skills, type: "search", query: q.trim() });
    }

    // ===== Determine target URL =====
    let targetUrl;
    let pageType = "leaderboard";

    if (topic) {
      targetUrl = `https://www.skills.sh/topic/${encodeURIComponent(topic)}`;
      pageType = "topic";
    } else if (agent) {
      targetUrl = `https://www.skills.sh/agent/${encodeURIComponent(agent)}`;
      pageType = "agent";
    } else if (repo) {
      targetUrl = `https://www.skills.sh/${repo}`;
      pageType = "repo";
    } else if (tab === "audits") {
      targetUrl = "https://www.skills.sh/audits";
      pageType = "audits";
    } else if (tab === "trending") {
      targetUrl = "https://www.skills.sh/trending";
    } else if (tab === "hot") {
      targetUrl = "https://www.skills.sh/hot";
    } else if (tab === "official") {
      targetUrl = "https://www.skills.sh/official";
      pageType = "official";
    } else {
      targetUrl = "https://www.skills.sh/";
    }

    // ===== Fetch page HTML =====
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `获取失败: ${response.status}`,
        skills: [],
      });
    }

    const html = await response.text();

    // ===== Parse skills based on page type =====
    let skills;
    let meta = {};

    if (pageType === "topic" || pageType === "agent" || pageType === "repo") {
      // Topic/Agent/Repo pages use JSON-LD structured data + card layout
      const result = parseTopicOrAgentPage(html, pageType);
      skills = result.skills;
      meta = result.meta;
    } else if (pageType === "official") {
      skills = parseOfficialPage(html);
    } else if (pageType === "audits") {
      skills = parseAuditsPage(html);
    } else {
      // Leaderboard pages use table/grid layout
      skills = parseLeaderboardPage(html);
    }

    return res.status(200).json({
      skills,
      type: pageType,
      tab: pageType === "leaderboard" ? tab : undefined,
      ...meta,
      total: skills.length,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      error: error.message || "服务器内部错误",
      skills: [],
    });
  }
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Format a number with K/M suffix
 */
function formatNumber(num) {
  if (typeof num !== "number") return String(num);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(num);
}

/**
 * Parse leaderboard pages (/, /trending, /hot)
 * Structure:
 *   <a href="/{owner}/{repo}/{skill}">
 *     <span class="font-mono">{rank}</span>
 *     <h3 class="font-semibold truncate whitespace-nowrap">{name}</h3>
 *     <p class="font-mono mt-0">{author}</p>
 *     <span class="font-mono">{installs}</span>
 *   </a>
 */
function parseLeaderboardPage(html) {
  const skills = [];

  // Match skills in the leaderboard grid
  // Pattern: href="/owner/repo/name" ... rank ... skill-name ... author ... installs
  const regex =
    /href="\/([a-z0-9_-]+\/[a-z0-9_-]+\/[a-z0-9_-]+)"[^>]*>.*?font-mono[^>]*>(\d+)<\/span>.*?truncate whitespace-nowrap[^>]*>([^<]+)<\/h3>.*?font-mono mt-0[^>]*>([^<]+)<\/p>.*?font-mono[^>]*>([\d,.]+[KMB]?)<\/span>/gs;

  let match;
  while ((match = regex.exec(html)) !== null) {
    skills.push({
      rank: parseInt(match[2], 10),
      name: match[3].trim(),
      author: match[4].trim(),
      installs: match[5].trim(),
      path: match[1].trim(),
    });
  }

  return skills;
}

/**
 * Parse topic, agent, or repo pages
 * Uses JSON-LD structured data embedded in <script type="application/ld+json">
 * and card layout with links
 */
function parseTopicOrAgentPage(html, pageType) {
  const skills = [];
  let meta = {};

  // Try to extract from JSON-LD
  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json">\s*({[\s\S]*?})\s*<\/script>/
  );

  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1]);

      // Extract title
      if (jsonLd.name) meta.title = jsonLd.name;
      if (jsonLd.description) meta.description = jsonLd.description;

      // Extract skills from hasPart array
      const parts = jsonLd.hasPart || [];
      parts.forEach((part, i) => {
        if (part["@type"] === "SoftwareApplication") {
          const url = part.url || "";
          // Extract path from URL like https://www.skills.sh/owner/repo/name
          const pathMatch = url.match(
            /skills\.sh\/([a-z0-9_-]+\/[a-z0-9_-]+\/[a-z0-9_-]+)/i
          );
          const path = pathMatch ? pathMatch[1] : "";
          const authorMatch = path.match(/^([^/]+\/[^/]+)\//);

          skills.push({
            rank: i + 1,
            name: part.name || "",
            author: authorMatch ? authorMatch[1] : "",
            installs: "",
            path: path,
            description: part.description || "",
          });
        }
      });
    } catch (e) {
      // JSON parse failed, fall through to link-based parsing
    }
  }

  // If JSON-LD didn't yield results, fall back to parsing links
  if (skills.length === 0) {
    const linkRegex =
      /href="\/([a-z0-9_-]+\/[a-z0-9_-]+\/[a-z0-9_-]+)"[^>]*>/gi;
    let linkMatch;
    const seen = new Set();
    let rank = 1;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const path = linkMatch[1];
      // Skip _next/* paths
      if (path.startsWith("_next")) continue;
      if (seen.has(path)) continue;
      seen.add(path);

      const parts = path.split("/");
      skills.push({
        rank: rank++,
        name: parts[2] || "",
        author: `${parts[0]}/${parts[1]}`,
        installs: "",
        path: path,
      });
    }
  }

  // Extract the page title from the <h1> tag, cleaning comments and inner tags
  if (!meta.title) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      meta.title = h1Match[1]
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .trim();
    }
  }

  // Extract description from meta tag if not present
  if (!meta.description) {
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) || 
                      html.match(/<meta[^>]*content="([^"]+)"[^>]*name="description"/i);
    if (descMatch) {
      meta.description = descMatch[1].replace(/&amp;/g, "&").trim();
    }
  }

  return { skills, meta };
}

/**
 * Parse official page from Next.js streamed payload
 */
function parseOfficialPage(html) {
  const ownersKey = '\\"owners\\":';
  const index = html.indexOf(ownersKey);
  if (index === -1) {
    return [];
  }
  
  let jsonStart = html.indexOf("[", index);
  if (jsonStart === -1) return [];
  
  let bracketCount = 0;
  let jsonEnd = -1;
  let inString = false;
  let escape = false;
  
  for (let i = jsonStart; i < html.length; i++) {
    const char = html[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '[') {
        bracketCount++;
      } else if (char === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }
  }
  
  if (jsonEnd === -1) return [];
  
  const rawJson = html.substring(jsonStart, jsonEnd);
  const cleanJson = rawJson
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
    
  try {
    const owners = JSON.parse(cleanJson);
    const officialSkills = [];
    
    owners.forEach(owner => {
      owner.repos.forEach(repo => {
        repo.skills.forEach(skill => {
          officialSkills.push({
            name: skill.name,
            author: repo.repo,
            installsRaw: skill.installs || 0,
            path: `${repo.repo}/${skill.name}`
          });
        });
      });
    });
    
    // Sort official skills by installs descending
    officialSkills.sort((a, b) => b.installsRaw - a.installsRaw);
    
    // Format installs and set rank
    return officialSkills.map((s, idx) => ({
      rank: idx + 1,
      name: s.name,
      author: s.author,
      installs: formatNumber(s.installsRaw),
      path: s.path
    }));
  } catch (err) {
    console.error("parseOfficialPage error:", err);
    return [];
  }
}

/**
 * Parse security audits page table rows
 */
function parseAuditsPage(html) {
  const skills = [];
  const regex = /href="\/([a-z0-9_-]+\/[a-z0-9_-]+\/[a-z0-9_-]+)"[^>]*>.*?font-mono[^>]*>(\d+)<\/div>.*?truncate group-hover:underline[^>]*>([^<]+)<\/h3>.*?font-mono truncate[^>]*>([^<]+)<\/p>/gs;
  
  let match;
  while ((match = regex.exec(html)) !== null) {
    skills.push({
      rank: parseInt(match[2], 10),
      name: match[3].trim(),
      author: match[4].trim(),
      installs: "安全审计已完成",
      path: match[1].trim()
    });
  }
  return skills;
}
