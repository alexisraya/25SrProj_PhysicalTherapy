import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const ProgramManagement = ({ 
  currentProgram,
  availableExercises,
  onUpdateProgram,
  isLoading 
}) => {
  const [exercises, setExercises] = useState(currentProgram?.exercises || []);
  const [estimatedTime, setEstimatedTime] = useState(currentProgram?.estimatedTime || 30);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseValues, setExerciseValues] = useState({
    sets: 3,
    reps: 10,
    steps: 10,
    seconds: 10,
    weight: 0
  });

  useEffect(() => {
    if (currentProgram) {
      setExercises(currentProgram.exercises);
      setEstimatedTime(currentProgram.estimatedTime);
    }
  }, [currentProgram]);

  const handleAddExercise = () => {
    if (!selectedExercise) return;

    const newExercise = {
      exerciseId: selectedExercise.exerciseId,
      exerciseName: selectedExercise.exerciseName,
      exerciseType: selectedExercise.exerciseType,
      equipment: selectedExercise.equipment,
      order: exercises.length,
      completed: false,
      skipped: false,
      ...exerciseValues
    };

    const updatedExercises = [...exercises, newExercise];
    setExercises(updatedExercises);
    onUpdateProgram({
      exercises: updatedExercises,
      estimatedTime
    });
  };

  const handleRemoveExercise = (index) => {
    const updatedExercises = exercises.filter((_, i) => i !== index)
      .map((ex, i) => ({ ...ex, order: i }));
    setExercises(updatedExercises);
    onUpdateProgram({
      exercises: updatedExercises,
      estimatedTime
    });
  };

  const handleMoveExercise = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const swapped = [...exercises];
      [swapped[index - 1], swapped[index]] = [swapped[index], swapped[index - 1]];
      const updated = swapped.map((ex, i) => ({ ...ex, order: i }));
      setExercises(updated);
      onUpdateProgram({
        exercises: updated,
        estimatedTime
      });
    } else if (direction === 'down' && index < exercises.length - 1) {
      const swapped = [...exercises];
      [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
      const updated = swapped.map((ex, i) => ({ ...ex, order: i }));
      setExercises(updated);
      onUpdateProgram({
        exercises: updated,
        estimatedTime
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Exercise Program</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={estimatedTime}
              onChange={(e) => {
                const newTime = parseInt(e.target.value);
                setEstimatedTime(newTime);
                onUpdateProgram({
                  exercises,
                  estimatedTime: newTime
                });
              }}
              min="1"
              max="120"
              className="w-32"
            />
            <span>minutes</span>
          </div>

          <div className="space-y-2">
            <Select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(availableExercises.find(ex => ex.exerciseId === e.target.value))}
            >
              <option value="">Select an exercise</option>
              {availableExercises.map(exercise => (
                <option key={exercise.exerciseId} value={exercise.exerciseId}>
                  {exercise.exerciseName}
                </option>
              ))}
            </Select>

            {selectedExercise && (
              <div className="grid grid-cols-3 gap-2">
                {selectedExercise.exerciseType === 'distance' && (
                  <>
                    <Input
                      type="number"
                      placeholder="Sets"
                      value={exerciseValues.sets}
                      onChange={(e) => setExerciseValues({
                        ...exerciseValues,
                        sets: parseInt(e.target.value)
                      })}
                      min="1"
                    />
                    <Input
                      type="number"
                      placeholder="Steps"
                      value={exerciseValues.steps}
                      onChange={(e) => setExerciseValues({
                        ...exerciseValues,
                        steps: parseInt(e.target.value)
                      })}
                      min="1"
                    />
                  </>
                )}
                
                {selectedExercise.exerciseType === 'weight' && (
                  <>
                    <Input
                      type="number"
                      placeholder="Sets"
                      value={exerciseValues.sets}
                      onChange={(e) => setExerciseValues({
                        ...exerciseValues,
                        sets: parseInt(e.target.value)
                      })}
                      min="1"
                    />
                    <Input
                      type="number"
                      placeholder="Reps"
                      value={exerciseValues.reps}
                      onChange={(e) => setExerciseValues({
                        ...exerciseValues,
                        reps: parseInt(e.target.value)
                      })}
                      min="1"
                    />
                    <Input
                      type="number"
                      placeholder="Weight (lbs)"
                      value={exerciseValues.weight}
                      onChange={(e) => setExerciseValues({
                        ...exerciseValues,
                        weight: parseInt(e.target.value)
                      })}
                      min="0"
                      step="5"
                    />
                  </>
                )}

                {selectedExercise.exerciseType === 'time' && (
                  <>
                    <Input
                      type="number"
                      placeholder="Times to perform"
                      value={exerciseValues.reps}
                      onChange={(e) => setExerciseValues({
                        ...exerciseValues,
                        reps: parseInt(e.target.value)
                      })}
                      min="1"
                    />
                    <Input
                      type="number"
                      placeholder="Seconds to hold"
                      value={exerciseValues.seconds}
                      onChange={(e) => setExerciseValues({
                        ...exerciseValues,
                        seconds: parseInt(e.target.value)
                      })}
                      min="1"
                    />
                  </>
                )}
              </div>
            )}

            <Button 
              onClick={handleAddExercise}
              disabled={!selectedExercise || isLoading}
              className="w-full"
            >
              Add Exercise
            </Button>
          </div>

          {exercises.length > 0 && (
            <div className="space-y-2">
              {exercises.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{exercise.exerciseName}</div>
                    <div className="text-sm text-gray-600">
                      {exercise.exerciseType === 'distance' && 
                        `${exercise.sets} sets of ${exercise.steps} steps`}
                      {exercise.exerciseType === 'weight' && 
                        `${exercise.sets} sets of ${exercise.reps} reps at ${exercise.weight}lbs`}
                      {exercise.exerciseType === 'time' && 
                        `${exercise.reps} times, ${exercise.seconds} seconds each`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMoveExercise(index, 'up')}
                      disabled={index === 0 || isLoading}
                      variant="outline"
                      size="sm"
                    >
                      ↑
                    </Button>
                    <Button
                      onClick={() => handleMoveExercise(index, 'down')}
                      disabled={index === exercises.length - 1 || isLoading}
                      variant="outline"
                      size="sm"
                    >
                      ↓
                    </Button>
                    <Button
                      onClick={() => handleRemoveExercise(index)}
                      disabled={isLoading}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramManagement;