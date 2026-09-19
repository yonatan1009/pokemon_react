import React, { useState } from 'react';
import {usePokemon, type PokemonTarjeta } from '../context/PokemonContext'
import { useNavigate } from 'react-router-dom';
interface EvolucionPokemon {
    name: string;
    image: string | null;
}

interface NodoEvolucion {
    species: { name: string; url: string };
    evolves_to: NodoEvolucion[];
}

interface DetallesPokemon {
    height: number;
    weight: number;
    abilities: string[];
    moves: string[];
    stats: { name: string; value: number }[];
    evoluciones: EvolucionPokemon[];
}

export const BuscadorPokemon: React.FC = () =>{

    const { entrenadorActivo, guardarPokemonMochila } = usePokemon();

    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [pokemonActual, setPokemonActual] = useState<PokemonTarjeta | null>(null);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);
    const [detallesPokemon, setDetallesPokemon] = useState<DetallesPokemon | null>(null);

    const buscarPokemon = async (e: React.FormEvent) => {
        e.preventDefault();

        const query = busqueda.trim().toLowerCase();

        if(!query) return;

        setCargando(true);
        setMensajeError(null);

        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
            if(!res.ok) throw new Error('Auxilio, Socorro, no hay Pokemon');

            const datos = await res.json();
            setPokemonActual({
                id: datos.id,
                name: datos.name.toUpperCase(),
                image: datos.sprites.front_default,
                type: datos.types[0].type.name,
                baseExperience: datos.base_experience,
                esFavorito: false
            });

            const detallesBase = {
                height: datos.height / 10,
                weight: datos.weight / 10,
                abilities: datos.abilities.map((habilidad: { ability: { name: string } }) => habilidad.ability.name),
                moves: datos.moves.map((movimiento: { move: { name: string } }) => movimiento.move.name),
                stats: datos.stats.map((estadistica: { base_stat: number; stat: { name: string } }) => ({
                    name: estadistica.stat.name,
                    value: estadistica.base_stat,
                })),
            };

            setDetallesPokemon({
                ...detallesBase,
                evoluciones: [],
            });

            try {
                const especieRes = await fetch(datos.species.url);
                if (!especieRes.ok) throw new Error('No se pudo cargar la especie');
                const especie = await especieRes.json();
                const cadenaRes = await fetch(especie.evolution_chain.url);
                if (!cadenaRes.ok) throw new Error('No se pudo cargar la cadena evolutiva');
                const cadena = await cadenaRes.json();
                const especiesEvolutivas: { name: string; url: string }[] = [];
                const recorrerEvoluciones = (etapa: NodoEvolucion) => {
                    especiesEvolutivas.push(etapa.species);
                    etapa.evolves_to.forEach(recorrerEvoluciones);
                };
                recorrerEvoluciones(cadena.chain);

                const evoluciones = await Promise.all(
                    especiesEvolutivas.map(async (evolucion) => {
                        const evolucionRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolucion.name}`);
                        const evolucionDatos = evolucionRes.ok ? await evolucionRes.json() : null;
                        return {
                            name: evolucion.name,
                            image: evolucionDatos?.sprites.front_default ?? null,
                        };
                    }),
                );
                setDetallesPokemon({ ...detallesBase, evoluciones });
            } catch {
                // El resultado principal sigue disponible aunque falle una consulta secundaria.
            }
        } catch (error: any) {
            setPokemonActual(null);
            setDetallesPokemon(null);
            setMensajeError(error.message);
        } finally {
            setCargando(false);
        }

    };
    const clickGuardar =() =>{

        if(!entrenadorActivo){
            alert('Debes seleccionar o registrar un entrenador');
            return;
        }




        if(pokemonActual){
            guardarPokemonMochila(pokemonActual);
            alert(`El Pokemon ${pokemonActual.name} es guardado en la mochila de ${entrenadorActivo?.nombreCompleto}`);
            navigate("/inventario");
    }
    }



return(
<div className="buscador-container">
    <div>
        {entrenadorActivo ? (
            <p>Mochila Activa de: <strong>{entrenadorActivo.nombreCompleto}</strong></p>
        ) : (
            <p>No hay entrenador Activo. Ve al formulario de Registro para activarlo, socio.</p>
        )}
    </div><form onSubmit={buscarPokemon} className='buscador-form'>
            <div className="campo-busqueda">
                <label>Buscar Pokemon</label>
                <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}></input>
            </div>
            <button type='submit' className="btn-buscar" disabled={cargando}> {cargando ? 'Escaneando...' : 'Buscar'}
            </button>
        </form>


      {mensajeError && (
        <p className='buscador-error'>{mensajeError}</p>
      )}

            {pokemonActual && detallesPokemon &&(
        <div className="pokemon-result-layout">
            <div className="pokemon-card">
        <h3>{pokemonActual.name}</h3>
        <img src={pokemonActual.image}></img>
        <p>
            Elemento: {''}
            <span style={{
                backgroundColor:
                    pokemonActual.type === 'fire' ? '#ff0000' : 
                    pokemonActual.type === 'water' ? '#3cb7e7' :
                    pokemonActual.type === 'grass' ? '#3ce775' :
                    pokemonActual.type === 'electric' ? '#f0e440' : '#9367d8',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '10px',
                border: '2px solid #ececec',
            }}>
                {pokemonActual.type.toLocaleUpperCase()}

            </span>
        </p>
        <p>Experiencia Base: <strong>{pokemonActual.baseExperience}</strong></p>
        <button type="button" className="btn-capturar" onClick={clickGuardar} disabled={!entrenadorActivo}>
            Guardar en la Mochila</button>

            </div>
            <aside className="pokemon-details" aria-label={`Detalles de ${pokemonActual.name}`}>
                <h3>Datos de la Pokédex</h3>
                <div className="pokemon-facts">
                    <p><strong>Altura:</strong> {detallesPokemon.height} m</p>
                    <p><strong>Peso:</strong> {detallesPokemon.weight} kg</p>
                    <p><strong>Habilidades:</strong> {detallesPokemon.abilities.join(', ')}</p>
                      <p><strong>Movimientos:</strong> {detallesPokemon.moves.length}</p>
                </div>
                <h4>Estadísticas base</h4>
                <div className="pokemon-stats">
                    {detallesPokemon.stats.map((estadistica) => (
                        <div className="stat-row" key={estadistica.name}>
                            <span>{estadistica.name.replace('-', ' ')}</span>
                            <strong>{estadistica.value}</strong>
                        </div>
                    ))}
                </div>
                <details className="pokemon-moves">
                    <summary>Ver movimientos</summary>
                    <p>{detallesPokemon.moves.join(', ')}</p>
                </details>
                <h4>Evoluciones</h4>
                <div className="evolution-list">
                    {detallesPokemon.evoluciones.map((evolucion) => (
                        <div className="evolution-item" key={evolucion.name}>
                            {evolucion.image && <img src={evolucion.image} alt={evolucion.name} />}
                            <span>{evolucion.name}</span>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
)}
</div>
);

};