import { Task } from "@repo/store";
import * as Haptics from "expo-haptics";
import { useState, useEffect, useCallback } from "react";
import { Pressable } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator
} from "react-native-draggable-flatlist";

import { useMoveTask } from "@/hooks/use-tasks";

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
  const moveTaskMutation = useMoveTask();
  const [moveSheetVisible, setMoveSheetVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const sortedTasks = [...tasks].sort(
      (a, b) => (a.orderInProject || 0) - (b.orderInProject || 0)
    );
    setData(sortedTasks);
  }, [tasks]);

  const handleDragEnd = useCallback(
    ({ data: newData, from, to }: { data: Task[]; from: number; to: number }) => {
      if (from === to) {
        return;
      }

      setData(newData);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const movedTask = newData[to];
      let newOrder = 0;

      if (to === 0) {
        const nextTask = newData[1];
        newOrder = nextTask ? (nextTask.orderInProject || 0) / 2 : 1000;
      } else if (to === newData.length - 1) {
        const prevTask = newData[to - 1];
        newOrder = (prevTask.orderInProject || 0) + 1000;
      } else {
        const prevTask = newData[to - 1];
        const nextTask = newData[to + 1];
        newOrder = ((prevTask.orderInProject || 0) + (nextTask.orderInProject || 0)) / 2;
      }

      const updatedTask = { ...movedTask, orderInProject: newOrder };
      const optimisticData = [...newData];
      optimisticData[to] = updatedTask;
      setData(optimisticData);

      moveTaskMutation.mutate({
        taskId: movedTask._id,
        projectId,
        orderInProject: newOrder
      });
    },
    [projectId, moveTaskMutation]
  );

  const handleMoveToProject = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setMoveSheetVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Task>) => {
      return (
        <ScaleDecorator>
          <Pressable onLongPress={drag} disabled={isActive} style={{ opacity: isActive ? 0.8 : 1 }}>
            <TaskCard
              task={item}
              onMoveToProject={() => {
                handleMoveToProject(item._id);
              }}
            />
          </Pressable>
        </ScaleDecorator>
      );
    },
    [handleMoveToProject]
  );

  return (
    <>
      <DraggableFlatList
        data={data}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        containerStyle={{ flex: 1 }}
      />
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
