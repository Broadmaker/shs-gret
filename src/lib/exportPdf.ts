import { jsPDF } from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import { evaluationAreas } from "../data/evaluationAreas";
import { calculateOverall } from "./calculations";
import type { Evaluation } from "../types/evaluation";
import depedSealUrl from "../assets/seals/deped-seal.png";
import depedLogoUrl from "../assets/seals/deped-logo.png";
import bagongUrl from "../assets/seals/bagong-pilipinas.png";
import sdoLogoUrl from "../assets/seals/sdo-logo.png";

const DIVISION = "Schools Division of Zamboanga Sibugay";
const CONTACTS = [
  "Pangi, Ipil, Zamboanga Sibugay, 7001",
  "0968-520-9123",
  "zamboanga.sibugay@deped.gov.ph",
  "depedzamboangasibugay.ph",
  "DepEd Tayo Zamboanga Sibugay Division",
];

function filenameFor(ev: Evaluation): string {
  const school = (ev.school.name || "school").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-");
  const sy = (ev.school.schoolYear || "").replace(/\s+/g, "");
  return `SHS-Evaluation-${school}${sy ? `-${sy}` : ""}.pdf`;
}

async function tryImage(src: string): Promise<HTMLImageElement | null> {
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`logo failed: ${src}`));
      img.src = src;
    });
  } catch {
    return null;
  }
}

/** Draw image fitted to height h at (x, yTop); returns width used. */
function drawFitted(doc: jsPDF, img: HTMLImageElement, x: number, yTop: number, h: number): number {
  const w = (h * img.width) / img.height;
  doc.addImage(img, "PNG", x, yTop, w, h);
  return w;
}

const fontCache = new Map<string, string>();

async function fontBase64(url: string): Promise<string | null> {
  const hit = fontCache.get(url);
  if (hit) return hit;
  try {
    const buf = await (await fetch(url)).arrayBuffer();
    const bytes = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    const b64 = btoa(s);
    fontCache.set(url, b64);
    return b64;
  } catch {
    return null;
  }
}

/** Embed Old English + Verdana so the PDF matches official DepEd styling. */
async function embedOfficialFonts(doc: jsPDF): Promise<{ oldEnglish: boolean; verdana: boolean }> {
  const [oldEng, verdana, verdanaBold] = await Promise.all([
    fontBase64("/fonts/OLDENGL.TTF"),
    fontBase64("/fonts/verdana.ttf"),
    fontBase64("/fonts/verdanab.ttf"),
  ]);
  let oldEnglish = false;
  let hasVerdana = false;
  if (oldEng) { doc.addFileToVFS("OLDENGL.TTF", oldEng); doc.addFont("OLDENGL.TTF", "OldEnglish", "normal"); oldEnglish = true; }
  if (verdana) { doc.addFileToVFS("verdana.ttf", verdana); doc.addFont("verdana.ttf", "Verdana", "normal"); hasVerdana = true; }
  if (verdanaBold) { doc.addFileToVFS("verdanab.ttf", verdanaBold); doc.addFont("verdanab.ttf", "Verdana", "bold"); }
  return { oldEnglish, verdana: hasVerdana };
}

export async function exportEvaluationPdf(ev: Evaluation) {
  const overall = calculateOverall(ev);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 14; // side margins
  let y = 16;

  // Official logos (bundled locally — offline-safe) + official fonts (served
  // from /fonts — offline-safe once deployed). Missing files degrade to the
  // built-in fonts / text-only layout rather than breaking the export.
  const [seal, depedLogo, bagong, sdoLogo] = await Promise.all([
    tryImage(depedSealUrl),
    tryImage(depedLogoUrl),
    tryImage(bagongUrl),
    tryImage(sdoLogoUrl),
  ]);
  const fonts = await embedOfficialFonts(doc);
  // Font handles with built-in fallbacks when embedding fails.
  const F = fonts.verdana ? "Verdana" : "helvetica";
  const F_HEAD = fonts.oldEnglish ? "OldEnglish" : "times";

  // Vector contact icons (white on dark badge) mirroring the on-screen footer.
  // Badge 3.2mm; rows stack at 3.6mm pitch — 5 rows = 18mm block height,
  // matched by the 18mm official logos beside it.
  const contactIcon = (kind: number, bx: number, by: number) => {
    doc.setFillColor(35, 35, 35);
    doc.roundedRect(bx, by, 3.2, 3.2, 0.7, 0.7, "F");
    doc.setDrawColor(255, 255, 255);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.28);
    const cx = bx + 1.6;
    if (kind === 0) { // location pin
      doc.circle(cx, by + 1.25, 0.7, "F");
      doc.triangle(bx + 1.05, by + 1.75, bx + 2.15, by + 1.75, cx, by + 2.75, "F");
    } else if (kind === 1) { // phone handset
      doc.setLineWidth(0.8);
      doc.line(bx + 0.95, by + 2.35, bx + 2.25, by + 0.85);
      doc.circle(bx + 0.95, by + 2.35, 0.45, "F");
      doc.circle(bx + 2.25, by + 0.85, 0.45, "F");
    } else if (kind === 2) { // envelope
      doc.rect(bx + 0.75, by + 1.05, 1.7, 1.15);
      doc.line(bx + 0.75, by + 1.05, cx, by + 1.75);
      doc.line(bx + 2.45, by + 1.05, cx, by + 1.75);
    } else if (kind === 3) { // globe
      doc.circle(cx, by + 1.6, 0.9);
      doc.line(cx, by + 0.7, cx, by + 2.5);
      doc.line(bx + 0.7, by + 1.6, bx + 2.5, by + 1.6);
    } else { // facebook "f"
      doc.setFont(F, "bold");
      doc.setFontSize(5);
      doc.setTextColor(255, 255, 255);
      doc.text("f", cx, by + 2.45, { align: "center" });
    }
  };

  const footer = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      const fy = doc.internal.pageSize.getHeight() - 8; // footer zone bottom
      doc.setDrawColor(30, 30, 30);
      doc.setLineWidth(0.4);
      doc.line(M, fy - 20, W - M, fy - 20);
      let tx = M;
      const marks = [depedLogo, bagong, sdoLogo].filter((m): m is HTMLImageElement => m != null);
      for (const m of marks) tx += drawFitted(doc, m, tx, fy - 19, 18) + 3;
      if (marks.length > 0) tx += 3;
      // Stacked contact rows with icons, same 18mm block height as the logos.
      doc.setFont(F, "normal");
      doc.setFontSize(7);
      CONTACTS.forEach((c, k) => {
        const ry = fy - 19 + k * 3.6;
        contactIcon(k, tx, ry);
        doc.setTextColor(80, 80, 80);
        doc.text(c, tx + 4.4, ry + 2.5);
      });
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text(`Page ${i} of ${pages}`, W - M, fy - 1, { align: "right" });
    }
  };

  // Letterhead
  if (seal) {
    drawFitted(doc, seal, W / 2 - 10, y, 20);
    y += 25;
  }
  doc.setFont(F_HEAD, "normal");
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 20);
  doc.text("Republic of the Philippines", W / 2, y, { align: "center" });
  doc.setFontSize(19);
  doc.text("Department of Education", W / 2, (y += 7.5), { align: "center" });
  doc.setFont(F, "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text("Region IX — Zamboanga Peninsula", W / 2, (y += 5.5), { align: "center" });
  doc.setFont(F, "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(DIVISION, W / 2, (y += 5), { align: "center" });
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.6);
  doc.line(M, (y += 3.5), W - M, y);
  doc.setFontSize(12);
  doc.text("SHS GOVERNMENT RECOGNITION EVALUATION", W / 2, (y += 7), { align: "center" });
  doc.setFont(F, "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text("Annex I — Evaluation Tool Summary", W / 2, (y += 5), { align: "center" });

  // School profile grid
  y += 4;
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  const rows: [string, string, string, string][] = [
    ["School:", ev.school.name || "—", "School ID:", ev.school.schoolId || "—"],
    ["Address:", ev.school.address || "—", "Division / Region:", `${ev.school.division || "—"} / ${ev.school.region || "—"}`],
    ["School Year:", ev.school.schoolYear || "—", "Ocular Date:", ev.school.ocularInspectionDate || "—"],
  ];
  for (const [k1, v1, k2, v2] of rows) {
    y += 5.5;
    doc.setFont(F, "bold");
    doc.text(k1, M, y);
    doc.setFont(F, "normal");
    doc.text(v1, M + 30, y);
    doc.setFont(F, "bold");
    doc.text(k2, W / 2 + 2, y);
    doc.setFont(F, "normal");
    doc.text(v2, W / 2 + 38, y);
  }

  // Overall compliance box
  y += 4;
  const overallBody: RowInput[] = [
    [{ content: "OVERALL COMPLIANCE", styles: { fontSize: 8, textColor: [110, 110, 110] } }],
    [{ content: overall.overallScore != null ? overall.overallScore.toFixed(2) : "INCOMPLETE", styles: { fontSize: 20, fontStyle: "bold" } }],
    [{ content: overall.complianceStatus ?? "INCOMPLETE — finish all indicators", styles: { fontStyle: "bold", fontSize: 10 } }],
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "grid",
    styles: { font: F, fontSize: 10, halign: "center", cellPadding: 3 },
    body: overallBody,
  });
  // @ts-expect-error autotable plugin state
  y = (doc.lastAutoTable?.finalY ?? y) + 5;

  // Areas table
  const areaBody: RowInput[] = [
    ...overall.areas.map((a): RowInput => [
      { content: `${a.areaId}. ${a.title}` },
      { content: a.average != null ? a.average.toFixed(2) : "—", styles: { halign: "right" } },
      { content: `${(a.weight * 100).toFixed(0)}%`, styles: { halign: "right" } },
      { content: a.partialProduct != null ? a.partialProduct.toFixed(3) : "—", styles: { halign: "right" } },
    ]),
    [
      { content: "Overall", styles: { fontStyle: "bold" } },
      { content: "", styles: { fontStyle: "bold" } },
      { content: "100%", styles: { halign: "right", fontStyle: "bold" } },
      { content: overall.overallScore != null ? overall.overallScore.toFixed(3) : "—", styles: { halign: "right", fontStyle: "bold" } },
    ],
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "grid",
    headStyles: { fillColor: [240, 240, 240], textColor: [20, 20, 20], fontStyle: "bold", fontSize: 9 },
    styles: { font: F, fontSize: 9.5 },
    head: [["Area", "Average", "Weight", "Partial"]],
    body: areaBody,
  });
  // @ts-expect-error autotable plugin state
  y = (doc.lastAutoTable?.finalY ?? y) + 6;

  const needSpace = (h: number) => {
    if (y + h > doc.internal.pageSize.getHeight() - 36) { doc.addPage(); y = 16; }
  };
  const sectionTitle = (t: string) => {
    needSpace(12);
    doc.setFont(F, "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(t, M, y);
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.4);
    doc.line(M, y + 1.5, W - M, y + 1.5);
    y += 6.5;
  };
  const wrapped = (text: string, indent = 0): string[] =>
    doc.splitTextToSize(text, W - M * 2 - indent) as string[];

  // Significant findings
  sectionTitle("Significant Findings & Recommendations");
  doc.setFont(F, "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  if (ev.findings.length === 0) {
    doc.setTextColor(110, 110, 110);
    doc.text("None recorded.", M, y);
    y += 6;
  } else {
    ev.findings.forEach((f, i) => {
      const lines = [
        `#${i + 1}  Area ${f.areaId}:  ${f.finding}`,
        ...(f.recommendation ? [`Recommendation:  ${f.recommendation}`] : []),
      ].flatMap((t) => wrapped(t));
      needSpace(lines.length * 5 + 3);
      doc.setTextColor(30, 30, 30);
      doc.text(lines, M, y);
      y += lines.length * 5 + 3;
    });
  }

  // Indicator remarks
  const groups = evaluationAreas
    .map((area) => ({
      area,
      entries: area.indicators
        .filter((ind) => (ev.ratings[ind.id]?.remarks ?? "").trim() !== "")
        .map((ind) => ({ ind, rating: ev.ratings[ind.id]?.rating ?? null, remarks: (ev.ratings[ind.id]?.remarks ?? "").trim() })),
    }))
    .filter((g) => g.entries.length > 0);
  if (groups.length > 0) {
    y += 2;
    sectionTitle("Indicator Remarks");
    for (const { area, entries } of groups) {
      needSpace(10);
      doc.setFont(F, "bold");
      doc.setFontSize(10);
      doc.text(`Area ${area.id} — ${area.title}`, M, y);
      y += 5.5;
      doc.setFont(F, "normal");
      for (const { ind, rating, remarks } of entries) {
        const head = `${ind.id}${rating != null ? ` (${Number.isInteger(rating) ? rating : rating.toFixed(1)})` : ""}:  `;
        const lines = wrapped(head + remarks);
        needSpace(lines.length * 5 + 2);
        doc.setTextColor(30, 30, 30);
        doc.text(lines, M, y);
        y += lines.length * 5 + 2;
      }
      y += 2;
    }
  }

  // Signatories
  y += 2;
  sectionTitle("Evaluation Team (MEIT)");
  const sig = (label: string, name: string, title: string, x: number, sy: number) => {
    doc.setFont(F, "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text(label, x, sy);
    doc.setFont(F, "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(name.toUpperCase(), x, sy + 9);
    doc.setFont(F, "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text(title, x, sy + 13.5);
  };
  const colX = [M, W / 2 + 2];
  needSpace(40);
  const baseY = y;
  for (let i = 0; i < 4; i++) {
    const e = ev.evaluators[i];
    sig(`Evaluator ${i + 1}`, e?.name || "___________________________", e?.role || "MEIT Member — signature over printed name", colX[i % 2], baseY + Math.floor(i / 2) * 18);
  }
  y = baseY + 36 + 4;
  needSpace(20);
  sig("Recommending Approval", "___________________________", "RO QAD Chief — signature over printed name", colX[0], y);
  sig("Approved", "___________________________", "Regional Director — signature over printed name", colX[1], y);

  footer();
  doc.save(filenameFor(ev));
}
