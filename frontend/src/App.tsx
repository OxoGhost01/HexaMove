// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Lobby } from './components/Lobby';
import { RoomView } from './components/RoomView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<RoomView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;