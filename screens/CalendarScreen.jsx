import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { format } from "date-fns";
import Icon from "react-native-vector-icons/Ionicons";
import { useMyPlants } from "../hooks/myPlants";
import { useAuth } from "../hooks/useAuth";

const { width } = Dimensions.get("window");
const DAY_SIZE = (width - 32 - 6 * 4) / 7;
const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Whether `year/month/day` falls on the recurring care schedule anchored
 * at `anchorIso` (the backend's next-due date) repeating every
 * `frequencyDays`. Projecting the interval forwards and backwards means
 * any month — past or future — shows the correct recurring pattern,
 * instead of only ever lighting up the single "next due" date.
 *
 * Ported from DEPI-Front's CalendarModal so the mobile and web apps
 * agree on what counts as a care day.
 */
function matchesSchedule(anchorIso, frequencyDays, year, month, day) {
  if (!anchorIso || !frequencyDays || frequencyDays <= 0) return false;

  const anchor = new Date(anchorIso);
  const anchorMidnight = Date.UTC(
    anchor.getFullYear(),
    anchor.getMonth(),
    anchor.getDate(),
  );
  const targetMidnight = Date.UTC(year, month, day);

  const diffDays = Math.round((targetMidnight - anchorMidnight) / DAY_MS);
  const remainder =
    ((diffDays % frequencyDays) + frequencyDays) % frequencyDays;
  return remainder === 0;
}

const CalendarScreen = () => {
  const { userToken } = useAuth();
  const { data: myPlants, isLoading } = useMyPlants();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  const plants = myPlants || [];
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthLabel = format(currentDate, "MMMM yyyy");

  const changeMonth = (amount) => {
    setCurrentDate(new Date(year, month + amount, 1));
  };

  // Projects each plant's real watering/fertilizing interval across
  // whatever month is currently showing — same logic as the web dashboard.
  const getTasks = (day, forYear = year, forMonth = month) => {
    const tasks = [];
    plants.forEach((myPlant) => {
      if (
        matchesSchedule(
          myPlant.nextWatering,
          myPlant.wateringFrequency,
          forYear,
          forMonth,
          day,
        )
      ) {
        tasks.push({ type: "water", plant: myPlant.plant?.commonName });
      }
      if (
        matchesSchedule(
          myPlant.nextFertilizing,
          myPlant.fertilizingFrequency,
          forYear,
          forMonth,
          day,
        )
      ) {
        tasks.push({ type: "fertilize", plant: myPlant.plant?.commonName });
      }
    });
    return tasks;
  };

  const selectedDayTasks = useMemo(
    () =>
      getTasks(
        selectedDay.getDate(),
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
      ),
    [selectedDay, plants],
  );

  const renderDayCell = (day) => {
    const tasks = getTasks(day);
    const isActive =
      selectedDay.getDate() === day &&
      selectedDay.getMonth() === month &&
      selectedDay.getFullYear() === year;
    const hasWater = tasks.some((t) => t.type === "water");
    const hasFertilize = tasks.some((t) => t.type === "fertilize");

    return (
      <TouchableOpacity
        key={day}
        style={[styles.dayCell, isActive && styles.dayCellActive]}
        onPress={() => setSelectedDay(new Date(year, month, day))}
      >
        <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
          {day}
        </Text>
        <View style={styles.dotsRow}>
          {hasWater && <View style={[styles.dot, styles.waterDot]} />}
          {hasFertilize && <View style={[styles.dot, styles.fertilizeDot]} />}
        </View>
      </TouchableOpacity>
    );
  };

  if (!userToken) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="calendar-outline" size={64} color="#C8E6C9" />
        <Text style={styles.emptyTitle}>Log in to see your care calendar</Text>
        <Text style={styles.emptySubtitle}>
          Your watering and fertilizing schedule shows up here once you're
          signed in.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="leaf-outline" size={48} color="#A5D6A7" />
        <Text style={styles.emptySubtitle}>Loading your schedule…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Care Calendar</Text>

      {/* Month control */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={styles.navButton}
        >
          <Icon name="chevron-back" size={22} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={styles.navButton}
        >
          <Icon name="chevron-forward" size={22} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {/* Weekday header */}
      <View style={styles.weekRow}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <Text key={d} style={styles.weekDayText}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <View key={`pad-${i}`} style={styles.dayCellEmpty} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) =>
          renderDayCell(i + 1),
        )}
      </View>

      {/* Selected day tasks */}
      <View style={styles.tasksCard}>
        <Text style={styles.tasksTitle}>
          Tasks for {format(selectedDay, "MMMM d, yyyy")}
        </Text>

        {selectedDayTasks.length === 0 ? (
          <View style={styles.noTasks}>
            <Text style={styles.noTasksText}>No care scheduled</Text>
          </View>
        ) : (
          selectedDayTasks.map((task, index) => (
            <View key={index} style={styles.taskRow}>
              <Icon
                name={task.type === "water" ? "water" : "nutrition"}
                size={18}
                color={task.type === "water" ? "#2196F3" : "#FF9800"}
              />
              <Text style={styles.taskText}>
                {task.type === "water" ? "Water " : "Fertilize "}
                {task.plant}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  navButton: {
    padding: 6,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E7D32",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  weekDayText: {
    width: DAY_SIZE,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
    color: "#777",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 8,
    marginBottom: 16,
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 2,
  },
  dayCellEmpty: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    marginVertical: 2,
  },
  dayCellActive: {
    backgroundColor: "#2E7D32",
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  dayTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  dotsRow: {
    flexDirection: "row",
    marginTop: 2,
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  waterDot: {
    backgroundColor: "#2196F3",
  },
  fertilizeDot: {
    backgroundColor: "#FF9800",
  },
  tasksCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEE",
  },
  taskText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
  },
  noTasks: {
    paddingVertical: 16,
    alignItems: "center",
  },
  noTasksText: {
    fontSize: 14,
    color: "#999",
  },
});

export default CalendarScreen;
