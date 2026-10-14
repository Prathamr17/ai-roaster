import { Document, Page, Text, View, Link, StyleSheet } from "@react-pdf/renderer";

const C = {
  ink: "#000000",
  inkMuted: "#333333",
  rule: "#000000",
  bg: "#FFFFFF",
  link: "#0000EE",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 32.4, // 0.45in
    paddingBottom: 32.4,
    paddingHorizontal: 32.4,
    fontSize: 9,
    color: C.ink,
    fontFamily: "Helvetica",
    backgroundColor: C.bg,
    lineHeight: 1.35,
  },

  // Header
  headerWrap: {
    marginBottom: 8,
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: C.ink,
    marginBottom: 4,
    textAlign: "center",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    fontSize: 8.5,
    color: C.ink,
    lineHeight: 1.35,
  },
  contactItem: {
    marginHorizontal: 2,
  },
  link: {
    color: C.link,
    textDecoration: "none",
  },

  // Section Formatting
  section: {
    marginTop: 7,
  },
  sectionHeaderText: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: C.ink,
    marginBottom: 3,
    borderBottomWidth: 0.8,
    borderBottomColor: C.rule,
    paddingBottom: 2,
  },

  summary: {
    fontSize: 9,
    lineHeight: 1.35,
    color: C.ink,
  },

  // Technical Skills
  skillsContainer: {
    marginTop: 1,
  },
  skillCategoryLine: {
    fontSize: 8.75,
    color: C.ink,
    lineHeight: 1.35,
    marginBottom: 1.5,
  },
  skillCategoryBold: {
    fontFamily: "Helvetica-Bold",
  },
  skillsInlineText: {
    fontSize: 8.75,
    color: C.ink,
    lineHeight: 1.35,
  },

  // Experience
  expItem: {
    marginBottom: 5,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  expTitle: {
    fontSize: 9.25,
    color: C.ink,
  },
  expRoleBold: {
    fontFamily: "Helvetica-Bold",
  },
  expPeriod: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Oblique",
    color: C.inkMuted,
  },
  expLocation: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Oblique",
    color: C.inkMuted,
    marginBottom: 2,
  },

  // Projects
  projItem: {
    marginBottom: 5,
  },
  projHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  projTitle: {
    fontSize: 9.25,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
  },
  projLink: {
    fontFamily: "Helvetica",
    color: C.link,
    textDecoration: "none",
  },
  projTech: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Oblique",
    color: C.inkMuted,
    marginBottom: 2,
  },
  projDesc: {
    fontSize: 8.75,
    fontFamily: "Helvetica-Oblique",
    color: C.ink,
    lineHeight: 1.3,
    marginBottom: 2,
  },

  // Bullet Point
  bulletRow: {
    flexDirection: "row",
    marginBottom: 1.5,
    paddingLeft: 6,
  },
  bulletDot: {
    fontSize: 8.5,
    marginRight: 4,
    color: C.ink,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.75,
    lineHeight: 1.3,
    color: C.ink,
  },

  // Certifications
  certItem: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 6,
  },
  certText: {
    fontSize: 8.75,
    lineHeight: 1.3,
    color: C.ink,
  },

  // Education
  eduItem: {
    marginBottom: 4,
  },
  eduRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  eduDegree: {
    fontSize: 9.25,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
  },
  eduPeriod: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Oblique",
    color: C.inkMuted,
  },
  eduSubline: {
    fontSize: 8.75,
    fontFamily: "Helvetica-Oblique",
    color: C.inkMuted,
    marginTop: 1,
  },
});

function SectionHeader({ children }) {
  return <Text style={styles.sectionHeaderText}>{children}</Text>;
}

function Bullet({ children }) {
  return (
    <View style={styles.bulletRow} wrap={false}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function shortenUrl(url) {
  if (!url) return "";
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

function getDeduplicatedContactInfo(basics, user) {
  const displayName = basics.name?.trim() || user?.name || "AKBERHUSAIN SHAIKH";
  const email = basics.email?.trim() || user?.email || "";
  const phone = basics.phone?.trim() || "";
  const location = basics.location?.trim() || "";

  const rawLinks = basics.links || [];
  const seenUrls = new Set();
  const uniqueLinks = [];

  for (const l of rawLinks) {
    if (!l.url) continue;
    const urlClean = l.url.trim();
    const norm = urlClean.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    if (!seenUrls.has(norm)) {
      seenUrls.add(norm);
      uniqueLinks.push({
        url: urlClean,
        label: l.label || norm,
      });
    }
  }

  const items = [];
  if (location) items.push({ text: location });
  if (email) items.push({ text: email, href: `mailto:${email}` });
  if (phone) items.push({ text: phone });
  uniqueLinks.forEach((l) => {
    items.push({ text: l.label, href: l.url });
  });

  return { displayName, items };
}

function renderSkills(skills) {
  if (!skills || skills.length === 0) return null;

  const hasCategories = skills.some((s) => typeof s === "string" && s.includes(":"));

  if (hasCategories) {
    return (
      <View style={styles.skillsContainer}>
        {skills.map((skill, i) => {
          if (typeof skill === "string" && skill.includes(":")) {
            const parts = skill.split(":");
            const label = parts[0].trim();
            const val = parts.slice(1).join(":").trim();
            return (
              <Text key={i} style={styles.skillCategoryLine}>
                <Text style={styles.skillCategoryBold}>{label}: </Text>
                <Text>{val}</Text>
              </Text>
            );
          }
          return (
            <Text key={i} style={styles.skillCategoryLine}>
              <Text>{String(skill)}</Text>
            </Text>
          );
        })}
      </View>
    );
  }

  const skillList = skills.map((s) => (typeof s === "string" ? s.trim() : String(s))).filter(Boolean);
  return (
    <View style={styles.skillsContainer}>
      <Text style={styles.skillsInlineText}>{skillList.join("  •  ")}</Text>
    </View>
  );
}

export function LatexTemplate({ user, version, title }) {
  const p = version?.parsedSections || {};
  const basics = p.basics || {};

  const { displayName, items: contactItems } = getDeduplicatedContactInfo(basics, user);

  return (
    <Document title={title || displayName || "Resume"} author={displayName}>
      <Page size="LETTER" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerWrap}>
          <Text style={styles.name}>{displayName}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <Text key={i} style={styles.contactItem}>
                {item.href ? (
                  <Link src={item.href} style={styles.link}>
                    {item.text}
                  </Link>
                ) : (
                  item.text
                )}
                {i < contactItems.length - 1 ? "  |  " : ""}
              </Text>
            ))}
          </View>
        </View>

        {/* 1. PROFESSIONAL SUMMARY */}
        {p.summary ? (
          <View style={styles.section}>
            <SectionHeader>Professional Summary</SectionHeader>
            <Text style={styles.summary}>{p.summary}</Text>
          </View>
        ) : null}

        {/* 2. TECHNICAL SKILLS */}
        {p.skills?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Technical Skills</SectionHeader>
            {renderSkills(p.skills)}
          </View>
        ) : null}

        {/* 3. PROFESSIONAL EXPERIENCE */}
        {p.experience?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Professional Experience</SectionHeader>
            {p.experience.map((exp, i) => (
              <View key={i} style={styles.expItem} wrap={false}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>
                    <Text style={styles.expRoleBold}>{exp.role || "Role"}</Text>
                    {exp.company ? ` | ${exp.company}` : ""}
                  </Text>
                  {exp.period ? <Text style={styles.expPeriod}>{exp.period}</Text> : null}
                </View>
                {exp.location ? <Text style={styles.expLocation}>{exp.location}</Text> : null}
                {exp.description ? <Text style={styles.projDesc}>{exp.description}</Text> : null}
                {(exp.bullets || []).map((b, j) => (
                  <Bullet key={j}>{b}</Bullet>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* 4. PROJECTS */}
        {p.projects?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Projects</SectionHeader>
            {p.projects.map((proj, i) => {
              const firstLink = proj.links && proj.links[0];
              const period = proj.period || "";
              const techStr = proj.tech?.length ? proj.tech.join(", ") : "";

              return (
                <View key={i} style={styles.projItem} wrap={false}>
                  <View style={styles.projHeader}>
                    <Text style={styles.projTitle}>
                      {proj.name}
                      {firstLink ? (
                        <Text>
                          {" | "}
                          <Link src={firstLink.url} style={styles.projLink}>
                            {firstLink.label || shortenUrl(firstLink.url)}
                          </Link>
                        </Text>
                      ) : null}
                    </Text>
                    {period ? <Text style={styles.expPeriod}>{period}</Text> : null}
                  </View>

                  {techStr ? <Text style={styles.projTech}>{techStr}</Text> : null}
                  {proj.description ? <Text style={styles.projDesc}>{proj.description}</Text> : null}

                  {(proj.bullets || []).map((b, j) => (
                    <Bullet key={j}>{b}</Bullet>
                  ))}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* 5. CERTIFICATIONS & ACHIEVEMENTS */}
        {p.certifications?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Certifications & Achievements</SectionHeader>
            {p.certifications.map((c, i) => {
              if (typeof c === "string") {
                return <Bullet key={i}>{c}</Bullet>;
              }
              const certName = c.name || "";
              const issuer = c.issuer || "";
              const year = c.year || "";
              const details = c.details || "";

              return (
                <View key={i} style={styles.certItem} wrap={false}>
                  <Text style={styles.bulletDot}>• </Text>
                  <Text style={styles.certText}>
                    <Text style={{ fontFamily: "Helvetica-Bold" }}>{certName}</Text>
                    {issuer ? ` – ${issuer}` : ""}
                    {year ? ` (${year})` : ""}
                    {details ? ` | ${details}` : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* 6. EDUCATION */}
        {p.education?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Education</SectionHeader>
            {p.education.map((edu, i) => (
              <View key={i} style={styles.eduItem} wrap={false}>
                <View style={styles.eduRow}>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  {edu.period ? <Text style={styles.eduPeriod}>{edu.period}</Text> : null}
                </View>
                <Text style={styles.eduSubline}>
                  {edu.school}
                  {edu.location ? `, ${edu.location}` : ""}
                  {edu.details ? ` | ${edu.details}` : ""}
                </Text>
                {edu.bullet ? <Bullet>{edu.bullet}</Bullet> : null}
                {(edu.bullets || []).map((b, j) => (
                  <Bullet key={j}>{b}</Bullet>
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
