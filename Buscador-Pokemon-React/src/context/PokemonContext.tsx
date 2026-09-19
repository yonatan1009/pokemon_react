import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Usuario {
    id: number;
    nombreCompleto: string;
    genero: 'masculino' | 'femenino';
};

export interface PokemonTarjeta {
    id: number;
    name: string;
    image: string;
    type: string;
    baseExperience: string;
    esFavorito?: boolean;
};

interface PokemonContextType {
    entrenadores : Usuario[];
    entrenadorActivo : Usuario | null;
    mochilaActual : PokemonTarjeta[];
    seleccionarEntrenador : (usuario: Usuario) => void; 
    resgistrarEntrenador : (usuario: Usuario) => void;
    guardarPokemonMochila : (pokemon : PokemonTarjeta) => void;
    actualizarFavorito : (pokemonId : number) => void;
    eliminarPokemon : (pokemonId : number ) => void;
};
const PokemonContext = createContext<PokemonContextType | undefined> (undefined);

export const PokemonProvider : React.FC<{ children : React.ReactNode}> = ({ children }) => {
    const [entrenadores,setEntrenadores] = useState<Usuario[]>([]);
    const [entrenadorActivo,setEntrenadorActivo] = useState<Usuario | null>(null);
    const [mochilaActual,setMochilaActual] = useState<PokemonTarjeta[]>([]); 

    useEffect(()=>{
        const data = localStorage.getItem('lista_entrenadores')
        if(data){
            const listaGuardada = JSON.parse(data) as Partial<Usuario>[];
            const lista: Usuario[] = listaGuardada.map((usuario) => ({
                id: usuario.id ?? Date.now(),
                nombreCompleto: usuario.nombreCompleto ?? 'Entrenador sin nombre',
                genero: usuario.genero ?? 'masculino',
            }));
            setEntrenadores(lista);
            localStorage.setItem('lista_entrenadores', JSON.stringify(lista));

            const idActivo = localStorage.getItem('entrenador_activo_id');
            if(idActivo){
                const encontrado =lista.find(u => u.id.toString()=== idActivo);
                if(encontrado) seleccionarEntrenador(encontrado);
            }
        }
    },[]);

    const cargarMochilaEntrenador = (usuarioId:number) =>{
        const data = localStorage.getItem(`mochila_${usuarioId}`);
        setMochilaActual(data ? JSON.parse(data) : []);
    };

    const seleccionarEntrenador =(usuario: Usuario) =>{
        setEntrenadorActivo(usuario);
        localStorage.setItem('entrenador_activo_id', usuario.id.toString());
        cargarMochilaEntrenador(usuario.id);
    };

    const resgistrarEntrenador = (nuevoUsuario : Usuario) =>{
        const actualizados = [...entrenadores, nuevoUsuario];
        setEntrenadores(actualizados);
        localStorage.setItem('lista_entrenadores',JSON.stringify(actualizados));
        seleccionarEntrenador(nuevoUsuario);
    };
    const guardarPokemonMochila = (pokemon: PokemonTarjeta) =>{

        if(!entrenadorActivo) return;

        const clave = `mochila_${entrenadorActivo.id}`;
        const data = localStorage.getItem(clave);
        const mochilaBD: PokemonTarjeta[] = data? JSON.parse(data): [];
        const nuevoPokemon = {...pokemon,esFavorito: false
        };

        const actualizada = [...mochilaBD,nuevoPokemon
        ];

        localStorage.setItem(clave,JSON.stringify(actualizada)
        );
        setMochilaActual(actualizada);
    };

    const actualizarFavorito = (pokemonId: number) =>{
        if(!entrenadorActivo) return;
        const actualizada = mochilaActual.map(p => p.id === pokemonId ? {...p, esFavorito: !p.esFavorito} : p);
        setMochilaActual(actualizada);
        localStorage.setItem(`mochila_${entrenadorActivo.id}`, JSON.stringify(actualizada));
    };

    const eliminarPokemon =(pokemonId: number) => {
        if(!entrenadorActivo) return;
        const filtrado = mochilaActual.filter(p => p.id !== pokemonId);
        setMochilaActual(filtrado);
        localStorage.setItem(`mochila_${entrenadorActivo.id}`, JSON.stringify(filtrado));
    };

    return (
        <PokemonContext.Provider value={{
            entrenadores,
            entrenadorActivo,
            mochilaActual,
            seleccionarEntrenador,
            resgistrarEntrenador,
            guardarPokemonMochila,
            actualizarFavorito,
            eliminarPokemon
        }}>
            { children }
        </PokemonContext.Provider>

    );
};

export const usePokemon = () => {
    const context = useContext(PokemonContext);
    if(!context) throw new Error('usePokemon debe usarse en un Provider');
    return context;
};
