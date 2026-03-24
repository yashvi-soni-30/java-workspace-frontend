export const activeUsers = [
  { id: "1", name: "Alice Chen", avatar: "AC", color: "#22c55e" },
  { id: "2", name: "Bob Kumar", avatar: "BK", color: "#3b82f6" },
  { id: "3", name: "Carol Zhang", avatar: "CZ", color: "#f59e0b" },
];

export const versionHistory = [
  { id: "v5", version: 5, author: "Alice Chen", timestamp: "2026-03-07T14:30:00Z", message: "Optimize sorting algorithm" },
  { id: "v4", version: 4, author: "Bob Kumar", timestamp: "2026-03-07T13:15:00Z", message: "Add binary search" },
  { id: "v3", version: 3, author: "Alice Chen", timestamp: "2026-03-07T11:00:00Z", message: "Refactor main method" },
  { id: "v2", version: 2, author: "Carol Zhang", timestamp: "2026-03-06T16:45:00Z", message: "Add exception handling" },
  { id: "v1", version: 1, author: "Alice Chen", timestamp: "2026-03-06T10:00:00Z", message: "Initial commit" },
];

export const analysisResults = {
  cyclomaticComplexity: 12,
  maxComplexity: 30,
  timeComplexity: "O(n log n)",
  performanceScore: 78,
  riskLevel: "Medium" as const,
  linesOfCode: 142,
  methodCount: 8,
};

export const issuesList = [
  {
    id: "1",
    title: "Inefficient String Concatenation",
    line: 42,
    severity: "high" as const,
    explanation: "Using '+' operator for string concatenation inside a loop creates multiple String objects.",
    suggestion: "Replace with StringBuilder for O(n) instead of O(n²) performance.",
    impact: "High memory usage and slow execution in loops.",
  },
  {
    id: "2",
    title: "Unchecked Null Reference",
    line: 67,
    severity: "medium" as const,
    explanation: "Variable 'result' may be null when accessed at line 67.",
    suggestion: "Add null check or use Optional<T> pattern.",
    impact: "Potential NullPointerException at runtime.",
  },
  {
    id: "3",
    title: "Magic Number Usage",
    line: 23,
    severity: "low" as const,
    explanation: "Hardcoded value '100' used without context.",
    suggestion: "Extract to a named constant for readability.",
    impact: "Reduced code maintainability.",
  },
  {
    id: "4",
    title: "Missing Exception Handling",
    line: 89,
    severity: "high" as const,
    explanation: "File I/O operation without try-catch block.",
    suggestion: "Wrap in try-with-resources for safe resource management.",
    impact: "Resource leak and unhandled IOException.",
  },
  {
    id: "5",
    title: "Redundant Object Creation",
    line: 15,
    severity: "medium" as const,
    explanation: "New Integer objects created unnecessarily.",
    suggestion: "Use Integer.valueOf() for caching benefits.",
    impact: "Unnecessary heap allocation.",
  },
];

export const learningRecommendations = [
  {
    id: "1",
    title: "Understanding Time Complexity",
    category: "Algorithms",
    content: "Your sorting implementation uses O(n²). Consider using merge sort or quicksort for O(n log n) average case. Java's Arrays.sort() uses dual-pivot quicksort for primitives.",
    difficulty: "Intermediate",
  },
  {
    id: "2",
    title: "Java StringBuilder Best Practices",
    category: "Performance",
    content: "When concatenating strings in loops, StringBuilder is significantly faster. Initialize with expected capacity to avoid array resizing: new StringBuilder(expectedSize).",
    difficulty: "Beginner",
  },
  {
    id: "3",
    title: "Design Pattern: Strategy Pattern",
    category: "Design Patterns",
    content: "Your code has multiple conditional branches for sorting. Consider the Strategy pattern to encapsulate algorithms and make them interchangeable.",
    difficulty: "Advanced",
  },
  {
    id: "4",
    title: "Effective Exception Handling",
    category: "Best Practices",
    content: "Use specific exception types instead of catching generic Exception. Implement try-with-resources for AutoCloseable objects. Log exceptions with context.",
    difficulty: "Intermediate",
  },
];

export const defaultJavaCode = `import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

/**
 * Collaborative Java Workspace - Sample Code
 * This code demonstrates common patterns for analysis.
 */
public class DataProcessor {

    private static final int MAX_RETRIES = 3;
    private List<String> processedData;

    public DataProcessor() {
        this.processedData = new ArrayList<>();
    }

    public void processItems(String[] items) {
        // TODO: Consider using StringBuilder for better performance
        String result = "";
        for (int i = 0; i < items.length; i++) {
            result = result + items[i] + ", ";
        }
        System.out.println("Processed: " + result);
    }

    public int[] sortData(int[] data) {
        // Bubble sort - O(n²) complexity
        int n = data.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (data[j] > data[j + 1]) {
                    int temp = data[j];
                    data[j] = data[j + 1];
                    data[j + 1] = temp;
                }
            }
        }
        return data;
    }

    public String findElement(List<String> list, String target) {
        // Linear search - could use binary search if sorted
        for (String item : list) {
            if (item.equals(target)) {
                return item;
            }
        }
        return null; // Consider using Optional<String>
    }

    public static void main(String[] args) {
        DataProcessor processor = new DataProcessor();
        
        String[] items = {"Alpha", "Beta", "Gamma", "Delta"};
        processor.processItems(items);
        
        int[] numbers = {64, 34, 25, 12, 22, 11, 90};
        int[] sorted = processor.sortData(numbers);
        System.out.println("Sorted: " + Arrays.toString(sorted));
        
        List<String> searchList = Arrays.asList("Java", "Python", "TypeScript");
        String found = processor.findElement(searchList, "Java");
        System.out.println("Found: " + found);
    }
}`;

export const dashboardStats = {
  totalWorkspaces: 12,
  totalAnalyses: 47,
  performanceImprovements: 23,
  activeCollaborations: 5,
};

export const recentWorkspaces = [
  { id: "room-abc123", name: "Data Processor Refactor", lastModified: "2026-03-07T14:30:00Z", collaborators: 3 },
  { id: "room-def456", name: "Algorithm Optimization", lastModified: "2026-03-07T10:00:00Z", collaborators: 2 },
  { id: "room-ghi789", name: "Spring Boot Service", lastModified: "2026-03-06T16:00:00Z", collaborators: 1 },
  { id: "room-jkl012", name: "Unit Test Suite", lastModified: "2026-03-06T09:30:00Z", collaborators: 4 },
];
