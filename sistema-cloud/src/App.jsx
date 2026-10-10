import { useEffect, useMemo, useState } from 'react';
import Login from './Login.jsx';

const API = '/.netlify/functions/productos';
const VACIO = { nombre: '', precio: '', categoria: '', stock: '' };

export default function App() {
  const [auth, setAuth] = useState(sessionStorage.getItem('auth') === '1');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [aEliminar, setAEliminar] = useState(null);

  const aviso = (texto, tipo = 'ok') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(null), 3000);
  };

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await fetch(API);
      if (!r.ok) throw new Error();
      setItems(await r.json());
    } catch {
      aviso('No se pudieron cargar los registros', 'error');
    }
    setCargando(false);
  };

  useEffect(() => { if (auth) cargar(); }, [auth]);

  const login = () => { sessionStorage.setItem('auth', '1'); setAuth(true); };
  const logout = () => { sessionStorage.removeItem('auth'); setAuth(false); };

  const guardar = async (e) => {
    e.preventDefault();
    const ok = form.nombre.trim() && form.categoria.trim() &&
      form.precio !== '' && Number(form.precio) >= 0 &&
      form.stock !== '' && Number.isInteger(Number(form.stock)) && Number(form.stock) >= 0;
    if (!ok) return aviso('Completa todos los campos con valores válidos', 'error');
    try {
      const r = await fetch(editId ? `${API}/${editId}` : API, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      aviso(editId ? 'Registro actualizado' : 'Registro creado');
      setForm(VACIO);
      setEditId(null);
      cargar();
    } catch {
      aviso('Error al guardar', 'error');
    }
  };

  const editar = (p) => {
    setEditId(p.id);
    setForm({ nombre: p.nombre, precio: p.precio, categoria: p.categoria, stock: p.stock });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async () => {
    try {
      const r = await fetch(`${API}/${aEliminar}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      aviso('Registro eliminado');
      cargar();
    } catch {
      aviso('Error al eliminar', 'error');
    }
    setAEliminar(null);
  };

  const filtrados = useMemo(
    () => items.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [items, busqueda]
  );

  if (!auth) return <Login onLogin={login} />;

  return (
    <div className="container">
      <header>
        <h1>📦 Sistema de Productos</h1>
        <button className="sec" onClick={logout}>Cerrar sesión</button>
      </header>

      {msg && <div className={`toast ${msg.tipo}`}>{msg.texto}</div>}

      <form className="card form" onSubmit={guardar}>
        <h2>{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
        <div className="grid">
          <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <input placeholder="Precio" type="number" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
          <input placeholder="Categoría" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
          <input placeholder="Stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <div className="row">
          <button type="submit">{editId ? 'Guardar cambios' : 'Agregar'}</button>
          {editId && <button type="button" className="sec" onClick={() => { setEditId(null); setForm(VACIO); }}>Cancelar</button>}
        </div>
      </form>

      <div className="card">
        <div className="bar">
          <input placeholder="🔎 Buscar por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <strong>Total de registros: {filtrados.length}</strong>
        </div>
        {cargando ? <p>Cargando...</p> : (
          <div className="scroll">
            <table>
              <thead>
                <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Stock</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td><td>{p.nombre}</td><td>${p.precio.toLocaleString()}</td>
                    <td>{p.categoria}</td><td>{p.stock}</td>
                    <td className="acc">
                      <button className="sec" onClick={() => editar(p)}>Editar</button>
                      <button className="del" onClick={() => setAEliminar(p.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {!filtrados.length && <tr><td colSpan="6">Sin registros</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {aEliminar && (
        <div className="modal">
          <div className="card">
            <p>¿Deseas eliminar este registro?</p>
            <div className="row">
              <button className="sec" onClick={() => setAEliminar(null)}>Cancelar</button>
              <button className="del" onClick={eliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
