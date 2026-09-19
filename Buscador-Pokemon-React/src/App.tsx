import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { PokemonProvider } from './context/PokemonContext';
import { RegistroUsuario } from './components/RegistroUsuario';
import { BuscadorPokemon } from './components/BuscadorPokemon';
import { InventarioPokemon } from './components/InventarioPokemon.tsx';

function App() {
  return (
    <PokemonProvider>
      <BrowserRouter>
        <header>
          <h1> Registro de Entrenadores y Pokemon en React</h1>
            <nav>
              <NavLink to="/registro" className={({ isActive }) => (isActive ? 'active-tab' : '')}>Registro</NavLink>
              <NavLink to="/pokemon" className={({ isActive }) => (isActive ? 'active-tab' : '')}>Buscador</NavLink>
              <NavLink to="/inventario" className={({ isActive }) => (isActive ? 'active-tab' : '')}>Inventario</NavLink>
            </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/registro" replace />} />
            <Route path="/registro" element={<RegistroUsuario />} />
            <Route path="/pokemon" element={<BuscadorPokemon />} />
            <Route path="/inventario" element={<InventarioPokemon />} />
          </Routes>
        </main>
        </BrowserRouter>
    </PokemonProvider>
  );
}

export default App;