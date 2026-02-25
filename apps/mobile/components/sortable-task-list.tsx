import { Task } from "@repo/store";
import { useState, useEffect, useCallback } from "react";

import { View } from "@/lib/tw";

import { MoveTaskSheet } from "./move-task-sheet";
import { TaskCard } from "./task-card";

interface SortableTaskListProps {
  tasks: Task[];
  projectId: string;
  boardId: string;
  onTaskPress?: (taskId: string) => void;
}

export function SortableTaskList({
  tasks,
  projectId,
  boardId,
  onTaskPress: _onTaskPress
}: SortableTaskListProps) {
  const [data, setData] = useState<Task[]>(tasks);
  const [moveSheetVisible, setMoveSheetVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const sortedTasks = [...tasks].sort(
      (a, b) => (a.orderInProject || 0) - (b.orderInProject || 0)
    );
    setData(sortedTasks);
  }, [tasks]);

  const handleMoveToProject = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setMoveSheetVisible(true);
  }, []);

  return (
    <>
      <View>
        {data.map((item) => (
          <TaskCard
            key={item._id}
            task={item}
            onMoveToProject={() => {
              handleMoveToProject(item._id);
            }}
          />
        ))}
      </View>
      {selectedTaskId && (
        <MoveTaskSheet
          visible={moveSheetVisible}
          taskId={selectedTaskId}
          currentProjectId={projectId}
          boardId={boardId}
          onClose={() => {
            setMoveSheetVisible(false);
            setSelectedTaskId(null);
          }}
        />
      )}
    </>
  );
}
