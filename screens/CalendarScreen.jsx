import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import * as Calendar from "expo-calendar";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import Icon from "react-native-vector-icons/Ionicons";
import { useMyPlants } from "../hooks/myPlants";
import { useAuth } from "../hooks/useAuth";

const { width } = Dimensions.get("window");
const DAY_SIZE = (width - 32) / 7;

const CalendarScreen = () => {
  const { userToken } = useAuth();
  const { data: myPlants } = useMyPlants();
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarReady, setCalendarReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Initialize calendar and request permissions
  useEffect(() => {
    const setupCalendar = async () => {
      try {
        console.log("Requesting calendar permissions...");
        const { status } = await Calendar.requestCalendarPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please enable calendar access to view plant care events",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Open Settings",
                onPress: () => Calendar.openCalendarSettingsAsync(),
              },
            ]
          );
          return;
        }

        console.log("Calendar permissions granted");
        setCalendarReady(true);
      } catch (error) {
        console.error("Calendar setup error:", error);
        Alert.alert("Error", "Failed to initialize calendar features");
      }
    };

    setupCalendar();
  }, []);

  // Load events from device calendar
  useEffect(() => {
    if (!calendarReady) return;

    const loadEvents = async () => {
      try {
        console.log("Loading calendar events...");
        const calendars = await Calendar.getCalendarsAsync();
        const defaultCalendar =
          calendars.find((c) => c.isPrimary) || calendars[0];

        if (!defaultCalendar) {
          console.warn("No default calendar found");
          return;
        }

        const now = new Date();
        const oneYearLater = new Date();
        oneYearLater.setFullYear(now.getFullYear() + 1);

        const calendarEvents = await Calendar.getEventsAsync(
          [defaultCalendar.id],
          now,
          oneYearLater
        );

        console.log(`Loaded ${calendarEvents.length} events`);
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Error loading calendar events:", error);
        Alert.alert("Error", "Failed to load calendar events");
      }
    };

    loadEvents();
  }, [calendarReady]);

  // Get all plant tasks from myPlants data
  const getPlantTasks = () => {
    if (!myPlants) return [];

    const tasks = [];

    myPlants.forEach((plantItem) => {
      const plant = plantItem.plant || plantItem;

      if (plantItem.nextWatering) {
        tasks.push({
          id: `${plant._id}-watering-${plantItem.nextWatering}`,
          plantId: plant._id,
          type: "watering",
          date: new Date(plantItem.nextWatering),
          plantName: plant.commonName,
          scientificName: plant.scientificName,
          image: plant.image,
        });
      }

      if (plantItem.nextFertilizing) {
        tasks.push({
          id: `${plant._id}-fertilizing-${plantItem.nextFertilizing}`,
          plantId: plant._id,
          type: "fertilizing",
          date: new Date(plantItem.nextFertilizing),
          plantName: plant.commonName,
          scientificName: plant.scientificName,
          image: plant.image,
        });
      }
    });

    return tasks;
  };

  const tasks = getPlantTasks();

  // Generate days for the current month view
  const generateMonthDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Add padding days from previous month
    const startDay = start.getDay();
    for (let i = 0; i < startDay; i++) {
      days.unshift(null);
    }

    return days;
  };

  const monthDays = generateMonthDays();

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter((task) => isSameDay(task.date, date));
  };

  // Check if a date has tasks
  const hasTasks = (date) => {
    if (!date) return false;
    return tasks.some((task) => isSameDay(task.date, date));
  };

  // Get the type of tasks for a date (for dot colors)
  const getTaskTypesForDate = (date) => {
    if (!date) return [];
    const dateTasks = getTasksForDate(date);
    return [...new Set(dateTasks.map((task) => task.type))];
  };

  // Check if task is already in calendar
  const isTaskInCalendar = (task) => {
    return events.some((event) => {
      // Check if event.startDate exists and is a valid Date object
      if (!event.startDate || !(event.startDate instanceof Date)) return false;

      const isSameDay =
        event.startDate.getDate() === task.date.getDate() &&
        event.startDate.getMonth() === task.date.getMonth() &&
        event.startDate.getFullYear() === task.date.getFullYear();

      const isSamePlant = event.title.includes(task.plantName);
      const isSameType = event.title.includes(
        task.type === "watering" ? "Water" : "Fertilize"
      );

      return isSameDay && isSamePlant && isSameType;
    });
  };

  // Add task to device calendar
  const addTaskToCalendar = async (task) => {
    try {
      const calendars = await Calendar.getCalendarsAsync();
      const defaultCalendar =
        calendars.find((c) => c.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert("Error", "No calendar found");
        return;
      }

      const plant =
        myPlants.find((p) => (p.plant?._id || p._id) === task.plantId)?.plant ||
        myPlants.find((p) => p._id === task.plantId);

      if (!plant) {
        Alert.alert("Error", "Plant not found");
        return;
      }

      const startDate = new Date(task.date);
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

      const eventDetails = {
        title: `${task.type === "watering" ? "💧 Water" : "🌿 Fertilize"} ${
          plant.commonName
        }`,
        startDate: startDate,
        endDate: endDate,
        timeZone: "UTC",
        alarms: [{ relativeOffset: -60 }],
        notes: `Plant care reminder for ${plant.commonName} (${plant.scientificName})`,
      };

      if (Platform.OS === "ios") {
        eventDetails.calendarId = defaultCalendar.id;
      }

      await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      Alert.alert("Success", "Event added to your calendar");

      // Refresh events after adding
      const updatedEvents = await Calendar.getEventsAsync(
        [defaultCalendar.id],
        new Date(),
        new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Error adding to calendar:", error);
      Alert.alert("Error", "Failed to add event to calendar");
    }
  };

  // Render individual task item
  const renderTaskItem = ({ item }) => {
    const isInCalendar = isTaskInCalendar(item);

    return (
      <View style={styles.taskItem}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskType}>
            {item.type === "watering" ? "💧 Water" : "🌿 Fertilize"}{" "}
            {item.plantName}
          </Text>
          <Text style={styles.taskScientific}>{item.scientificName}</Text>
          <Text style={styles.taskTime}>{format(item.date, "h:mm a")}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.calendarButton,
            isInCalendar && styles.calendarButtonAdded,
          ]}
          onPress={() => addTaskToCalendar(item)}
          disabled={isInCalendar}
        >
          <Icon
            name={isInCalendar ? "checkmark-circle" : "calendar-outline"}
            size={24}
            color={isInCalendar ? "#4CAF50" : "#2196F3"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Render a day cell in the calendar grid
  const renderDayCell = (day, index) => {
    if (!day) {
      return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
    }

    const isSelected = isSameDay(day, selectedDate);
    const taskTypes = getTaskTypesForDate(day);
    const hasWatering = taskTypes.includes("watering");
    const hasFertilizing = taskTypes.includes("fertilizing");

    return (
      <TouchableOpacity
        key={day.toString()}
        style={[styles.dayCell, isSelected && styles.dayCellSelected]}
        onPress={() => setSelectedDate(day)}
      >
        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
          {day.getDate()}
        </Text>

        {/* Dots for task types */}
        <View style={styles.dotsContainer}>
          {hasWatering && <View style={[styles.dot, styles.wateringDot]} />}
          {hasFertilizing && (
            <View style={[styles.dot, styles.fertilizingDot]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Navigate to previous/next month
  const navigateMonth = (months) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + months);
    setCurrentMonth(newDate);
  };

  // Filter tasks for the selected date
  const filteredTasks = getTasksForDate(selectedDate);

  return (
    <View style={styles.container}>
      {/* Month header with navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <Icon name="chevron-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentMonth, "MMMM yyyy")}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <Icon name="chevron-forward" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {/* Day names header */}
      <View style={styles.daysHeader}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Text key={day} style={styles.dayHeader}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {monthDays.map((day, index) => renderDayCell(day, index))}
      </View>

      {/* Tasks for selected date */}
      <View style={styles.tasksContainer}>
        <Text style={styles.tasksTitle}>
          Tasks for {format(selectedDate, "MMMM d, yyyy")}
        </Text>

        {filteredTasks.length > 0 ? (
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.tasksList}
          />
        ) : (
          <View style={styles.noTasks}>
            <Text style={styles.noTasksText}>
              No tasks scheduled for this day
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  daysHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayHeader: {
    width: DAY_SIZE,
    textAlign: "center",
    fontWeight: "bold",
    color: "#555",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: DAY_SIZE / 2,
    marginVertical: 2,
  },
  dayCellEmpty: {
    width: DAY_SIZE,
    height: DAY_SIZE,
  },
  dayCellSelected: {
    backgroundColor: "#2E7D32",
  },
  dayText: {
    fontSize: 16,
    color: "#333",
  },
  dayTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  wateringDot: {
    backgroundColor: "#2196F3",
  },
  fertilizingDot: {
    backgroundColor: "#FF9800",
  },
  tasksContainer: {
    flex: 1,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  tasksList: {
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  taskScientific: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 12,
    color: "#888",
  },
  calendarButton: {
    padding: 8,
  },
  calendarButtonAdded: {
    opacity: 0.7,
  },
  noTasks: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTasksText: {
    fontSize: 16,
    color: "#888",
  },
});

export default CalendarScreen;
