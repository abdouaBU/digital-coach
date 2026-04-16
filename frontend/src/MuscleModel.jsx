import {useState} from 'react';

export default function MuscleModel() {
  const [view, setView] = useState('front');
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style = {{flex: 1, borderRight: '1px solid black'}}>
          <h2>Muscle Model</h2>
        </div>

        <div style={{flex: 1, padding: '20px'}}>
          <h2>Exercises</h2>
        </div>
      </div>
  )
} 