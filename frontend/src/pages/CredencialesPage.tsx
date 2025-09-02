import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

type Credencial = {
  id: number;
  servicio: string;
  usuario: string;
  contraseña_encriptada?: string;
  notas: string;
};

export default function CredencialesPage() {
  const [servicio, setServicio] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [notas, setNotas] = useState("");
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const fetchCredenciales = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/credenciales", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCredenciales(res.data);
    } catch (err: any) {
      setError("No se pudieron cargar las credenciales");
    }
  };

  useEffect(() => {
    fetchCredenciales();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await axios.post(
        "http://localhost:4000/api/credenciales",
        { servicio, usuario, contraseña, notas },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setMensaje("Credencial guardada correctamente");
      setServicio("");
      setUsuario("");
      setContraseña("");
      setNotas("");
      fetchCredenciales();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al guardar credencial");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Agregar nueva credencial</h2>
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded shadow">
        {error && <div className="mb-2 text-red-500">{error}</div>}
        {mensaje && <div className="mb-2 text-green-600">{mensaje}</div>}
        <input
          type="text"
          placeholder="Servicio"
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Guardar
        </button>
      </form>

      <h2 className="text-xl font-bold mb-2">Credenciales guardadas</h2>
      <div className="space-y-2">
        {credenciales.map((c) => (
          <div key={c.id} className="bg-gray-100 p-3 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-bold">{c.servicio}</div>
              <div>Usuario: {c.usuario}</div>
              <div>Notas: {c.notas}</div>
            </div>
            {/* Aquí podrías agregar un botón para mostrar/copiar la contraseña */}
          </div>
        ))}
      </div>
    </div>
  );
}