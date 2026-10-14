import { Document, Page, Text, View, Link, StyleSheet } from "@react-pdf/renderer";

const C = {
  ink: "#1A1A1A",
  inkMuted: "#4A4A4A",
  rule: "#1A1A1A",
  bg: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 50,
    paddingHorizontal: 54,
    fontSize: 10,
    color: C.ink,
    fontFamily: "Times-Roman",
    backgroundColor: C.bg,
    lineHeight: 1.45,
  },

  // Header
  headerWrap: {
    marginBottom: 14,
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontFamily: "Times-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: C.ink,
    marginBottom: 6,
    textAlign: "center",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    fontSize: 9.5,
    color: C.inkMuted,
    lineHeight: 1.4,
  },
  contactItem: {
    marginHorizontal: 3,
  },
  link: {
    color: C.inkMuted,
    textDecoration: "none",
  },
  headerRule: {
    marginTop: 10,
    width: "100%",
    height: 1,
    backgroundColor: C.rule,
  },

  // Section Header
  section: {
    marginTop: 12,
  },
  sectionHeaderText: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.ink,
    marginBottom: 5,
    borderBottomWidth: 0.8,
    borderBottomColor: C.rule,
    paddingBottom: 3,
  },

  summary: {
    fontSize: 10,
    lineHeight: 1.45,
    color: C.ink,
  },

  // Skills
  skillsContainer: {
    marginTop: 2,
  },
  skillsLine: {
    fontSize: 9.75,
    color: C.ink,
    lineHeight: 1.5,
  },
  skillCategoryLine: {
    fontSize: 9.75,
    color: C.ink,
    lineHeight: 1.45,
    marginBottom: 2.5,
  },
  skillCategoryBold: {
    fontFamily: "Times-Bold",
  },

  // Experience
  expItem: {
    marginBottom: 8,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  expRole: {
    fontSize: 10.25,
    fontFamily: "Times-Bold",
    color: C.ink,
  },
  expPeriod: {
    fontSize: 9.25,
    fontFamily: "Times-Italic",
    color: C.inkMuted,
  },
  expCompanyLine: {
    fontSize: 9.5,
    fontFamily: "Times-Italic",
    color: C.inkMuted,
    marginBottom: 3,
  },

  // Projects
  projItem: {
    marginBottom: 8,
  },
  projHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  projName: {
    fontSize: 10.25,
    fontFamily: "Times-Bold",
    color: C.ink,
  },
  projTech: {
    fontSize: 9.25,
    fontFamily: "Times-Italic",
    color: C.inkMuted,
    marginBottom: 2,
  },
  projDesc: {
    fontSize: 9.75,
    color: C.ink,
    lineHeight: 1.4,
    marginBottom: 2.5,
  },
  projLink: {
    fontSize: 9,
    color: C.inkMuted,
    textDecoration: "underline",
  },

  // Bullets
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDash: {
    fontSize: 10,
    marginRight: 5,
    color: C.ink,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.75,
    lineHeight: 1.4,
    color: C.ink,
  },

  // Certifications
  certItem: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 4,
  },
  certText: {
    fontSize: 9.75,
    lineHeight: 1.4,
    color: C.ink,
  },

  // Education
  eduItem: {
    marginBottom: 6,
  },
  eduRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  eduDegree: {
    fontSize: 10.25,
    fontFamily: "Times-Bold",
    color: C.ink,
  },
  eduPeriod: {
    fontSize: 9.25,
    fontFamily: "Times-Italic",
    color: C.inkMuted,
  },
  eduSubline: {
    fontSize: 9.5,
    fontFamily: "Times-Italic",
    color: C.inkMuted,
    marginTop: 1,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 54,
    right: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.5,
    fontFamily: "Times-Italic",
    color: C.inkMuted,
    paddingTop: 6,
    borderTopWidth: 0.6,
    borderTopColor: C.rule,
  },
});

function SectionHeader({ children }) {
  return <Text style={styles.sectionHeaderText}>{children}</Text>;
}

function Bullet({ children }) {
  return (
    <View style={styles.bulletRow} wrap={false}>
      <Text style={styles.bulletDash}>—</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function shortenUrl(url) {
  if (!url) return "";
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

function getDeduplicatedContactInfo(basics, user) {
  const displayName = basics.name?.trim() || user?.name || "Your Name";
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
      <Text style={styles.skillsLine}>{skillList.join("   ·   ")}</Text>
    </View>
  );
}

export function ClassicTemplate({ user, version, title }) {
  const p = version?.parsedSections || {};
  const basics = p.basics || {};

  const { displayName, items: contactItems } = getDeduplicatedContactInfo(basics, user);

  return (
    <Document title={title || displayName || "Resume"} author={displayName}>
      <Page size="A4" style={styles.page}>
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
                {i < contactItems.length - 1 ? "   ·   " : ""}
              </Text>
            ))}
          </View>
          <View style={styles.headerRule} />
        </View>

        {/* SUMMARY */}
        {p.summary ? (
          <View style={styles.section}>
            <SectionHeader>Summary</SectionHeader>
            <Text style={styles.summary}>{p.summary}</Text>
          </View>
        ) : null}

        {/* EXPERIENCE */}
        {p.experience?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Experience</SectionHeader>
            {p.experience.map((exp, i) => (
              <View key={i} style={styles.expItem} wrap={false}>
                <View style={styles.expHeader}>
                  <Text style={styles.expRole}>{exp.role || "Role"}</Text>
                  {exp.period ? <Text style={styles.expPeriod}>{exp.period}</Text> : null}
                </View>
                {(exp.company || exp.location) && (
                  <Text style={styles.expCompanyLine}>
                    {exp.company || ""}
                    {exp.company && exp.location ? ", " : ""}
                    {exp.location || ""}
                  </Text>
                )}
                {exp.description ? <Text style={styles.projDesc}>{exp.description}</Text> : null}
                {(exp.bullets || []).map((b, j) => (
                  <Bullet key={j}>{b}</Bullet>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* PROJECTS */}
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
                    <Text style={styles.projName}>
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

        {/* EDUCATION */}
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

        {/* SKILLS */}
        {p.skills?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Skills</SectionHeader>
            {renderSkills(p.skills)}
          </View>
        ) : null}

        {/* CERTIFICATIONS */}
        {p.certifications?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Certifications</SectionHeader>
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
                  <Text style={styles.bulletDash}>— </Text>
                  <Text style={styles.certText}>
                    <Text style={{ fontFamily: "Times-Bold" }}>{certName}</Text>
                    {issuer ? ` – ${issuer}` : ""}
                    {year ? ` (${year})` : ""}
                    {details ? ` | ${details}` : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text>{displayName}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
