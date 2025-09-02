import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

type Credencial = {
  id: number;
  servicio: string;
  usuario: string;
  notas: string;
};

export default function DashboardPage() {
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCredenciales = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/credenciales", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setCredenciales(res.data);
      } catch (err: any) {
        setError("No se pudieron cargar las credenciales");
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        }
      }
    };
    fetchCredenciales();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Credenciales</h1>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </div>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="grid gap-4">
        {credenciales.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded shadow">
            <div className="font-bold">{c.servicio}</div>
            <div>Usuario: {c.usuario}</div>
            <div>Notas: {c.notas}</div>
            {/* Aquí puedes agregar botón para copiar contraseña */}
          </div>
        ))}
      </div>
    </div>
  );
} 