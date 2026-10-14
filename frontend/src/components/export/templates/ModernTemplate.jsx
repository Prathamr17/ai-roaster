import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";

const C = {
  ink: "#111418",
  inkMuted: "#5C6470",
  accent: "#2F4A3A",
  accentSoft: "#E6EFE8",
  hairline: "#E5E5DF",
  bg: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontSize: 10.25,
    color: C.ink,
    fontFamily: "Helvetica",
    backgroundColor: C.bg,
    lineHeight: 1.5,
  },

  // header
  headerWrap: {
    marginBottom: 22,
  },
  name: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.6,
    color: C.ink,
    lineHeight: 1.15,
    marginBottom: 6,
  },
  title: {
    fontSize: 11.5,
    fontFamily: "Helvetica",
    color: C.accent,
    letterSpacing: 0.4,
    lineHeight: 1.3,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 9.5,
    color: C.inkMuted,
    marginTop: 2,
  },
  contactItem: {
    marginRight: 14,
    marginBottom: 3,
  },
  contactSep: {
    color: C.hairline,
    marginRight: 14,
  },
  link: {
    color: C.accent,
    textDecoration: "none",
  },
  rule: {
    marginTop: 14,
    height: 1,
    backgroundColor: C.hairline,
  },

  // sections
  section: {
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.6,
    color: C.accent,
    textTransform: "uppercase",
  },
  sectionHeaderLine: {
    flex: 1,
    height: 0.6,
    backgroundColor: C.hairline,
    marginLeft: 10,
  },

  // summary
  summary: {
    fontSize: 10.25,
    lineHeight: 1.55,
    color: C.ink,
  },

  // experience
  expItem: {
    marginBottom: 14,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1,
  },
  expRole: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
  },
  expPeriod: {
    fontSize: 9.5,
    color: C.inkMuted,
    fontFamily: "Helvetica",
  },
  expCompanyLine: {
    fontSize: 10,
    color: C.inkMuted,
    marginBottom: 5,
  },
  expCompany: {
    fontFamily: "Helvetica-Bold",
    color: C.accent,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: C.accent,
    marginRight: 9,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 10.25,
    lineHeight: 1.5,
    color: C.ink,
  },

  // education
  eduItem: {
    marginBottom: 8,
  },
  eduRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  eduDegree: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
  },
  eduMeta: {
    fontSize: 9.5,
    color: C.inkMuted,
  },
  eduSchool: {
    fontSize: 10,
    color: C.accent,
    marginTop: 1,
  },

  // projects
  projItem: {
    marginBottom: 10,
  },
  projHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },
  projName: {
    fontSize: 10.75,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    marginRight: 8,
  },
  projTech: {
    fontSize: 9.5,
    color: C.accent,
  },
  projDesc: {
    fontSize: 10.25,
    color: C.ink,
    lineHeight: 1.5,
  },
  projLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 3,
  },
  projLink: {
    fontSize: 9,
    color: C.accent,
    marginRight: 10,
    textDecoration: "none",
  },

  // skills
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillChip: {
    fontSize: 9.5,
    backgroundColor: C.accentSoft,
    color: C.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginRight: 5,
    marginBottom: 5,
  },

  // certifications
  certItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 5,
  },
  certName: {
    fontSize: 10.25,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
  },
  certMeta: {
    fontSize: 9.5,
    color: C.inkMuted,
  },

  // two-column tail (languages + interests)
  twoCol: {
    flexDirection: "row",
    gap: 24,
  },
  colHalf: {
    flex: 1,
  },
  pillLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  pill: {
    fontSize: 9.75,
    color: C.ink,
    marginRight: 10,
    marginBottom: 3,
  },

  // footer
  footer: {
    position: "absolute",
    bottom: 22,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.25,
    color: C.inkMuted,
    paddingTop: 8,
    borderTopWidth: 0.6,
    borderTopColor: C.hairline,
  },
});

function SectionHeader({ children }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{children}</Text>
      <View style={styles.sectionHeaderLine} />
    </View>
  );
}

function Bullet({ children }) {
  return (
    <View style={styles.bullet} wrap={false}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function ContactItem({ children, href }) {
  if (href) {
    return (
      <Link src={href} style={[styles.contactItem, styles.link]}>
        {children}
      </Link>
    );
  }
  return <Text style={styles.contactItem}>{children}</Text>;
}

function shortenUrl(url) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

export function ModernTemplate({ user, version, title }) {
  const p = version?.parsedSections || {};
  const basics = p.basics || {};

  const displayName = basics.name?.trim() || user?.name || "Your Name";
  const displayEmail = basics.email?.trim() || user?.email || "";

  return (
    <Document title={title || displayName || "Resume"} author={displayName}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <Text style={styles.name}>{displayName}</Text>
          {basics.title ? (
            <Text style={styles.title}>{basics.title}</Text>
          ) : null}

          <View style={styles.contactRow}>
            {basics.location ? (
              <ContactItem>{basics.location}</ContactItem>
            ) : null}
            {displayEmail ? (
              <ContactItem href={`mailto:${displayEmail}`}>
                {displayEmail}
              </ContactItem>
            ) : null}
            {basics.phone ? <ContactItem>{basics.phone}</ContactItem> : null}
            {(basics.links || []).map((l, i) => (
              <ContactItem key={i} href={l.url}>
                {l.label || shortenUrl(l.url || "")}
              </ContactItem>
            ))}
          </View>

          <View style={styles.rule} />
        </View>

        {/* Summary */}
        {p.summary ? (
          <View style={styles.section}>
            <SectionHeader>Summary</SectionHeader>
            <Text style={styles.summary}>{p.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {p.experience?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Experience</SectionHeader>
            {p.experience.map((exp, i) => (
              <View key={i} style={styles.expItem} wrap={false}>
                <View style={styles.expHeader}>
                  <Text style={styles.expRole}>{exp.role || "Role"}</Text>
                  {exp.period ? (
                    <Text style={styles.expPeriod}>{exp.period}</Text>
                  ) : null}
                </View>
                {(exp.company || exp.location) && (
                  <Text style={styles.expCompanyLine}>
                    {exp.company ? (
                      <Text style={styles.expCompany}>{exp.company}</Text>
                    ) : null}
                    {exp.company && exp.location ? "  ·  " : ""}
                    {exp.location || ""}
                  </Text>
                )}
                {(exp.bullets || []).map((b, j) => (
                  <Bullet key={j}>{b}</Bullet>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {p.projects?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Projects</SectionHeader>
            {p.projects.map((proj, i) => (
              <View key={i} style={styles.projItem} wrap={false}>
                <View style={styles.projHeader}>
                  <Text style={styles.projName}>{proj.name}</Text>
                  {proj.tech?.length ? (
                    <Text style={styles.projTech}>{proj.tech.join(" · ")}</Text>
                  ) : null}
                </View>
                {proj.description ? (
                  <Text style={styles.projDesc}>{proj.description}</Text>
                ) : null}
                {proj.links?.length ? (
                  <View style={styles.projLinks}>
                    {proj.links.map((l, j) => (
                      <Link key={j} src={l.url} style={styles.projLink}>
                        {l.label || shortenUrl(l.url || "")}
                      </Link>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {p.education?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Education</SectionHeader>
            {p.education.map((edu, i) => (
              <View key={i} style={styles.eduItem} wrap={false}>
                <View style={styles.eduRow}>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  {edu.period ? (
                    <Text style={styles.eduMeta}>{edu.period}</Text>
                  ) : null}
                </View>
                <Text style={styles.eduSchool}>
                  {edu.school}
                  {edu.location ? ` · ${edu.location}` : ""}
                </Text>
                {edu.details ? (
                  <Text style={[styles.eduMeta, { marginTop: 2 }]}>
                    {edu.details}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {p.skills?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Skills</SectionHeader>
            <View style={styles.skillsGrid}>
              {p.skills.map((s, i) => (
                <Text key={i} style={styles.skillChip}>
                  {s}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* Certifications */}
        {p.certifications?.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Certifications</SectionHeader>
            {p.certifications.map((c, i) => (
              <View key={i} style={styles.certItem} wrap={false}>
                <Text>
                  <Text style={styles.certName}>{c.name}</Text>
                  {c.issuer ? (
                    <Text style={styles.certMeta}> · {c.issuer}</Text>
                  ) : null}
                </Text>
                {c.year ? <Text style={styles.certMeta}>{c.year}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Languages + Interests two-column */}
        {(p.languages?.length > 0 || p.interests?.length > 0) && (
          <View style={[styles.section, styles.twoCol]}>
            {p.languages?.length > 0 && (
              <View style={styles.colHalf}>
                <SectionHeader>Languages</SectionHeader>
                <View style={styles.pillLine}>
                  {p.languages.map((l, i) => (
                    <Text key={i} style={styles.pill}>
                      {l}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            {p.interests?.length > 0 && (
              <View style={styles.colHalf}>
                <SectionHeader>Interests</SectionHeader>
                <View style={styles.pillLine}>
                  {p.interests.map((l, i) => (
                    <Text key={i} style={styles.pill}>
                      {l}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>{displayName}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
