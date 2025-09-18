import React from "react";
import { Document, Page, StyleSheet, Text, View, Image, Font } from "@react-pdf/renderer";

// Optional Georgia font registration (server-side). Provide URL in PDF_GEORGIA_URL or NEXT_PUBLIC_PDF_GEORGIA_URL
const georgiaUrl = process.env.PDF_GEORGIA_URL || process.env.NEXT_PUBLIC_PDF_GEORGIA_URL;
if (georgiaUrl) {
  try {
    Font.register({ family: "Georgia", src: georgiaUrl });
  } catch {
    // ignore font registration errors; fallback will be used
  }
}

const BASE_FONT = georgiaUrl ? "Georgia" : "Times-Roman";
const BOLD_FONT = georgiaUrl ? "Georgia" : "Times-Bold";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: BASE_FONT },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  logo: { width: 160, marginLeft: -8 },
  companyName: { fontSize: 14, marginBottom: 2 },
  smallGap: { marginTop: 6 },
  refLine: { marginTop: 16, marginBottom: 12, fontSize: 11 },
  greeting: { marginBottom: 8 },
  intro: { marginBottom: 10 },
  sectionTitle: { fontSize: 11, marginTop: 12, marginBottom: 6, marginLeft: 12, fontFamily: BOLD_FONT },
  bullet: { marginLeft: 24, marginBottom: 3 },
  costRow: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 10 },
  costLabel: { fontSize: 11 },
  dashedLine: { flexGrow: 1, borderBottom: 1, borderStyle: "dashed", marginHorizontal: 8 },
  costAmount: { fontSize: 11 },
  thankYou: { marginTop: 12, marginBottom: 6 },
  termsTitle: { fontSize: 11, marginTop: 10, marginBottom: 6, fontWeight: 700 },
  footerSignatureBlock: { marginTop: 18, alignItems: "flex-start" },
  sigLinesColumn: { marginTop: 22, gap: 18 },
  sigLineWide: { width: 360, borderBottom: 1, borderColor: "#000" },
  sigLineNarrow: { width: 180, borderBottom: 1, borderColor: "#000" },
  sigCaption: { marginTop: 4 },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 9, color: "#555", textAlign: "center" },
});

type ProposalDocProps = {
  intake: { company: string; siteAddress: string; contactName: string; email: string; phone?: string | null };
  proposal: { proposalNo: string; total?: number | null };
  logoUrl: string;
};

export default function ProposalPDF({ intake, proposal, logoUrl }: ProposalDocProps) {
  const client = {
    name: intake.company,
    address: intake.siteAddress,
    contact: `${intake.contactName} • ${intake.email}${intake.phone ? ` • ${intake.phone}` : ""}`,
  };
  const total = proposal.total?.toFixed(2) ?? "0.00";
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={logoUrl} />
          <View>
            <Text>Proposal #{proposal.proposalNo}</Text>
            <Text>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <Text style={styles.companyName}>{client.name}</Text>
        <Text>{client.address}</Text>
        <Text style={styles.smallGap}>{client.contact}</Text>

        <Text style={styles.refLine}>Reference: {client.name} NFPA 70B Compliance Check Preventative Maintenance Proposal</Text>

        <Text style={styles.greeting}>Dear {intake.contactName},</Text>
        <Text style={styles.intro}>
          We are pleased to provide a proposal on the electrical work required. We based our proposal on
          the latest version of the National Electric Code and local inspection authority. We include the
          following items in our proposal.
        </Text>

        <Text style={styles.sectionTitle}>Inspection: Thermal Imaging Scope</Text>
        <Text style={styles.bullet}>• NFPA 70B baseline inspection</Text>
        <Text style={styles.bullet}>• Visual inspection of accessible electrical panels and transformers</Text>
        <Text style={styles.bullet}>• Single-session infrared thermography</Text>
        <Text style={styles.bullet}>• Identification of deficiencies and recommended corrective actions</Text>
        <Text style={styles.bullet}>• One-time summary report</Text>
        <Text style={styles.bullet}>• Digital photos of identified issues</Text>
        <Text style={styles.bullet}>• “Compliance Gap Letter” outlining required next steps</Text>

        <Text style={styles.sectionTitle}>Mitigation: Re-Torque, Panel Vacuuming & Dust Removal Scope</Text>
        <Text style={styles.bullet}>• Torque verification of panel connections</Text>
        <Text style={styles.bullet}>• Panel vacuuming and dust removal</Text>
        <Text style={styles.bullet}>• Treating electrical connections and contact points with a suitable de-oxidizing agent.</Text>
        <Text style={styles.bullet}>• Verifying and securing all electrical connection points.</Text>
        <Text style={styles.bullet}>• Examining and cleaning insulators, mounting hardware, and insulation materials.</Text>
        <Text style={styles.bullet}>• Assessing and testing protective relays, trip mechanisms, transformers, and visual cable insulation integrity.</Text>
        <Text style={styles.bullet}>• Documenting observed conditions and the corrective measures implemented.</Text>

        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Total cost</Text>
          <View style={styles.dashedLine} />
          <Text style={styles.costAmount}>${total}</Text>
        </View>

        <Text style={styles.sectionTitle}>Exclusions</Text>
        <Text style={styles.bullet}>• Permit cost not included; billed at cost + $125 if required.</Text>
        <Text style={styles.bullet}>• Non-code-compliant existing wiring to be corrected T&M at $105/hr/technician.</Text>
        <Text style={styles.bullet}>• Patching/painting not included.</Text>
        <Text style={styles.bullet}>• Product delays/backorders not the responsibility of contractor.</Text>
        <Text style={styles.bullet}>• Additional repairs from deficiencies billed separately.</Text>

        <Text style={styles.thankYou}>
          Thank you for the opportunity to be of service. If you should have any questions or require additional
          information, please do not hesitate to contact us. This price is valid for 30 calendar days.
        </Text>

        <Text style={styles.termsTitle}>Terms</Text>
        <Text style={styles.bullet}>• Total cost due upon completion.</Text>
        <Text style={styles.bullet}>• Any payments made by credit will incur a 5% service charge.</Text>

        <View style={styles.footerSignatureBlock}>
          <Text>Sincerely,</Text>
          <Text style={{ marginTop: 6 }}>Chris Foley</Text>

          <View style={styles.sigLinesColumn}>
            <View>
              <View style={styles.sigLineWide} />
              <Text style={styles.sigCaption}>Authorization to Proceed</Text>
            </View>
            <View>
              <View style={styles.sigLineNarrow} />
              <Text style={styles.sigCaption}>Date</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Custom Electric • 407 Daniel Webster Hwy., Merrimack, NH 03054 • (603) 424-7557 • www.CustomElectricNH.com</Text>
        </View>
      </Page>
    </Document>
  );
}


