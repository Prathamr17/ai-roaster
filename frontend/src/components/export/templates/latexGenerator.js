/**
 * Generates clean LaTeX source code based on resume version data and user info.
 * Matches the tight letter-paper layout specification requested.
 */
function escapeLatex(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/&/g, "\\&")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function cleanUrl(url) {
  if (!url) return "";
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

export function generateLatexCode(user, version) {
  const p = version?.parsedSections || {};
  const basics = p.basics || {};

  const name = escapeLatex(basics.name?.trim() || user?.name || "YOUR NAME").toUpperCase();
  const location = escapeLatex(basics.location || "");
  const email = basics.email?.trim() || user?.email || "";
  const phone = escapeLatex(basics.phone || "");

  // Deduplicate contact links
  const rawLinks = basics.links || [];
  const seenUrls = new Set();
  const uniqueLinks = [];

  for (const l of rawLinks) {
    if (!l.url) continue;
    const norm = l.url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    if (!seenUrls.has(norm)) {
      seenUrls.add(norm);
      uniqueLinks.push({
        url: l.url.trim(),
        label: l.label || norm,
      });
    }
  }

  const contactHeaderParts = [];
  if (location) contactHeaderParts.push(location);
  if (email) contactHeaderParts.push(`\\href{mailto:${email}}{${escapeLatex(email)}}`);
  if (phone) contactHeaderParts.push(escapeLatex(phone));
  uniqueLinks.forEach((l) => {
    contactHeaderParts.push(`\\href{${l.url}}{${escapeLatex(cleanUrl(l.url))}}`);
  });

  let latexStr = `\\documentclass[9pt,letterpaper]{article}
\\usepackage[left=0.45in,top=0.45in,right=0.45in,bottom=0.45in]{geometry}
\\usepackage[utf8]{inputenc}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

% Setup hyperref colors
\\hypersetup{
    colorlinks=true,
    linkcolor=black,
    urlcolor=blue
}

% Style configurations
\\pagestyle{empty}
\\thispagestyle{empty}

% Section formatting with tight vertical padding
\\titleformat{\\section}{
  \\vspace{-8pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-3pt}]

% Ultra-compact bullet point settings
\\setlist[itemize]{leftmargin=0.15in, label={$\\bullet$}, itemsep=0.5pt, parseitemsep=0pt, topsep=1pt, partopsep=0pt}

\\begin{document}

%--- HEADER ---
\\begin{center}
    {\\LARGE \\bfseries ${name}} \\\\ \\vspace{2pt}
    \\small ${contactHeaderParts.join(" $|$ \n    ")}
\\end{center}
\\vspace{-8pt}
`;

  // Professional Summary
  if (p.summary) {
    latexStr += `
%--- PROFESSIONAL SUMMARY ---
\\section{Professional Summary}
${escapeLatex(p.summary)}
`;
  }

  // Technical Skills
  if (p.skills && p.skills.length > 0) {
    latexStr += `
%--- TECHNICAL SKILLS ---
\\section{Technical Skills}
\\begin{itemize}[label={}, leftmargin=0in, itemsep=0pt]
`;
    const hasCategories = p.skills.some((s) => typeof s === "string" && s.includes(":"));
    if (hasCategories) {
      p.skills.forEach((skill) => {
        if (typeof skill === "string" && skill.includes(":")) {
          const [cat, val] = skill.split(":");
          latexStr += `    \\item \\textbf{${escapeLatex(cat.trim())}:} ${escapeLatex(val.trim())}\n`;
        } else {
          latexStr += `    \\item ${escapeLatex(String(skill))}\n`;
        }
      });
    } else {
      const skillText = p.skills.map((s) => escapeLatex(String(s).trim())).join("  $\\bullet$  ");
      latexStr += `    \\item ${skillText}\n`;
    }
    latexStr += `\\end{itemize}\n`;
  }

  // Professional Experience
  if (p.experience && p.experience.length > 0) {
    latexStr += `
%--- PROFESSIONAL EXPERIENCE ---
\\section{Professional Experience}
`;
    p.experience.forEach((exp, i) => {
      const roleStr = escapeLatex(exp.role || "Role");
      const companyStr = escapeLatex(exp.company || "");
      const periodStr = escapeLatex(exp.period || "");
      const locationStr = escapeLatex(exp.location || "");
      const descStr = escapeLatex(exp.description || "");

      latexStr += `\\textbf{${roleStr}${companyStr ? ` $|$ ${companyStr}` : ""}} \\hfill ${periodStr} \\\\\n`;
      if (locationStr) {
        latexStr += `\\textit{${locationStr}}\\\\\n`;
      }
      if (descStr) {
        latexStr += `\\textit{${descStr}}\n`;
      }
      if (exp.bullets && exp.bullets.length > 0) {
        latexStr += `\\begin{itemize}\n`;
        exp.bullets.forEach((b) => {
          latexStr += `    \\item ${escapeLatex(b)}\n`;
        });
        latexStr += `\\end{itemize}\n`;
      }
      if (i < p.experience.length - 1) {
        latexStr += `\\vspace{4pt}\n`;
      }
    });
  }

  // Projects
  if (p.projects && p.projects.length > 0) {
    latexStr += `
%--- PROJECTS ---
\\section{Projects}
`;
    p.projects.forEach((proj, i) => {
      const projName = escapeLatex(proj.name || "Project");
      const firstLink = proj.links && proj.links[0];
      const linkLatex = firstLink
        ? `\\href{${firstLink.url}}{${escapeLatex(firstLink.label || "GitHub")}}`
        : "";
      const period = escapeLatex(proj.period || "");

      latexStr += `\\textbf{${projName}} ${linkLatex ? `\\hfill ${linkLatex}` : ""} \\\\\n`;

      const techStr = proj.tech && proj.tech.length > 0 ? proj.tech.join(", ") : "";
      if (techStr || period) {
        latexStr += `\\textit{${escapeLatex(techStr)}} ${period ? `\\hfill \\textit{${period}}` : ""}\n`;
      }

      if (proj.description || (proj.bullets && proj.bullets.length > 0)) {
        latexStr += `\\begin{itemize}\n`;
        if (proj.description) {
          latexStr += `    \\item ${escapeLatex(proj.description)}\n`;
        }
        if (proj.bullets) {
          proj.bullets.forEach((b) => {
            latexStr += `    \\item ${escapeLatex(b)}\n`;
          });
        }
        latexStr += `\\end{itemize}\n`;
      }

      if (i < p.projects.length - 1) {
        latexStr += `\\vspace{4pt}\n`;
      }
    });
  }

  // Certifications & Achievements
  if (p.certifications && p.certifications.length > 0) {
    latexStr += `
%--- CERTIFICATIONS \\& ACHIEVEMENTS ---
\\section{Certifications \\& Achievements}
\\begin{itemize}
`;
    p.certifications.forEach((c) => {
      if (typeof c === "string") {
        latexStr += `    \\item ${escapeLatex(c)}\n`;
      } else {
        const certName = escapeLatex(c.name || "");
        const issuer = escapeLatex(c.issuer || "");
        const year = escapeLatex(c.year || "");
        const details = escapeLatex(c.details || "");

        let line = `\\textbf{${certName}}`;
        if (issuer) line += ` -- ${issuer}`;
        if (year) line += ` (${year})`;
        if (details) line += ` $|$ ${details}`;
        latexStr += `    \\item ${line}\n`;
      }
    });
    latexStr += `\\end{itemize}\n`;
  }

  // Education
  if (p.education && p.education.length > 0) {
    latexStr += `
%--- EDUCATION ---
\\section{Education}
`;
    p.education.forEach((edu) => {
      const degree = escapeLatex(edu.degree || "Degree");
      const period = escapeLatex(edu.period || "");
      const school = escapeLatex(edu.school || "");
      const location = escapeLatex(edu.location || "");
      const details = escapeLatex(edu.details || "");

      latexStr += `\\textbf{${degree}} \\hfill ${period} \\\\\n`;
      let subline = `\\textit{${school}${location ? `, ${location}` : ""}}`;
      if (details) {
        subline += ` $|$ \\textbf{${details}}`;
      }
      latexStr += `${subline}\n`;

      if (edu.bullet || edu.bullets) {
        const bList = edu.bullets || [edu.bullet];
        latexStr += `\\begin{itemize}\n`;
        bList.forEach((b) => {
          latexStr += `    \\item ${escapeLatex(b)}\n`;
        });
        latexStr += `\\end{itemize}\n`;
      }
    });
  }

  latexStr += `\n\\end{document}\n`;

  return latexStr;
}
