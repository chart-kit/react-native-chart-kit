import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  BarChart,
  ChartKitProvider,
  LineChart,
  ProgressRing
} from "react-native-chart-kit/v2";

const revenue = [
  { month: "Jan", actual: 18, target: 20 },
  { month: "Feb", actual: 34, target: 30 },
  { month: "Mar", actual: 29, target: 36 },
  { month: "Apr", actual: 52, target: 44 },
  { month: "May", actual: 46, target: 50 },
  { month: "Jun", actual: 68, target: 58 }
];

const acquisition = [
  { channel: "Organic", signups: 42 },
  { channel: "Paid", signups: 31 },
  { channel: "Referral", signups: 18 },
  { channel: "Partner", signups: 14 }
];

const chartWidth = 340;

export default function App() {
  return (
    <View style={styles.root}>
      <ChartKitProvider mode="system" preset="analytics">
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.kicker}>React Native CLI</Text>
          <Text style={styles.title}>Chart Kit v2</Text>
          <Text style={styles.body}>
            Native CLI smoke app for validating the modern package without the
            Expo runtime.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue</Text>
            <LineChart
              data={revenue}
              xKey="month"
              series={[
                { yKey: "actual", label: "Actual" },
                { yKey: "target", label: "Target", strokeDasharray: [5, 5] }
              ]}
              curve="monotone"
              legend={{ position: "bottom", wrap: true }}
              width={chartWidth}
              height={250}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acquisition</Text>
            <BarChart
              data={acquisition}
              xKey="channel"
              yKey="signups"
              width={chartWidth}
              height={240}
              showValuesOnTopOfBars
            />
          </View>

          <View style={styles.progressSection}>
            <ProgressRing
              value={0.72}
              label="Activation"
              width={220}
              height={220}
              centerLabel={({ average }) => `${Math.round(average * 100)}%`}
            />
          </View>
        </ScrollView>
      </ChartKitProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 36
  },
  kicker: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  progressSection: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 18
  },
  root: {
    backgroundColor: "#f4f7fb",
    flex: 1
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 14
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    paddingHorizontal: 16
  },
  title: {
    color: "#0f172a",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0
  }
});
