import React from "react";
import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  logo: { width: 160 },
  h1: { fontSize: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 12, marginTop: 12, marginBottom: 6, fontWeight: 700 },
  bullet: { marginLeft: 12, marginBottom: 3 },
  priceBox: { marginTop: 12, borderTop: 1, paddingTop: 8, fontSize: 12 },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 10, color: "#555" },
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

        <Text style={styles.h1}>YMCA of Greater Nashua</Text>
        <Text>{client.address}</Text>
        <Text>{client.contact}</Text>

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

        <View style={styles.priceBox}>
          <Text>Total cost ————————————————  ${total}</Text>
        </View>

        <Text style={styles.sectionTitle}>Exclusions</Text>
        <Text style={styles.bullet}>• Permit cost not included; billed at cost + $125 if required.</Text>
        <Text style={styles.bullet}>• Non-code-compliant existing wiring to be corrected T&M at $105/hr/technician.</Text>
        <Text style={styles.bullet}>• Patching/painting not included.</Text>
        <Text style={styles.bullet}>• Product delays/backorders not the responsibility of contractor.</Text>
        <Text style={styles.bullet}>• Additional repairs from deficiencies billed separately.</Text>

        <Text style={styles.sectionTitle}>Terms</Text>
        <Text style={styles.bullet}>• Price valid 30 calendar days. Total cost due upon completion.</Text>
        <Text style={styles.bullet}>• Credit card payments incur 5% service charge.</Text>

        <View style={styles.footer}>
          <Text>Custom Electric • 407 Daniel Webster Hwy., Merrimack, NH 03054 • (603) 424-7557 • www.CustomElectricNH.com</Text>
        </View>
      </Page>
    </Document>
  );
}


