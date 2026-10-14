export const mockScoreSeries = [
  { label: "V1", score: 58, v: 58 },
  { label: "V2", score: 67, v: 67 },
  { label: "V3", score: 74, v: 74 },
  { label: "V4", score: 82, v: 82 },
];

export const mockKpiData = {
  spark1: [{ v: 12 }, { v: 18 }, { v: 14 }, { v: 22 }, { v: 28 }, { v: 25 }, { v: 32 }],
  spark2: [{ v: 4 }, { v: 6 }, { v: 5 }, { v: 8 }, { v: 12 }, { v: 14 }, { v: 18 }],
  spark3: [{ v: 20 }, { v: 18 }, { v: 16 }, { v: 12 }, { v: 10 }, { v: 8 }, { v: 6 }],
  spark4: [{ v: 60 }, { v: 64 }, { v: 70 }, { v: 72 }, { v: 75 }, { v: 80 }, { v: 82 }],
};

export const mockVersions = [
  { id: "v1", label: "V1", title: "Upload", score: 58, delta: 0 },
  { id: "v2", label: "V2", title: "Rewrite pass", score: 74, delta: 16 },
  { id: "v3", label: "V3", title: "Polished V3", score: 82, delta: 8 },
];

export const mockActivity = [
  {
    id: "a1",
    type: "analyze",
    title: "Analysis complete on V3",
    subtitle: "ATS score 82 / 100",
    label: "+8 pts",
    at: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: "a2",
    type: "rewrite",
    title: "5 bullets rewritten",
    subtitle: "Applied to Experience section",
    label: "V3 created",
    at: new Date(Date.now() - 1000 * 60 * 28),
  },
  {
    id: "a3",
    type: "upload",
    title: "Resume_2026.pdf uploaded",
    subtitle: "Parsed 3 sections, 18 bullets",
    label: "V1",
    at: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
  {
    id: "a4",
    type: "export",
    title: "Exported as PDF",
    subtitle: "Polished V3 — 2 pages",
    label: "Export",
    at: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

export const mockProfileStats = [
  { label: "Resumes", value: 3 },
  { label: "Rewrites", value: 24 },
  { label: "Exports", value: 7 },
];
