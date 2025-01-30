import { useQueryClient } from '@tanstack/react-query';

export default function AdminNavegation() {
    const QueryClient = useQueryClient()

    const logout = () => {
        localStorage.removeItem('AUTH_TOKEN')
        QueryClient.invalidateQueries({queryKey: ['user']})
    }
    
    return (
        <button
            className=" bg-lime-500 p-2 text-slate-800 uppercase font-black text-xs rounded-lg cursor-pointer"
            onClick={logout}
        >
            Cerrar Sesión
        </button>
    )
}
