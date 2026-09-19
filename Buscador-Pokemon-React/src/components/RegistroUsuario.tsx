import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePokemon, type Usuario } from '../context/PokemonContext';

export const RegistroUsuario: React.FC = () => {
  const { entrenadores, entrenadorActivo, resgistrarEntrenador, seleccionarEntrenador } = usePokemon();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState<'masculino' | 'femenino'>('masculino');

  const eventoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevo: Usuario = {
        id: Date.now(),
      nombreCompleto: nombre.trim(),
        genero,
    };

    resgistrarEntrenador(nuevo);
    navigate('/pokemon');
  };

  return (
    <div className="registro-container">
      <header>
        <h2>Registro de Entrenadores</h2>
      </header>

      <div className="registro-form-wrapper">
        <form id="FormularioRegistro" className="registro-form" action="#" onSubmit={eventoSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre del entrenador:</label>
              <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} name="nombre" placeholder="Ash" required />
            </div>
          </div>

          <div className="form-group">
            <label>Tipo de entrenador:</label>
            <div className="genero-selector" role="radiogroup" aria-label="Tipo de entrenador">
              <button type="button" className={`opcion-genero ${genero === 'masculino' ? 'seleccionado' : ''}`} onClick={() => setGenero('masculino')} aria-pressed={genero === 'masculino'}>
                <img src="/entrenador.png" alt="Entrenador" />
                <span>Entrenador</span>
              </button>
              <button type="button" className={`opcion-genero ${genero === 'femenino' ? 'seleccionado' : ''}`} onClick={() => setGenero('femenino')} aria-pressed={genero === 'femenino'}>
                <img src="/entrenadora.png" alt="Entrenadora" />
                <span>Entrenadora</span>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Enviar Registro
          </button>
        </form>
      </div>

      {entrenadores.length > 0 && (
        <div className="seccion-cambiar-entrenador">
          <h3>Cambiar entrenador</h3>
          <div className="listas-entrenadores">
            <div className="lista-entrenadores-grupo">
              <h4>Entrenadores</h4>
              <div className="lista-entrenadores">
                {entrenadores.filter((user) => user.genero === 'masculino').map((user) => (
                  <button key={user.id} type="button" className={`btn-entrenador-opcion ${entrenadorActivo?.id === user.id ? 'activo' : ''}`} onClick={() => seleccionarEntrenador(user)}>
                    {user.nombreCompleto}
                  </button>
                ))}
              </div>
            </div>
            <div className="lista-entrenadores-grupo">
              <h4>Entrenadoras</h4>
              <div className="lista-entrenadores">
                {entrenadores.filter((user) => user.genero === 'femenino').map((user) => (
                  <button key={user.id} type="button" className={`btn-entrenador-opcion ${entrenadorActivo?.id === user.id ? 'activo' : ''}`} onClick={() => seleccionarEntrenador(user)}>
                    {user.nombreCompleto}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};